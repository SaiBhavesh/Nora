import { NextRequest, NextResponse } from "next/server";

const SCAN_PROMPT = `You are a privacy scanner. Analyze the message for sensitive data and return ONLY JSON:

{
  "sensitive_detected": [
    {
      "text": "exact phrase from the message",
      "type": "address | health | emotional | financial | academic | behavioral",
      "risk": "high | medium | low",
      "alternative": "short privacy-safe substitute (2-6 words)"
    }
  ]
}

Be liberal in detection — flag anything that could be sensitive in any context.
Return ONLY valid JSON. No markdown, no explanation.`;

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  if (!message?.trim() || message.trim().length < 10) {
    return NextResponse.json({ sensitive_detected: [] });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 500 });
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
        model: "anthropic/claude-haiku-4-5",
        messages: [
          { role: "system", content: SCAN_PROMPT },
          { role: "user", content: message },
        ],
        temperature: 0.1,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ sensitive_detected: [] });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

    try {
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({ sensitive_detected: parsed.sensitive_detected ?? [] });
    } catch {
      return NextResponse.json({ sensitive_detected: [] });
    }
  } catch {
    return NextResponse.json({ sensitive_detected: [] });
  }
}
