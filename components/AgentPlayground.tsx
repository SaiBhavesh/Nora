"use client";

import { useMemo, useState } from "react";
import { AgentStep, AgentTrace, AgentVerdict, Persona } from "@/lib/types";
import { THIRD_PARTY_REGISTRY } from "@/lib/thirdPartyRegistry";

interface AgentPlaygroundProps {
  persona: Persona;
}

const DEMO_GOAL = "Schedule a visit to the campus health center and book a ride";

const VERDICT_STYLES: Record<AgentVerdict, string> = {
  clean: "border-green-900/50 bg-green-950/20 text-green-300",
  intercepted: "border-yellow-900/50 bg-yellow-950/20 text-yellow-300",
  blocked: "border-red-900/50 bg-red-950/20 text-red-300",
  negotiated: "border-orange-900/50 bg-orange-950/20 text-orange-300",
};

const VERDICT_LABELS: Record<AgentVerdict, string> = {
  clean: "CLEAN",
  intercepted: "INTERCEPTED",
  blocked: "BLOCKED",
  negotiated: "REROUTED",
};

function serviceLabel(serviceKey: string) {
  return THIRD_PARTY_REGISTRY[serviceKey]?.name ?? "Internal";
}

function StepCard({ step }: { step: AgentStep }) {
  const service = THIRD_PARTY_REGISTRY[step.third_party];

  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#171717] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-600">Step {step.id}</span>
            <span className={`text-[11px] font-bold tracking-wider px-2 py-0.5 rounded border ${VERDICT_STYLES[step.verdict]}`}>
              {VERDICT_LABELS[step.verdict]}
            </span>
          </div>
          <h4 className="font-semibold text-gray-200">{step.action}</h4>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{step.description}</p>
        </div>

        <div className="text-left sm:text-right flex-shrink-0">
          <p className="text-xs text-gray-600 uppercase tracking-wider">Service</p>
          <p className="text-sm text-gray-300">{serviceLabel(step.third_party)}</p>
          {service && step.third_party !== "none" && (
            <p className={`text-xs mt-0.5 capitalize ${
              service.riskLevel === "high" ? "text-red-400" :
              service.riskLevel === "medium" ? "text-yellow-400" : "text-green-400"
            }`}>
              {service.riskLevel} risk
            </p>
          )}
        </div>
      </div>

      {step.data_categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {step.data_categories.map((category) => (
            <span key={category} className="text-xs px-2 py-0.5 rounded-full bg-[#252525] text-gray-400 border border-[#303030]">
              {category}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 rounded border border-[#252525] bg-[#111] px-3 py-2">
        <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Nora decision</p>
        <p className="text-sm text-gray-300 leading-relaxed">{step.nora_action}</p>
        {step.minimized_data && (
          <p className="text-xs text-green-300 mt-2">{step.minimized_data}</p>
        )}
        {step.alternative_service && (
          <p className="text-xs text-orange-300 mt-2">
            Alternative: {serviceLabel(step.alternative_service)}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AgentPlayground({ persona }: AgentPlaygroundProps) {
  const [goal, setGoal] = useState(DEMO_GOAL);
  const [trace, setTrace] = useState<AgentTrace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activePersona = trace?.auto_persona ?? persona;
  const registryStats = useMemo(() => {
    const services = Object.values(THIRD_PARTY_REGISTRY).filter((service) => service.name !== "Internal / No external service");
    return {
      total: services.length,
      high: services.filter((service) => service.riskLevel === "high").length,
      medium: services.filter((service) => service.riskLevel === "medium").length,
      low: services.filter((service) => service.riskLevel === "low").length,
    };
  }, []);

  async function runPlayground() {
    if (!goal.trim() || loading) return;
    setLoading(true);
    setError(null);
    setTrace(null);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, persona }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        setError(data.error || "Nora could not build an agent trace.");
        return;
      }

      setTrace(data as AgentTrace);
    } catch {
      setError("Network error while building the agent trace.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-purple-900/40 bg-[#141414] overflow-hidden animate-fade-in">
      <div className="px-5 py-4 border-b border-[#2a2a2a] bg-purple-950/10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-widest">Agent Playground</span>
              <span className="text-xs px-2 py-0.5 rounded-full border border-[#333] text-gray-500">simulated autonomous run</span>
            </div>
            <h3 className="text-lg font-bold text-gray-100">Show Nora governing each sub-action</h3>
            <p className="text-sm text-gray-500 mt-1">
              The demo expands a student goal, checks every service against the persona, and logs what Nora allows, rewrites, or blocks.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center flex-shrink-0">
            <div className="rounded border border-[#2a2a2a] bg-[#101010] px-3 py-2">
              <p className="text-lg font-bold text-gray-200">{registryStats.total}</p>
              <p className="text-[10px] text-gray-600 uppercase">services</p>
            </div>
            <div className="rounded border border-red-900/40 bg-red-950/10 px-3 py-2">
              <p className="text-lg font-bold text-red-300">{registryStats.high}</p>
              <p className="text-[10px] text-gray-600 uppercase">high</p>
            </div>
            <div className="rounded border border-yellow-900/40 bg-yellow-950/10 px-3 py-2">
              <p className="text-lg font-bold text-yellow-300">{registryStats.medium}</p>
              <p className="text-[10px] text-gray-600 uppercase">med</p>
            </div>
            <div className="rounded border border-green-900/40 bg-green-950/10 px-3 py-2">
              <p className="text-lg font-bold text-green-300">{registryStats.low}</p>
              <p className="text-[10px] text-gray-600 uppercase">low</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <textarea
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            className="min-h-[88px] flex-1 resize-none rounded-lg border border-[#2a2a2a] bg-[#101010] px-4 py-3 text-sm text-gray-200 outline-none focus:border-purple-700 focus:ring-1 focus:ring-purple-800"
            placeholder="Give the autonomous agent a task..."
          />
          <div className="flex lg:flex-col gap-2 lg:w-48">
            <button
              onClick={() => setGoal(DEMO_GOAL)}
              className="flex-1 rounded-lg border border-[#2a2a2a] px-4 py-2 text-sm text-gray-300 hover:border-purple-800 hover:text-purple-300 transition-colors"
            >
              Load winner demo
            </button>
            <button
              onClick={runPlayground}
              disabled={loading || !goal.trim()}
              className="flex-1 rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Tracing..." : "Run agent trace"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {trace && (
          <div className="space-y-4">
            {trace.auto_persona_reason && (
              <div className="rounded-lg border border-purple-800/60 bg-purple-950/30 px-4 py-3">
                <p className="text-sm font-semibold text-purple-200">Persona auto-elevated to Conservative</p>
                <p className="text-sm text-purple-300/80 mt-1">{trace.auto_persona_reason}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="rounded-lg border border-[#2a2a2a] bg-[#101010] p-3">
                <p className="text-xs text-gray-600 uppercase tracking-wider">Persona</p>
                <p className="text-sm font-semibold capitalize text-gray-200">{activePersona}</p>
              </div>
              <div className="rounded-lg border border-green-900/40 bg-green-950/10 p-3">
                <p className="text-xs text-gray-600 uppercase tracking-wider">Clean</p>
                <p className="text-xl font-bold text-green-300">{trace.summary.clean}</p>
              </div>
              <div className="rounded-lg border border-yellow-900/40 bg-yellow-950/10 p-3">
                <p className="text-xs text-gray-600 uppercase tracking-wider">Intercepted</p>
                <p className="text-xl font-bold text-yellow-300">{trace.summary.intercepted}</p>
              </div>
              <div className="rounded-lg border border-orange-900/40 bg-orange-950/10 p-3">
                <p className="text-xs text-gray-600 uppercase tracking-wider">Rerouted</p>
                <p className="text-xl font-bold text-orange-300">{trace.summary.negotiated}</p>
              </div>
              <div className="rounded-lg border border-red-900/40 bg-red-950/10 p-3">
                <p className="text-xs text-gray-600 uppercase tracking-wider">Blocked</p>
                <p className="text-xl font-bold text-red-300">{trace.summary.blocked}</p>
              </div>
            </div>

            <div className="space-y-3">
              {trace.steps.map((step) => (
                <StepCard key={step.id} step={step} />
              ))}
            </div>

            <div className="rounded-lg border border-[#2a2a2a] bg-[#101010] p-4">
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">What a standard agent would expose</p>
              <div className="flex flex-wrap gap-2">
                {trace.summary.standard_agent_exposure.map((category) => (
                  <span key={category} className="text-xs px-2 py-1 rounded-full border border-red-900/40 bg-red-950/20 text-red-300">
                    {category}
                  </span>
                ))}
              </div>
              {trace.summary.third_parties_blocked.length > 0 && (
                <p className="text-sm text-gray-400 mt-3">
                  Third-party risk checked: {trace.summary.third_parties_blocked.join(", ")} exceeded the active persona threshold.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
