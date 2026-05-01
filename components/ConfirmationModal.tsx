"use client";

import { useState } from "react";
import { SensitiveItem } from "@/lib/types";

interface ConfirmationModalProps {
  items: SensitiveItem[];
  rewritten: string;
  onConfirm: (overrides: Record<number, "block" | "allow">) => void;
  onCancel: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  address: "Location / Address",
  health: "Health / Medical",
  emotional: "Emotional State",
  financial: "Financial",
  academic: "Academic",
  behavioral: "Behavioral",
};

const RISK_STYLE: Record<string, string> = {
  high: "border-red-800 bg-red-950/30 text-red-300",
  medium: "border-orange-800 bg-orange-950/30 text-orange-300",
  low: "border-yellow-800 bg-yellow-950/30 text-yellow-300",
};

const RISK_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-orange-400",
  low: "bg-yellow-400",
};

export default function ConfirmationModal({ items, rewritten, onConfirm, onCancel }: ConfirmationModalProps) {
  const [choices, setChoices] = useState<Record<number, "block" | "allow">>(() =>
    Object.fromEntries(items.map((_, i) => [i, "block"]))
  );

  function toggle(idx: number) {
    setChoices((prev) => ({ ...prev, [idx]: prev[idx] === "block" ? "allow" : "block" }));
  }

  const blocked = Object.values(choices).filter((c) => c === "block").length;
  const allowed = Object.values(choices).filter((c) => c === "allow").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#161616] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2a2a2a] bg-[#111]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-900/60 border border-purple-700/50 flex items-center justify-center flex-shrink-0">
              <svg className="h-4 w-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-100 text-sm">Nora needs your approval</h3>
              <p className="text-xs text-gray-500">
                {items.length} sensitive signal{items.length !== 1 ? "s" : ""} detected — review before proceeding
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="px-5 py-4 space-y-3 max-h-72 overflow-y-auto">
          {items.map((item, i) => (
            <div key={i} className={`rounded-lg border p-3 ${RISK_STYLE[item.risk]}`}>
              <div className="flex items-start gap-2 mb-2">
                <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${RISK_DOT[item.risk]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-gray-200 break-words">"{item.text}"</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {TYPE_LABELS[item.type] || item.type} · {item.risk} risk
                  </p>
                  {item.reasoning && (
                    <p className="text-xs text-gray-600 mt-1 italic">{item.reasoning}</p>
                  )}
                </div>
              </div>
              {/* Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className={`text-xs font-medium ${choices[i] === "block" ? "text-green-400" : "text-orange-400"}`}>
                  {choices[i] === "block" ? "✓ Will be protected" : "⚠ Will be shared with AI"}
                </span>
                <button
                  onClick={() => toggle(i)}
                  className={`text-xs px-2.5 py-1 rounded border transition-all ${
                    choices[i] === "block"
                      ? "border-green-800 bg-green-950/30 text-green-300 hover:bg-green-950/50"
                      : "border-orange-800 bg-orange-950/30 text-orange-300 hover:bg-orange-950/50"
                  }`}
                >
                  {choices[i] === "block" ? "Override: Allow" : "Revert: Block"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="px-5 py-3 border-t border-[#2a2a2a] bg-[#111]">
          <p className="text-xs text-gray-500 mb-1.5">Message AI will receive:</p>
          <p className="text-xs font-mono text-gray-300 italic bg-[#0d0d0d] rounded px-3 py-2 border border-[#1e1e1e]">
            "{rewritten}"
          </p>
        </div>

        {/* Summary + Actions */}
        <div className="px-5 py-4 border-t border-[#2a2a2a] flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            <span className="text-green-400 font-semibold">{blocked}</span> protected ·{" "}
            <span className={allowed > 0 ? "text-orange-400 font-semibold" : "text-gray-600"}>{allowed}</span> allowed
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-[#2a2a2a] text-gray-400 hover:text-gray-200 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(choices)}
              className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Confirm & See Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
