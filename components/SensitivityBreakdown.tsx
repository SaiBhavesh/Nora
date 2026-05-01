"use client";

import { SensitiveItem } from "@/lib/types";

interface SensitivityBreakdownProps {
  detected: SensitiveItem[];
  rewritten: string;
}

const TYPE_COLORS: Record<string, string> = {
  address: "bg-red-900/40 text-red-300 border-red-800",
  health: "bg-orange-900/40 text-orange-300 border-orange-800",
  emotional: "bg-pink-900/40 text-pink-300 border-pink-800",
  financial: "bg-yellow-900/40 text-yellow-300 border-yellow-800",
  academic: "bg-blue-900/40 text-blue-300 border-blue-800",
  behavioral: "bg-purple-900/40 text-purple-300 border-purple-800",
};

const RISK_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-orange-400",
  low: "bg-yellow-400",
};

const RISK_LABEL: Record<string, string> = {
  high: "text-red-400",
  medium: "text-orange-400",
  low: "text-yellow-400",
};

export default function SensitivityBreakdown({ detected, rewritten }: SensitivityBreakdownProps) {
  const highRisk = detected.filter((d) => d.risk === "high");

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Sensitivity Breakdown
        </span>
      </div>

      <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden divide-y divide-[#2a2a2a]">
        {/* Detected section */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🔴</span>
            <span className="text-sm font-semibold text-gray-200">Detected</span>
            <span className="ml-auto text-xs text-gray-500">
              {detected.length} signal{detected.length !== 1 ? "s" : ""}
              {highRisk.length > 0 && (
                <span className="ml-2 text-red-400 font-semibold">{highRisk.length} high risk</span>
              )}
            </span>
          </div>
          {detected.length === 0 ? (
            <p className="text-xs text-gray-600 italic">No sensitive data detected</p>
          ) : (
            <div className="flex flex-col gap-3">
              {detected.map((item, i) => (
                <div key={i} className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-3">
                  <div className="flex items-start gap-2 mb-1.5">
                    <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${RISK_DOT[item.risk]}`} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-200 font-mono break-words">"{item.text}"</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded border flex-shrink-0 capitalize ${TYPE_COLORS[item.type] || "bg-gray-800 text-gray-400 border-gray-700"}`}>
                      {item.type}
                    </span>
                  </div>
                  {item.reasoning && (
                    <p className={`text-xs mt-1 pl-4 ${RISK_LABEL[item.risk]} opacity-80`}>
                      ↳ {item.reasoning}
                    </p>
                  )}
                  {item.alternative && (
                    <div className="flex items-center gap-1.5 mt-1.5 pl-4">
                      <span className="text-[10px] text-gray-600 uppercase tracking-wider">Instead:</span>
                      <span className="text-xs text-purple-300 font-mono bg-purple-950/30 border border-purple-900/50 px-2 py-0.5 rounded">
                        "{item.alternative}"
                      </span>
                      <span className="text-[10px] text-gray-600">— task still completes ✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rewritten section */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">✂️</span>
            <span className="text-sm font-semibold text-gray-200">Rewritten to</span>
            <span className="ml-auto text-xs text-gray-500">minimum necessary data</span>
          </div>
          <p className="text-sm text-gray-300 font-mono bg-[#111] rounded px-3 py-2 border border-[#2a2a2a] italic leading-relaxed">
            "{rewritten}"
          </p>
        </div>

        {/* Protected section */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">✅</span>
            <span className="text-sm font-semibold text-gray-200">Protected</span>
            <span className="ml-auto text-xs text-gray-500">{detected.length} item{detected.length !== 1 ? "s" : ""} removed</span>
          </div>
          {detected.length === 0 ? (
            <p className="text-xs text-gray-600 italic">Nothing to protect</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {detected.map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-green-900/60 bg-green-950/30 text-green-300"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {item.type}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
