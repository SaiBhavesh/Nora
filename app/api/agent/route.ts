import { NextRequest, NextResponse } from "next/server";
import {
  Persona, DataCategory, RawAgentStep, AgentStep,
  AgentTrace, AgentTraceSummary, AgentVerdict,
} from "@/lib/types";
import {
  THIRD_PARTY_REGISTRY, SERVICE_ALTERNATIVES,
  getServiceRisk,
} from "@/lib/thirdPartyRegistry";
import {
  AgentInputSchema,
  AgentOutputSchema,
  parseOrThrow,
  RawAgentStepSchema,
  SchemaError,
} from "@/lib/schemas";
import {
  getPolicy,
  policyAsPromptData,
  sensitiveCategoriesFor,
  shouldBlockService,
} from "@/lib/policy/personas";
import { z } from "zod";

const SERVICE_KEYS = Object.keys(THIRD_PARTY_REGISTRY).join(", ");
const PERSONA_RANK: Record<Persona, number> = {
  open: 0,
  balanced: 1,
  conservative: 2,
};

const ESCALATION_KEYWORDS = [
  "mental health",
  "therapist",
  "therapy",
  "counseling",
  "health center",
  "clinic",
  "medication",
  "prescription",
  "adhd",
  "depression",
  "anxiety",
  "crisis",
  "debt",
  "financial aid",
  "insurance",
];

function detectAutoPersona(goal: string, current: Persona): { persona: Persona; reason?: string } {
  const normalized = goal.toLowerCase();
  const matched = ESCALATION_KEYWORDS.find((keyword) => normalized.includes(keyword));

  if (matched && PERSONA_RANK[current] < PERSONA_RANK.conservative) {
    return {
      persona: "conservative",
      reason: `Nora detected sensitive context: "${matched}". Persona auto-elevated to Conservative for this task.`,
    };
  }

  return { persona: current };
}

function buildAgentPrompt(persona: Persona): string {
  return `You are a task decomposition agent for an autonomous AI system. Given a user's high-level goal, break it into 4-6 concrete sub-actions the agent would take to complete it. Be realistic and specific about what data each step accesses.

Available third-party services (use ONLY these keys exactly): ${SERVICE_KEYS}

Data categories (use ONLY these): address, health, emotional, financial, academic, behavioral

Return ONLY valid JSON - no markdown, no explanation:
{
  "goal_summary": "one-line summary of what the user wants to accomplish",
  "steps": [
    {
      "id": 1,
      "action": "Short action title (5-8 words)",
      "description": "What this sub-action does and why it's needed",
      "data_categories": ["behavioral"],
      "data_details": "The specific personal data this step accesses or exposes",
      "third_party": "none",
      "exposed_data": "Exactly what data would be sent to the third party without any privacy protection",
      "inferred_risk": "Optional: if this step reveals a sensitive category indirectly (e.g. searching insulin prices implies diabetes diagnosis) - leave empty string if not applicable"
    }
  ]
}

Rules:
- Steps must be sequential and logical
- data_categories must be an array of valid categories (can be empty [])
- third_party must be exactly one key from the available services list
- exposed_data should be specific (e.g. "Full name, home address at 42 Main St, payment card ending 4411")
- inferred_risk should flag indirect exposure (searching symptoms implies likely condition)
- Make the scenario realistic for a university student

Active persona policy (data, not prose — observe these for downstream governance):
${policyAsPromptData(persona)}`;
}

