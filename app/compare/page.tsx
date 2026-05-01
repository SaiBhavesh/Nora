"use client";

import { useState } from "react";
import Link from "next/link";

interface PersonaResult {
  sensitive_detected: { text: string; type: string; risk: string; reasoning?: string }[];
  rewritten_message: string;
  protection_score: number;
  persona_impact: string;
}

interface CompareResult {
  conservative: PersonaResult;
  balanced: PersonaResult;
  open: PersonaResult;
}

const PERSONA_META = {
  conservative: {
    label: "Conservative",
    color: "purple",
    border: "border-purple-700/50",
    bg: "bg-purple-950/20",
    badge: "bg-purple-900/40 text-purple-300 border-purple-800",
    score: "text-purple-400",
    icon: "🛡️",
  },
  balanced: {
    label: "Balanced",
    color: "blue",
    border: "border-blue-700/50",
    bg: "bg-blue-950/20",
    badge: "bg-blue-900/40 text-blue-300 border-blue-800",
    score: "text-blue-400",
    icon: "⚖️",
  },
  open: {
    label: "Open",
    color: "green",
    border: "border-green-700/50",
    bg: "bg-green-950/20",
    badge: "bg-green-900/40 text-green-300 border-green-800",
    score: "text-green-400",
    icon: "🔓",
  },
} as const;

const RISK_COLORS: Record<string, string> = {
  high: "border-red-800 bg-red-950/30 text-red-300",
  medium: "border-orange-800 bg-orange-950/30 text-orange-300",
  low: "border-yellow-800 bg-yellow-950/30 text-yellow-300",
};

const EXAMPLE_MESSAGES = [
  "I'm really anxious about midterms and I haven't been sleeping. Find me a therapist near my dorm at 915 Castle Point Terrace, Hoboken NJ.",
  "Book me a flight to LAX on May 15th. I'm diabetic so I need special meals. Use my Amex ending in 4521. I live at 47 Willow Lane, Brooklyn.",
  "I failed my CS301 midterm with a 42% and I'm on academic probation. Can you help me write an email to Professor Smith about extra credit?",
];

function ScoreBar({ score, color }: { score: number; color: string }) {
  const colorMap: Record<string, string> = {
    purple: "bg-purple-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
  };
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-[#2a2a2a] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${colorMap[color]}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-bold text-gray-200 w-10 text-right">{score}%</span>
    </div>
  );
}

export default function ComparePage() {
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCompare() {
    if (!message.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong");
        return;
      }
      setResults(data);
    } catch {
      setError("Network error — check your connection");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-100">
      {/* Nav */}
      <div className="border-b border-[#1e1e1e] px-4 py-3 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-md bg-purple-700 flex items-center justify-center">
            <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-bold text-sm">Nora</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">Persona Comparison</span>
          <Link href="/dashboard" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-800/50 bg-purple-900/20 text-purple-300 text-xs mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Persona Comparison Mode
          </div>
          <h1 className="text-3xl font-extrabold mb-3">
            See how each persona handles the same message
          </h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Type a message and Nora runs all three privacy personas simultaneously — so you can see exactly what each persona blocks, allows, and sends to AI.
          </p>
        </div>

        {/* Input */}
        <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Your Message</span>
            <div className="flex gap-2 flex-wrap justify-end">
              {EXAMPLE_MESSAGES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setMessage(ex)}
                  className="text-xs text-purple-400 hover:text-purple-300 px-2 py-1 rounded hover:bg-purple-900/20 transition-colors"
                >
                  Example {i + 1}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Type your message naturally… e.g. I'm anxious about midterms, find a therapist near my dorm at 915 Castle Point Terrace"
            className="w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] text-gray-100 placeholder-gray-600 px-4 py-3 text-sm resize-none outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/30 mb-3"
          />
          <button
            onClick={handleCompare}
            disabled={loading || !message.trim()}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all ${
              loading || !message.trim()
                ? "bg-purple-900/30 text-purple-600 cursor-not-allowed"
                : "bg-purple-700 hover:bg-purple-600 text-white shadow-lg shadow-purple-900/40"
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Running all 3 personas simultaneously…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Compare All 3 Personas
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300 mb-6">
            {error}
          </div>
        )}

        {/* Results — 3-column grid */}
        {results && (
          <div className="animate-fade-in space-y-6">
            {/* Score summary bar */}
            <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Protection Score Comparison</p>
              <div className="space-y-3">
                {(["conservative", "balanced", "open"] as const).map((p) => (
                  <div key={p} className="flex items-center gap-3">
                    <span className="text-sm w-24 flex-shrink-0 flex items-center gap-1.5">
                      <span>{PERSONA_META[p].icon}</span>
                      <span className="font-medium text-gray-300">{PERSONA_META[p].label}</span>
                    </span>
                    <div className="flex-1">
                      <ScoreBar score={results[p].protection_score ?? 0} color={PERSONA_META[p].color} />
                    </div>
                    <span className="text-xs text-gray-600 w-20 flex-shrink-0">
                      {results[p].sensitive_detected?.length ?? 0} signal{results[p].sensitive_detected?.length !== 1 ? "s" : ""} blocked
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-persona columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["conservative", "balanced", "open"] as const).map((persona) => {
                const r = results[persona];
                const meta = PERSONA_META[persona];
                return (
                  <div key={persona} className={`rounded-xl border ${meta.border} ${meta.bg} overflow-hidden`}>
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{meta.icon}</span>
                        <span className={`text-sm font-bold capitalize`}>{meta.label}</span>
                      </div>
                      <span className={`text-lg font-extrabold ${meta.score}`}>
                        {r.protection_score ?? 0}%
                      </span>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* Signals blocked */}
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">Signals Blocked</p>
                        {r.sensitive_detected?.length > 0 ? (
                          <div className="space-y-1.5">
                            {r.sensitive_detected.map((item, i) => (
                              <div key={i} className={`text-xs px-2 py-1 rounded border ${RISK_COLORS[item.risk]}`}>
                                <span className="font-medium capitalize">{item.type}</span>
                                <span className="text-gray-500 ml-1">·</span>
                                <span className="ml-1 text-gray-400 italic">"{item.text.length > 30 ? item.text.slice(0, 30) + "…" : item.text}"</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600 italic">Nothing blocked</p>
                        )}
                      </div>

                      {/* What AI receives */}
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wider mb-1.5">What AI Receives</p>
                        <p className="text-xs font-mono text-gray-400 bg-[#111] rounded px-3 py-2 border border-[#2a2a2a] italic leading-relaxed">
                          "{r.rewritten_message || message}"
                        </p>
                      </div>

                      {/* Impact */}
                      {r.persona_impact && (
                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Impact</p>
                          <p className="text-xs text-gray-400">{r.persona_impact}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Try in dashboard CTA */}
            <div className="text-center pt-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-semibold text-sm transition-all"
              >
                Apply a persona in the dashboard →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
