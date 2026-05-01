"use client";

import { useEffect, useState } from "react";
import { SensitiveItem } from "@/lib/types";

interface InterceptionFlashProps {
  message: string;
  detected: SensitiveItem[];
}

const TYPE_LABELS: Record<string, string> = {
  address: "Location",
  health: "Health",
  emotional: "Emotional",
  financial: "Financial",
  academic: "Academic",
  behavioral: "Behavioral",
};

const RISK_COLORS: Record<string, string> = {
  high: "bg-red-500/20 border-red-500 text-red-300",
  medium: "bg-orange-500/20 border-orange-500 text-orange-300",
  low: "bg-yellow-500/20 border-yellow-500 text-yellow-300",
};

const HIGHLIGHT_BG: Record<string, string> = {
  high: "bg-red-500/30 border-b-2 border-red-400",
  medium: "bg-orange-500/25 border-b-2 border-orange-400",
  low: "bg-yellow-500/20 border-b-2 border-yellow-400",
};

interface Segment {
  text: string;
  item?: SensitiveItem;
}

function buildSegments(message: string, detected: SensitiveItem[]): Segment[] {
  if (!detected.length) return [{ text: message }];

  const sorted = [...detected].sort((a, b) => {
    const ia = message.indexOf(a.text);
    const ib = message.indexOf(b.text);
    return ia - ib;
  });

  const segments: Segment[] = [];
  let cursor = 0;

  for (const item of sorted) {
    const idx = message.indexOf(item.text, cursor);
    if (idx === -1) continue;
    if (idx > cursor) segments.push({ text: message.slice(cursor, idx) });
    segments.push({ text: item.text, item });
    cursor = idx + item.text.length;
  }

  if (cursor < message.length) segments.push({ text: message.slice(cursor) });
  return segments;
}

export default function InterceptionFlash({ message, detected }: InterceptionFlashProps) {
  const [visible, setVisible] = useState(false);
  const [tooltip, setTooltip] = useState<SensitiveItem | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const segments = buildSegments(message, detected);

  return (
    <div
      className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        <span className="text-xs font-semibold text-red-400 uppercase tracking-widest">
          Intercept Active — {detected.length} signal{detected.length !== 1 ? "s" : ""} detected
        </span>
      </div>

      <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-4 relative">
        <p className="text-sm leading-relaxed font-mono text-gray-200">
          {segments.map((seg, i) =>
            seg.item ? (
              <span
                key={i}
                className={`relative inline cursor-pointer px-0.5 rounded-sm ${HIGHLIGHT_BG[seg.item.risk]} highlight-pulse`}
                onMouseEnter={() => setTooltip(seg.item!)}
                onMouseLeave={() => setTooltip(null)}
              >
                {seg.text}
                {tooltip === seg.item && (
                  <span className="absolute bottom-full left-0 mb-1 z-10 flex flex-col gap-0.5 pointer-events-none">
                    <span
                      className={`text-xs px-2 py-1 rounded border whitespace-nowrap font-sans ${RISK_COLORS[seg.item.risk]}`}
                    >
                      {TYPE_LABELS[seg.item.type] || seg.item.type} · {seg.item.risk} risk
                    </span>
                  </span>
                )}
              </span>
            ) : (
              <span key={i}>{seg.text}</span>
            )
          )}
        </p>

        <div className="mt-3 pt-3 border-t border-[#2a2a2a] flex flex-wrap gap-2">
          {detected.map((item, i) => (
            <span
              key={i}
              className={`text-xs px-2 py-0.5 rounded-full border ${RISK_COLORS[item.risk]}`}
            >
              {TYPE_LABELS[item.type]} — {item.risk}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