function computeVerdict(
  step: RawAgentStep,
  persona: Persona,
): { verdict: AgentVerdict; nora_action: string; alternative_service?: string; minimized_data?: string } {
  const policy = getPolicy(persona);
  const serviceKey = step.third_party || "none";
  const service = getServiceRisk(serviceKey);
  const serviceBlocked = shouldBlockService(persona, service.riskLevel);
  const altKey = SERVICE_ALTERNATIVES[serviceKey];

  if (serviceBlocked) {
    const altService = altKey ? THIRD_PARTY_REGISTRY[altKey] : null;
    return {
      verdict: altService ? "negotiated" : "blocked",
      nora_action: altService
        ? `Blocked ${service.name} (${service.riskLevel.toUpperCase()} risk: ${service.notes ?? "data sharing risk exceeds persona"}). Rerouted to ${altService.name} - same task, lower exposure.`
        : `Blocked ${service.name} - ${service.riskLevel.toUpperCase()} risk exceeds ${policy.label} persona threshold. ${service.notes ?? ""} Task cannot complete via this channel.`,
      alternative_service: altKey,
    };
  }

  const sensitiveCats = new Set(sensitiveCategoriesFor(persona));
  const hasSensitiveData = step.data_categories.length > 0;
  const sensitiveForPersona = step.data_categories.filter((c) => sensitiveCats.has(c));

  if (hasSensitiveData && sensitiveForPersona.length > 0) {
    const removed = sensitiveForPersona.join(", ");
    return {
      verdict: "intercepted",
      nora_action: `Detected: ${removed} data. Minimized to minimum necessary - stripped identifying details, generalized location, anonymized request. Task completes with reduced exposure.`,
      minimized_data: `Anonymized request sent - ${removed} data removed before leaving device.`,
    };
  }

  if (
    step.inferred_risk &&
    step.inferred_risk.trim().length > 0 &&
    policy.inferenceProtection
  ) {
    return {
      verdict: "intercepted",
      nora_action: `Inference risk detected: ${step.inferred_risk}. Request generalized to prevent revealing sensitive status indirectly.`,
      minimized_data: "Query generalized to avoid implicit disclosure.",
    };
  }

  return {
    verdict: "clean",
    nora_action: "No sensitive data or high-risk services detected. Passed through unchanged.",
  };
}

function buildCampusHealthDemoTrace(goal: string, persona: Persona, autoReason?: string): AgentTrace {
  const rawSteps: RawAgentStep[] = [
    {
      id: 1,
      action: "Search health center hours",
      description: "Find public campus health center hours and appointment options.",
      data_categories: [],
      data_details: "No personal data required.",
      third_party: "none",
      exposed_data: "No personal data sent.",
      inferred_risk: "",
    },
    {
      id: 2,
      action: "Check calendar availability",
      description: "Look for free blocks that fit clinic hours.",
      data_categories: ["behavioral"],
      data_details: "Class schedule, free time, and recurring appointment patterns.",
      third_party: "none",
      exposed_data: "Calendar availability and behavioral schedule patterns.",
      inferred_risk: "A health-center visit combined with recurring free blocks can imply health needs and routine.",
    },
    {
      id: 3,
      action: "Prepare appointment request",
      description: "Create a minimal booking request for the campus health portal.",
      data_categories: ["health", "academic"],
      data_details: "Student status plus a general request for a health center visit.",
      third_party: "campus_health_portal",
      exposed_data: "Student status and appointment reason sent to the campus health portal.",
      inferred_risk: "Booking at the health center can reveal a sensitive care-seeking context even without a diagnosis.",
    },
    {
      id: 4,
      action: "Request ride to clinic",
      description: "Call a ride service to transport the student to the health center.",
      data_categories: ["address", "behavioral", "financial"],
      data_details: "Pickup location, destination, ride time, payment token, and trip purpose.",
      third_party: "lyft",
      exposed_data: "Pickup location, campus health destination, ride time, payment token, and visit pattern sent to Lyft.",
      inferred_risk: "A ride to the health center can reveal medical behavior to a third party.",
    },
    {
      id: 5,
      action: "Send final confirmation",
      description: "Show the student a privacy receipt before any booking or ride action proceeds.",
      data_categories: ["behavioral"],
      data_details: "Task summary and approval decision.",
      third_party: "none",
      exposed_data: "No third-party data sent until the student confirms.",
      inferred_risk: "",
    },
  ];

  const steps: AgentStep[] = rawSteps.map((step) => ({ ...step, ...computeVerdict(step, persona) }));

  return {
    goal_summary: goal,
    auto_persona: persona,
    auto_persona_reason: autoReason,
    steps,
    summary: buildSummary(steps),
  };
}

