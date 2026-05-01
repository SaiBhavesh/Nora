"use client";

import Link from "next/link";

const SCENARIOS = [
  {
    icon: "✈️",
    title: "Book Travel",
    category: "Travel",
    risk: "high",
    riskLabel: "3 signals",
    message:
      "I need to fly from JFK to LAX on May 15th. I prefer window seats and I'm diabetic so I need special meals. Book the cheapest option using my Amex card ending in 4521. I live at 47 Willow Lane, Brooklyn NY 11201.",
    signals: ["Amex card 4521", "47 Willow Lane", "diabetic"],
  },
  {
    icon: "🏥",
    title: "Find Healthcare",
    category: "Health",
    risk: "high",
    riskLabel: "3 signals",
    message:
      "I've been having severe anxiety attacks since my breakup last month and I can't sleep. I'm at 234 Maple Street, find me a therapist who accepts Blue Cross insurance and can do evening appointments.",
    signals: ["anxiety attacks", "234 Maple Street", "Blue Cross"],
  },
  {
    icon: "🎓",
    title: "Academic Help",
    category: "Academic",
    risk: "medium",
    riskLabel: "2 signals",
    message:
      "I failed my CS301 midterm with a 42% and I'm now on academic probation. I'm really stressed and can't focus. Can you help me write an email to Professor Smith asking for extra credit opportunities?",
    signals: ["42% / probation", "CS301 midterm"],
  },
  {
    icon: "🏠",
    title: "Campus Housing",
    category: "Location",
    risk: "medium",
    riskLabel: "2 signals",
    message:
      "I live in Jacobus Hall room 412 and I'm looking for quiet study spots near my dorm for late night studying. I usually study after 11pm because I have insomnia. Somewhere within 5 minutes walk.",
    signals: ["Jacobus Hall room 412", "insomnia"],
  },
  {
    icon: "💳",
    title: "Financial Aid",
    category: "Financial",
    risk: "high",
    riskLabel: "3 signals",
    message:
      "I'm struggling financially — my family income dropped to $28,000 this year and I have $12,000 in credit card debt. Can you help me find emergency scholarships or grants at my university?",
    signals: ["$28,000 income", "$12,000 debt", "financial struggle"],
  },
  {
    icon: "🧠",
    title: "Mental Health",
    category: "Mental Health",
    risk: "high",
    riskLabel: "3 signals",
    message:
      "I've been diagnosed with ADHD and depression. I'm at 781 Park Ave Apt 3B and need help finding a psychiatrist who prescribes Adderall and accepts student insurance for weekly sessions.",
    signals: ["ADHD and depression", "781 Park Ave", "Adderall"],
  },
];

const RISK_COLORS: Record<string, string> = {
  high: "text-red-400 bg-red-900/20 border-red-900/40",
  medium: "text-orange-400 bg-orange-900/20 border-orange-900/40",
};

interface AgentScenariosProps {
  onSelect: (message: string) => void;
}

export default function AgentScenarios({ onSelect }: AgentScenariosProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Agent Scenarios</span>
          <span className="text-xs text-gray-600">— click to load a real-world example</span>
        </div>
        <Link
          href="/compare"
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-purple-900/10"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Compare all personas →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.title}
            onClick={() => onSelect(s.message)}
            className="group text-left rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-3 hover:border-purple-800/60 hover:bg-purple-950/10 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{s.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-200 group-hover:text-purple-300 transition-colors">
                    {s.title}
                  </p>
                  <p className="text-xs text-gray-600">{s.category}</p>
                </div>
              </div>
              <span className={`text-xs px-1.5 py-0.5 rounded border ${RISK_COLORS[s.risk]}`}>
                {s.riskLabel}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {s.signals.map((sig) => (
                <span key={sig} className="text-xs px-1.5 py-0.5 rounded bg-[#252525] text-gray-600 truncate max-w-[110px]">
                  {sig}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
