"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PersonaProfile, Persona, DataCategory, ConfirmationThreshold } from "@/lib/types";

const ALL_CATEGORIES: { id: DataCategory; label: string; icon: string; desc: string }[] = [
  { id: "address", label: "Location & Address", icon: "📍", desc: "Home, dorm, or exact locations" },
  { id: "health", label: "Health & Medical", icon: "🏥", desc: "Conditions, medications, symptoms" },
  { id: "emotional", label: "Emotional State", icon: "💭", desc: "Anxiety, stress, mental health" },
  { id: "financial", label: "Financial", icon: "💳", desc: "Card details, income, debt" },
  { id: "academic", label: "Academic Records", icon: "🎓", desc: "Grades, GPA, academic status" },
  { id: "behavioral", label: "Behavioral Patterns", icon: "🔄", desc: "Habits, routines, preferences" },
];

const PERSONAS: {
  id: Persona;
  label: string;
  tagline: string;
  desc: string;
  defaults: DataCategory[];
  color: string;
  activeClass: string;
  badge: string;
}[] = [
  {
    id: "conservative",
    label: "Conservative",
    tagline: "Maximum protection",
    desc: "Nora blocks everything sensitive — exact locations, all health signals, emotional states, financial hints, and behavioral patterns. Best for maximum privacy.",
    defaults: ["address", "health", "emotional", "financial", "academic", "behavioral"],
    color: "purple",
    activeClass: "border-purple-500 bg-purple-900/20 ring-2 ring-purple-500/30",
    badge: "bg-purple-900/40 text-purple-300",
  },
  {
    id: "balanced",
    label: "Balanced",
    tagline: "Smart filtering",
    desc: "Blocks clearly sensitive data — exact addresses, explicit health conditions — but allows general area and mild context. Best for everyday use.",
    defaults: ["address", "health", "financial"],
    color: "blue",
    activeClass: "border-blue-500 bg-blue-900/20 ring-2 ring-blue-500/30",
    badge: "bg-blue-900/40 text-blue-300",
  },
  {
    id: "open",
    label: "Open",
    tagline: "Minimal friction",
    desc: "Only blocks dangerous disclosures — explicit medical conditions, exact home address, raw financial details. Best when you need full AI context.",
    defaults: ["address", "health"],
    color: "green",
    activeClass: "border-green-500 bg-green-900/20 ring-2 ring-green-500/30",
    badge: "bg-green-900/40 text-green-300",
  },
];

