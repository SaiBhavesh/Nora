"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PersonaSlider from "@/components/PersonaSlider";
import MessageInput from "@/components/MessageInput";
import InterceptionFlash from "@/components/InterceptionFlash";
import SideBySide from "@/components/SideBySide";
import SensitivityBreakdown from "@/components/SensitivityBreakdown";
import PrivacyReceipt from "@/components/PrivacyReceipt";
import AgentScenarios from "@/components/AgentScenarios";
import ConfirmationModal from "@/components/ConfirmationModal";
import DataFlowDiagram from "@/components/DataFlowDiagram";
import SessionHistory from "@/components/SessionHistory";
import FeedbackBar from "@/components/FeedbackBar";
import PrivacyBudget from "@/components/PrivacyBudget";
import PrivacyImpactPreview from "@/components/PrivacyImpactPreview";
import AgentPlayground from "@/components/AgentPlayground";
import { Persona, NoraResult, DataCategory } from "@/lib/types";
import { useProfile } from "@/lib/useProfile";
import { useHistory } from "@/lib/useHistory";
import { usePersonaLearning } from "@/lib/usePersonaLearning";
import { usePrivacyBudget } from "@/lib/usePrivacyBudget";

export default function Dashboard() {
  const router = useRouter();
  const { profile, saveProfile, clearProfile, loaded } = useProfile();
  const { history, addEntry, clearHistory } = useHistory();

  const [persona, setPersona] = useState<Persona>("conservative");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<NoraResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");

  // Confirmation modal state
  const [pendingResult, setPendingResult] = useState<NoraResult | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Feature hooks
  const { applyFeedback, getLearnedBlockedCategories } = usePersonaLearning(persona);
  const { recordExposure } = usePrivacyBudget();

  // Sync persona from profile
  useEffect(() => {
    if (profile) setPersona(profile.persona);
  }, [profile]);

  useEffect(() => {
    if (loaded && !profile) {
      // Allow demo use without onboarding
    }
  }, [loaded, profile]);

  function handlePersonaChange(p: Persona) {
    setPersona(p);
    if (profile) {
      saveProfile({ ...profile, persona: p });
    }
  }

  async function handleSubmit() {
    if (!message.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setPendingResult(null);

    const ts = new Date().toISOString();
    setTimestamp(ts);
    setSubmittedMessage(message);

    // Use learned categories (adapts from feedback), fall back to profile categories
    const learnedCategories = getLearnedBlockedCategories();
    const effectiveCategories =
      learnedCategories.length > 0 ? learnedCategories : (profile?.blockedCategories ?? []);

    try {
      const res = await fetch("/api/intercept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          persona,
          blockedCategories: effectiveCategories,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const r = data as NoraResult;

      const needsConfirm =
        profile?.confirmationThreshold === "always" ||
        (profile?.confirmationThreshold === "high-risk" &&
          r.sensitive_detected.some((s) => s.risk === "high"));

      if (needsConfirm && r.sensitive_detected.length > 0) {
        setPendingResult(r);
        setShowConfirm(true);
        setLoading(false);
      } else {
        finalizeResult(r, ts);
      }
    } catch {
      setError("Network error — check your connection and try again.");
      setLoading(false);
    }
  }

  function finalizeResult(r: NoraResult, ts: string) {
    setResult(r);
    setLoading(false);

    // Record detected categories in the weekly budget
    const categories = r.sensitive_detected.map((s) => s.type as DataCategory);
    if (categories.length > 0) recordExposure(categories);

    addEntry({
      id: crypto.randomUUID(),
      timestamp: ts,
      originalMessage: message,
      persona,
      protection_score: r.protection_score,
      sensitive_count: r.sensitive_detected.length,
    });
  }

  function handleConfirm(overrides: Record<number, "block" | "allow">) {
    if (!pendingResult) return;
    setShowConfirm(false);
    const finalResult: NoraResult = {
      ...pendingResult,
      sensitive_detected: pendingResult.sensitive_detected.filter(
        (_, i) => overrides[i] === "block"
      ),
    };
    finalizeResult(finalResult, timestamp);
    setPendingResult(null);
  }

  function handleCancelConfirm() {
    setShowConfirm(false);
    setPendingResult(null);
    setLoading(false);
  }

  function handleHistorySelect(msg: string, p: Persona) {
    setMessage(msg);
    setPersona(p);
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500 text-sm">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading Nora…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-100">
      <Navbar profile={profile} onResetProfile={clearProfile} />

      {showConfirm && pendingResult && (
        <ConfirmationModal
          items={pendingResult.sensitive_detected}
          rewritten={pendingResult.rewritten_message}
          onConfirm={handleConfirm}
          onCancel={handleCancelConfirm}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {!result && (
          <div className="text-center py-4 animate-fade-in">
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              Privacy governance for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                autonomous AI
              </span>
            </h2>
            <p className="text-gray-500 text-sm">
              {profile
                ? `Welcome back, ${profile.name}. Your ${profile.persona} persona is active.`
                : "Type a message or pick a scenario below — Nora intercepts before AI sees it."}
            </p>
          </div>
        )}

        {!result && (
          <div className="animate-fade-in">
            <AgentPlayground persona={persona} />
          </div>
        )}

        {!result && (
          <div className="animate-fade-in">
            <AgentScenarios onSelect={(msg) => { setMessage(msg); setResult(null); setError(null); }} />
          </div>
        )}

        {/* Input card */}
        <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-5 space-y-4 animate-fade-in">
          <PersonaSlider persona={persona} onChange={handlePersonaChange} />
          <div className="h-px bg-[#2a2a2a]" />
          <MessageInput value={message} onChange={setMessage} onSubmit={handleSubmit} loading={loading} />

          {/* Feature 2: Pre-task privacy impact preview */}
          <PrivacyImpactPreview message={message} enabled={!loading && !result} />
        </div>

        {error && (
          <div className="rounded-lg border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300 animate-fade-in flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[#2a2a2a]" />
              <span className="text-xs text-purple-400 font-semibold uppercase tracking-widest px-2">
                Nora Intercept Report
              </span>
              <div className="h-px flex-1 bg-[#2a2a2a]" />
            </div>

            <InterceptionFlash message={submittedMessage} detected={result.sensitive_detected} />

            <DataFlowDiagram
              detected={result.sensitive_detected}
              protected_count={result.sensitive_detected.length}
            />

            <SideBySide
              without={result.without_sentinel_response}
              withNora={result.with_sentinel_response}
            />

            {/* Feature 3: Counterfactual alternatives shown inside SensitivityBreakdown */}
            <SensitivityBreakdown
              detected={result.sensitive_detected}
              rewritten={result.rewritten_message}
            />

            <PrivacyReceipt
              result={result}
              persona={persona}
              originalMessage={submittedMessage}
              timestamp={timestamp}
            />

            {/* Feature 1: Feedback → persona learning */}
            <FeedbackBar
              detectedCategories={result.sensitive_detected.map((s) => s.type as DataCategory)}
              onFeedback={applyFeedback}
            />

            {/* Feature 4: Privacy budget */}
            <PrivacyBudget />

            {/* New analysis button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={() => { setResult(null); setMessage(""); setError(null); }}
                className="text-sm px-5 py-2.5 rounded-lg border border-[#2a2a2a] text-gray-400 hover:text-gray-200 hover:border-[#3a3a3a] transition-all"
              >
                ← Analyze another message
              </button>
            </div>
          </div>
        )}

        <SessionHistory
          history={history}
          onClear={clearHistory}
          onSelect={handleHistorySelect}
        />

        {!profile && (
          <div className="rounded-lg border border-purple-900/30 bg-purple-950/10 px-4 py-3 flex items-center justify-between gap-4 animate-fade-in">
            <p className="text-sm text-gray-400">
              Set up a privacy profile to enable the confirmation layer and per-category controls.
            </p>
            <button
              onClick={() => router.push("/onboarding")}
              className="text-xs px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-medium transition-colors flex-shrink-0"
            >
              Set Up →
            </button>
          </div>
        )}

        <div className="text-center text-xs text-gray-700 pb-4">
          Nora processes all analysis in memory — nothing is stored on any server.
        </div>
      </div>
    </div>
  );
}
