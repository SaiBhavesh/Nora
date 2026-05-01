import { NextRequest, NextResponse } from "next/server";

function buildSystemPrompt(persona: string, blockedCategories: string[]): string {
  const categoryContext = blockedCategories?.length
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
  "persona_impact": "Your ${persona} persona blocked X of Y sensitive signals"
}

Persona rules:
- conservative: block everything — exact locations, all health signals, emotional states, financial hints, behavioral patterns
- balanced: block clearly sensitive data — exact addresses, explicit health conditions, but allow general area and mild context
- open: block only dangerous disclosures — explicit medical conditions, exact home address, raw financial details

Current persona: ${persona}
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
  const { message, persona, blockedCategories } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY not configured in .env.local" },
      { status: 500 }
    );
  }

  try {
    const raw = await callAI(
      buildSystemPrompt(persona ?? "balanced", blockedCategories ?? []),
      message
    );

    if (!raw) {
      return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
    }

    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

    try {
      const parsed = JSON.parse(cleaned);
      return NextResponse.json(parsed);
    } catch {
      console.error("JSON parse failed:", cleaned);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }
  } catch (err: unknown) {
    console.error("Intercept error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