function buildSummary(steps: AgentStep[]): AgentTraceSummary {
  const clean = steps.filter((s) => s.verdict === "clean").length;
  const intercepted = steps.filter((s) => s.verdict === "intercepted").length;
  const blocked = steps.filter((s) => s.verdict === "blocked").length;
  const negotiated = steps.filter((s) => s.verdict === "negotiated").length;

  const dataProtected = Array.from(
    new Set(
      steps
        .filter((s) => s.verdict === "intercepted")
        .flatMap((s) => s.data_categories)
    ),
  ) as DataCategory[];

  const thirdPartiesBlocked = Array.from(
    new Set(
      steps
        .filter((s) => s.verdict === "blocked" || s.verdict === "negotiated")
        .map((s) => {
          const svc = getServiceRisk(s.third_party);
          return svc.name;
        })
    ),
  );

  const standardExposure = Array.from(
    new Set(steps.flatMap((s) => s.data_categories))
  ) as DataCategory[];

  return {
    total_steps: steps.length,
    clean,
    intercepted,
    blocked,
    negotiated,
    data_protected: dataProtected,
    third_parties_blocked: thirdPartiesBlocked,
    standard_agent_exposure: standardExposure,
  };
}

const AgentPlanResponseSchema = z.object({
  goal_summary: z.string(),
  steps: z.array(RawAgentStepSchema),
});

export async function POST(req: NextRequest) {
  let input;
  try {
    input = parseOrThrow(AgentInputSchema, await req.json(), "agent input");
  } catch (err) {
    if (err instanceof SchemaError) {
      return NextResponse.json({ error: err.message, issues: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
  }

  const escalation = detectAutoPersona(input.goal, input.persona);
  const effectivePersona = escalation.persona;
  const isCampusHealthDemo =
    /health center|campus health|clinic|book a ride|schedule a visit/i.test(input.goal);

  const apiKeyAvailable = !!(process.env.OPENROUTER_API_KEY || process.env.ANTHROPIC_API_KEY);

  if (!apiKeyAvailable || isCampusHealthDemo) {
    const trace = buildCampusHealthDemoTrace(input.goal, effectivePersona, escalation.reason);
    return NextResponse.json(AgentOutputSchema.parse(trace));
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://nora-privacy.vercel.app",
        "X-Title": "Nora Privacy Governance",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4-5",
        messages: [
          { role: "system", content: buildAgentPrompt(effectivePersona) },
          { role: "user", content: input.goal },
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter error: ${err}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Failed to parse agent plan" }, { status: 502 });
    }

    const planValidation = AgentPlanResponseSchema.safeParse(parsedJson);
    if (!planValidation.success) {
      return NextResponse.json(
        { error: "Agent plan did not match expected schema", issues: planValidation.error.issues },
        { status: 502 }
      );
    }

    const governedSteps: AgentStep[] = planValidation.data.steps.map((step) => {
      const overlay = computeVerdict(step, effectivePersona);
      return { ...step, ...overlay };
    });

    const trace: AgentTrace = {
      goal_summary: planValidation.data.goal_summary,
      auto_persona: effectivePersona,
      auto_persona_reason: escalation.reason,
      steps: governedSteps,
      summary: buildSummary(governedSteps),
    };

    const traceValidation = AgentOutputSchema.safeParse(trace);
    if (!traceValidation.success) {
      console.error("Agent trace schema mismatch:", traceValidation.error.issues);
      return NextResponse.json(
        { error: "Agent trace schema mismatch", issues: traceValidation.error.issues },
        { status: 502 }
      );
    }
    return NextResponse.json(traceValidation.data);
  } catch {
    const trace = buildCampusHealthDemoTrace(input.goal, effectivePersona, escalation.reason);
    return NextResponse.json(AgentOutputSchema.parse(trace));
  }
}
