"use client";

import { HistoryEntry, Persona } from "@/lib/types";

interface SessionHistoryProps {
  history: HistoryEntry[];
  onClear: () => void;
  onSelect: (message: string, persona: Persona) => void;
}

function ScoreDot({ score }: { score: number }) {
  const color = score >= 70 ? "bg-green-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500";
  return (
    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
  );
}

const PERSONA_COLOR: Record<string, string> = {
  conservative: "text-purple-400",
  balanced: "text-blue-400",
  open: "text-green-400",
};

export default function SessionHistory({ history, onClear, onSelect }: SessionHistoryProps) {
  if (history.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Session History</span>
        </div>
        <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-4 text-center">
          <p className="text-xs text-gray-700 italic">No intercepts yet this session</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Session History
        </span>
        <span className="text-xs text-gray-600 ml-1">{history.length} intercept{history.length !== 1 ? "s" : ""}</span>
        <button
          onClick={onClear}
          className="ml-auto text-xs text-gray-700 hover:text-gray-500 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] overflow-hidden divide-y divide-[#1e1e1e]">
        {history.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onSelect(entry.originalMessage, entry.persona)}
            className="w-full text-left px-4 py-3 hover:bg-[#1a1a1a] transition-colors flex items-start gap-3 group"
          >
            <ScoreDot score={entry.protection_score} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-300 truncate leading-relaxed group-hover:text-gray-100">
                {entry.originalMessage}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs capitalize font-medium ${PERSONA_COLOR[entry.persona]}`}>
                  {entry.persona}
                </span>
                <span className="text-xs text-gray-700">·</span>
                <span className="text-xs text-gray-600">{entry.sensitive_count} signals</span>
                <span className="text-xs text-gray-700">·</span>
                <span className="text-xs text-gray-600">{entry.protection_score}% protected</span>
              </div>
            </div>
            <span className="text-xs text-gray-700 group-hover:text-gray-500 flex-shrink-0 ml-1">↩</span>
          </button>
        ))}
      </div>
    </div>
  );
}
