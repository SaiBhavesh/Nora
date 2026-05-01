import { NextRequest, NextResponse } from "next/server";
import {
  InterceptInputSchema,
  InterceptOutputSchema,
  parseOrThrow,
  SchemaError,
} from "@/lib/schemas";
import { getPolicy, policyAsPromptData } from "@/lib/policy/personas";

function buildSystemPrompt(persona: string, blockedCategories: string[]): string {
  const policy = getPolicy(persona as "conservative" | "balanced" | "open");
  const categoryContext = blockedCategories.length
    ? `The user has specifically configured these categories to be blocked: ${blockedCategories.join(", ")}.`
    : "";

  return `You are Nora, an intelligent privacy governance layer for an AI assistant used by university students.

Analyze the user's message and return ONLY a JSON object with these exact fields:

{
  "sensitive_detected": [
    {
      "text": "the exact sensitive phrase from the message",
      "type": "address | health | emotional | financial | academic | behavioral",
      "risk": "high | medium | low",
      "reasoning": "one concise sentence explaining the real-world privacy risk and what harm exposure could cause",
      "alternative": "a privacy-preserving alternative phrase that still lets the task complete (e.g. 'Hoboken, NJ area' instead of '915 Castle Point Terrace, Hoboken NJ')"
    }
  ],
  "rewritten_message": "the privacy-safe rewritten version using minimum necessary data",
  "without_sentinel_response": "a realistic 2-3 sentence response from a standard AI that explicitly references the sensitive data",
  "with_sentinel_response": "a realistic 2-3 sentence response from a privacy-safe AI using only the rewritten message",
  "protection_score": 75,
  "persona_impact": "Your ${policy.label} persona blocked X of Y sensitive signals"
}

Active persona policy (data, not prose — apply these weights and thresholds):
${policyAsPromptData(persona as "conservative" | "balanced" | "open")}

${categoryContext}

Important rules:
- sensitive_detected must contain the EXACT substring from the user's message
- alternative must be a short (2-6 word) privacy-safe substitute that preserves task intent
- Flag inferred sensitive data even when the category is not named directly: health center visits imply health context, late-night routines imply behavioral patterns, debt searches imply financial distress, medication searches imply medical status
- protection_score is a number 0-100 (not a string), calculated as: (items_protected / total_signals) * 100
- without_sentinel_response should sound helpful but clearly reference the sensitive data
- with_sentinel_response should be equally helpful without touching any blocked data
- Return ONLY valid JSON. No markdown, no backticks, no explanation.`;
}

async function callAI(system: string, message: string): Promise<string> {
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
        { role: "system", content: system },
        { role: "user", content: message },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

export async function POST(req: NextRequest) {
  let input;
  try {
    input = parseOrThrow(InterceptInputSchema, await req.json(), "intercept input");
  } catch (err) {
    if (err instanceof SchemaError) {
      return NextResponse.json({ error: err.message, issues: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
  }

  if (!process.env.OPENROUTER_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY or ANTHROPIC_API_KEY not configured in .env.local" },
      { status: 500 }
    );
  }

  try {
    const raw = await callAI(
      buildSystemPrompt(input.persona, input.blockedCategories),
      input.message
    );

    if (!raw) {
      return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
    }

    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("JSON parse failed:", cleaned);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 502 });
    }

    const validated = InterceptOutputSchema.safeParse(parsed);
    if (!validated.success) {
      console.error("Intercept output schema mismatch:", validated.error.issues);
      return NextResponse.json(
        { error: "AI response did not match expected schema", issues: validated.error.issues },
        { status: 502 }
      );
    }
    return NextResponse.json(validated.data);
  } catch (err: unknown) {
    console.error("Intercept error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
