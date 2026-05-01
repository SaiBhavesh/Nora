"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const FEATURES = [
  {
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: "Privacy Persona Engine",
    desc: "Set your comfort level once. Nora enforces it automatically on every AI interaction — conservative, balanced, or open.",
    color: "text-purple-400",
    border: "border-purple-900/40",
    bg: "bg-purple-950/20",
  },
  {
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Agentic Governor",
    desc: "An intelligent control layer that restricts what AI can access, share, or disclose — without breaking the task.",
    color: "text-blue-400",
    border: "border-blue-900/40",
    bg: "bg-blue-950/20",
  },
  {
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Confirmation Layer",
    desc: "For sensitive decisions, Nora pauses and asks. You approve, anonymize, or block each data point before it leaves your hands.",
    color: "text-green-400",
    border: "border-green-900/40",
    bg: "bg-green-950/20",
  },
];

const STEPS = [
  { n: "01", title: "Set Your Persona", desc: "Choose how aggressively Nora protects you — from conservative lockdown to open access." },
  { n: "02", title: "Message Naturally", desc: "Type your request to AI normally. Don't self-censor. Nora intercepts before anything is sent." },
  { n: "03", title: "Review & Confirm", desc: "Nora highlights every sensitive signal and asks for approval. You see exactly what AI receives." },
];

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("nora_profile");
    if (stored) {
      setHasProfile(true);
      router.push("/dashboard");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading…
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-gray-100 overflow-x-hidden">
      {/* Nav */}
      <nav className="border-b border-[#1e1e1e] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-purple-700 flex items-center justify-center">
            <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-bold text-sm tracking-tight">Nora</span>
        </div>
        <Link
          href="/onboarding"
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          Get started →
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-800/50 bg-purple-900/20 text-purple-300 text-xs mb-6 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          Track A · Respectful Automation · Privacy Personas for Autonomous AI
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in leading-tight">
          Your AI acts for you.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-500 to-purple-700">
            Nora keeps it honest.
          </span>
        </h1>

        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 animate-fade-in leading-relaxed">
          Autonomous AI systems complete tasks fast — but they can expose sensitive data without asking.
          Nora is a privacy governance layer that enforces your personal boundaries on every AI interaction.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in">
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Set Up Privacy Profile
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[#2a2a2a] hover:border-gray-600 text-gray-300 hover:text-white font-semibold text-sm transition-all"
          >
            Try Demo →
          </Link>
        </div>

        {/* Mock intercept visual */}
        <div className="mt-16 rounded-xl border border-[#2a2a2a] bg-[#141414] p-5 text-left max-w-2xl mx-auto animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-xs text-red-400 font-semibold uppercase tracking-widest">Intercept Active — 3 signals detected</span>
          </div>
          <p className="text-sm font-mono text-gray-300 leading-relaxed">
            I'm really{" "}
            <span className="bg-pink-500/20 border-b border-pink-400 px-0.5 rounded-sm text-pink-200">anxious about midterms</span>{" "}
            and I{" "}
            <span className="bg-orange-500/20 border-b border-orange-400 px-0.5 rounded-sm text-orange-200">haven't been sleeping</span>.
            Can you find me a therapist near my dorm at{" "}
            <span className="bg-red-500/25 border-b border-red-400 px-0.5 rounded-sm text-red-200">915 Castle Point Terrace, Hoboken NJ</span>?
          </p>
          <div className="mt-3 pt-3 border-t border-[#2a2a2a] flex flex-wrap gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full border border-red-800 bg-red-900/30 text-red-300">Address — high risk</span>
            <span className="text-xs px-2 py-0.5 rounded-full border border-pink-800 bg-pink-900/30 text-pink-300">Emotional — medium</span>
            <span className="text-xs px-2 py-0.5 rounded-full border border-orange-800 bg-orange-900/30 text-orange-300">Health — high risk</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-center text-xs text-gray-600 uppercase tracking-widest mb-8">How Nora Works</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className={`rounded-xl border ${f.border} ${f.bg} p-5`}>
              <div className={`mb-3 ${f.color}`}>{f.icon}</div>
              <h3 className="font-semibold text-gray-200 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-center text-xs text-gray-600 uppercase tracking-widest mb-8">The Nora Flow</p>
        <div className="space-y-6">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex gap-5 items-start">
              <span className="text-2xl font-black text-purple-800/60 font-mono w-10 flex-shrink-0">{s.n}</span>
              <div>
                <h4 className="font-semibold text-gray-200 mb-1">{s.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="absolute ml-4 mt-12 h-6 w-px bg-[#2a2a2a]" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="rounded-xl border border-purple-900/40 bg-purple-950/20 p-8">
          <h2 className="text-2xl font-bold mb-3">Ready to protect your privacy?</h2>
          <p className="text-gray-400 text-sm mb-6">Set up your privacy persona in under 60 seconds.</p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-semibold text-sm transition-all"
          >
            Get Started — it's free →
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#1e1e1e] py-6 text-center text-xs text-gray-700">
        Nora · Privacy governance for autonomous AI · No data stored, ever.
      </footer>
    </main>
  );
}