const CONFIRMATION_OPTIONS: { id: ConfirmationThreshold; label: string; desc: string }[] = [
  { id: "always", label: "Always ask me", desc: "Nora pauses and shows you every detected item before proceeding" },
  { id: "high-risk", label: "Only for high-risk data", desc: "Auto-protect low/medium risk, but ask before sharing high-risk items" },
  { id: "never", label: "Auto-protect silently", desc: "Nora protects everything automatically without interrupting you" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [persona, setPersona] = useState<Persona>("conservative");
  const [blocked, setBlocked] = useState<DataCategory[]>(["address", "health", "emotional", "financial", "academic", "behavioral"]);
  const [threshold, setThreshold] = useState<ConfirmationThreshold>("high-risk");
  const [saving, setSaving] = useState(false);

  function pickPersona(p: Persona) {
    setPersona(p);
    const found = PERSONAS.find((x) => x.id === p);
    if (found) setBlocked(found.defaults);
  }

  function toggleCategory(cat: DataCategory) {
    setBlocked((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function finish() {
    setSaving(true);
    const profile: PersonaProfile = {
      name: name.trim() || "You",
      persona,
      blockedCategories: blocked,
      confirmationThreshold: threshold,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("nora_profile", JSON.stringify(profile));
    router.push("/dashboard");
  }

  const selectedPersona = PERSONAS.find((p) => p.id === persona)!;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-100 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-purple-700 flex items-center justify-center">
            <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-bold text-sm">Nora</span>
        </div>
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-8 h-1.5 rounded-full transition-all ${
                s <= step ? "bg-purple-500" : "bg-[#2a2a2a]"
              }`}
            />
          ))}
          <span className="text-xs text-gray-600 ml-2">{step} / 3</span>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {/* ── Step 1: Identity ── */}
          {step === 1 && (
            <div className="animate-fade-in">
              <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest mb-3">Step 1 — Identity</p>
              <h2 className="text-3xl font-bold mb-2">Who is Nora protecting?</h2>
              <p className="text-gray-400 text-sm mb-8">
                This is stored only in your browser. Nora never sends your name anywhere.
              </p>

              <label className="block mb-2 text-sm font-medium text-gray-300">Your name (or alias)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex, Anonymous, or leave blank"
                className="w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] text-gray-100 px-4 py-3 text-sm outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/30 mb-8 placeholder-gray-700"
                onKeyDown={(e) => e.key === "Enter" && setStep(2)}
              />

              <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-4 mb-8">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Why Nora exists</p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  AI systems complete tasks on your behalf — but they often share more data than necessary.
                  Nora acts as an intelligent control layer, enforcing your privacy boundaries automatically.
                </p>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-semibold text-sm transition-all"
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── Step 2: Persona ── */}
          {step === 2 && (
            <div className="animate-fade-in">
              <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest mb-3">Step 2 — Privacy Persona</p>
              <h2 className="text-3xl font-bold mb-2">How private do you want to be?</h2>
              <p className="text-gray-400 text-sm mb-8">
                Your persona is your default ruleset. You can change it any time from the dashboard.
              </p>

              <div className="space-y-3 mb-8">
                {PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => pickPersona(p.id)}
                    className={`w-full text-left rounded-xl border p-4 transition-all ${
                      persona === p.id ? p.activeClass : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <span className="font-semibold text-gray-200">{p.label}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${p.badge}`}>{p.tagline}</span>
                      </div>
                      {persona === p.id && (
                        <svg className="h-4 w-4 text-purple-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {p.defaults.map((cat) => (
                        <span key={cat} className="text-xs px-1.5 py-0.5 rounded bg-[#252525] text-gray-500 capitalize">{cat}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-5 py-3 rounded-lg border border-[#2a2a2a] text-gray-400 hover:text-gray-200 text-sm font-medium transition-colors">
                  ← Back
                </button>
                <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-semibold text-sm transition-all">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Fine-tune ── */}
          {step === 3 && (
            <div className="animate-fade-in">
              <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest mb-3">Step 3 — Fine-Tune</p>
              <h2 className="text-3xl font-bold mb-2">Customize your protection</h2>
              <p className="text-gray-400 text-sm mb-6">
                These settings override your base persona for specific data types.
              </p>

              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Data categories to block</p>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_CATEGORIES.map((cat) => {
                    const on = blocked.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                          on
                            ? "border-purple-700/60 bg-purple-900/20 text-gray-200"
                            : "border-[#2a2a2a] bg-[#1a1a1a] text-gray-500 hover:border-gray-600"
                        }`}
                      >
                        <span className="text-base">{cat.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{cat.label}</p>
                          <p className="text-xs text-gray-600 truncate">{cat.desc}</p>
                        </div>
                        <div className={`ml-auto w-4 h-4 rounded-full flex-shrink-0 border flex items-center justify-center ${on ? "bg-purple-600 border-purple-500" : "border-gray-700"}`}>
                          {on && (
                            <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-8">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Confirmation preference</p>
                <div className="space-y-2">
                  {CONFIRMATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setThreshold(opt.id)}
                      className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-all ${
                        threshold === opt.id
                          ? "border-purple-700/60 bg-purple-900/20"
                          : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-gray-600"
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${threshold === opt.id ? "bg-purple-600 border-purple-500" : "border-gray-600"}`}>
                        {threshold === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-200">{opt.label}</p>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="px-5 py-3 rounded-lg border border-[#2a2a2a] text-gray-400 hover:text-gray-200 text-sm font-medium transition-colors">
                  ← Back
                </button>
                <button
                  onClick={finish}
                  disabled={saving}
                  className="flex-1 py-3 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Activating Nora…
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Activate Nora →
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
