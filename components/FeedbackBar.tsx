"use client";

import { useState } from "react";
import { DataCategory, FeedbackType } from "@/lib/types";

interface FeedbackBarProps {
  detectedCategories: DataCategory[];
  onFeedback: (categories: DataCategory[], feedback: FeedbackType) => void;
}

const FEEDBACK_OPTIONS: { value: FeedbackType; label: string; description: string; color: string; icon: string }[] = [
  {
    value: "well-balanced",
    label: "Well balanced",
    description: "Nora protected exactly the right things",
    color: "border-green-800 bg-green-950/30 text-green-300 hover:bg-green-950/50",
    icon: "✓",
  },
  {
    value: "over-protected",
    label: "Over-protected",
    description: "Nora blocked too much — I'm fine sharing this",
    color: "border-blue-800 bg-blue-950/30 text-blue-300 hover:bg-blue-950/50",
    icon: "↓",
  },
  {
    value: "under-protected",
    label: "Under-protected",
    description: "Nora should have blocked more of this",
    color: "border-orange-800 bg-orange-950/30 text-orange-300 hover:bg-orange-950/50",
    icon: "↑",
  },
];

export default function FeedbackBar({ detectedCategories, onFeedback }: FeedbackBarProps) {
  const [given, setGiven] = useState<FeedbackType | null>(null);

  function handleFeedback(f: FeedbackType) {
    if (given) return;
    setGiven(f);
    onFeedback(detectedCategories, f);
  }

  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] px-4 py-3">
      <div className="flex items-center gap-2 mb-3">
        <svg className="h-3.5 w-3.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Teach Nora
        </span>
        {given && (
          <span className="ml-auto text-xs text-purple-400">
            ✓ Nora will adjust for future messages
          </span>
        )}
      </div>

      {!given ? (
        <div className="flex flex-wrap gap-2">
          {FEEDBACK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleFeedback(opt.value)}
              className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border transition-all ${opt.color}`}
            >
              <span className="font-bold">{opt.icon}</span>
              <div className="text-left">
                <div className="font-semibold">{opt.label}</div>
                <div className="opacity-70 text-[10px]">{opt.description}</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>
            Feedback recorded:{" "}
            <span className="text-purple-300 font-semibold">{given}</span>.
          </span>
          {detectedCategories.length > 0 && (
            <span className="text-gray-600">
              Adjusted thresholds for: {detectedCategories.join(", ")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
