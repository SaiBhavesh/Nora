import { NextRequest, NextResponse } from "next/server";

function buildPrompt(persona: string): string {
  return `You are Nora, a privacy governance layer. Analyze the message for the "${persona}" persona and return ONLY valid JSON:

{
  "sensitive_detected": [
    { "text": "exact phrase from message", "type": "address|health|emotional|financial|academic|behavioral", "risk": "high|medium|low", "reasoning": "brief reason" }
  ],
  "rewritten_message": "privacy-safe version of the message",
  "protection_score": 75,
  "persona_impact": "one sentence summary of what this persona blocked"
}

Persona rules:
- conservative: block everything — locations, health, emotional, financial, behavioral, academic
- balanced: block clearly sensitive — exact addresses, explicit health conditions, financial data
- open: block only dangerous — exact home address, explicit medical, raw financial details

Return ONLY valid JSON. No markdown, no backticks.`;
}

async function runPersona(message: string, persona: string): Promise<unknown> {
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
        { role: "system", content: buildPrompt(persona) },
        { role: "user", content: message },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) throw new Error(`OpenRouter error for persona ${persona}`);

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content?.trim() ?? "{}";
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  try { return JSON.parse(cleaned); } catch { return {}; }
}

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 500 });
  }

  try {
    const [conservative, balanced, open] = await Promise.all([
      runPersona(message, "conservative"),
      runPersona(message, "balanced"),
      runPersona(message, "open"),
    ]);

    return NextResponse.json({ conservative, balanced, open });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
