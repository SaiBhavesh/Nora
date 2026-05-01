"use client";

import { useEffect, useRef, useState } from "react";
import { SensitiveItem } from "@/lib/types";

interface PrivacyImpactPreviewProps {
  message: string;
  enabled: boolean;
}

const RISK_COLOR: Record<string, string> = {
  high: "text-red-400 border-red-900/60 bg-red-950/20",
  medium: "text-orange-400 border-orange-900/60 bg-orange-950/20",
  low: "text-yellow-400 border-yellow-900/60 bg-yellow-950/20",
};

const RISK_DOT: Record<string, string> = {
  high: "bg-red-500", medium: "bg-orange-400", low: "bg-yellow-400",
};

export default function PrivacyImpactPreview({ message, enabled }: PrivacyImpactPreviewProps) {
  const [items, setItems] = useState<SensitiveItem[]>([]);
  const [scanning, setScanning] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScannedRef = useRef("");

  useEffect(() => {
    if (!enabled || message.trim().length < 15) {
      setItems([]);
      setScanning(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    setScanning(true);

    debounceRef.current = setTimeout(async () => {
      if (message === lastScannedRef.current) {
        setScanning(false);
        return;
      }
      lastScannedRef.current = message;

      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });
        const data = await res.json();
        setItems(data.sensitive_detected ?? []);
      } catch {
        setItems([]);
      } finally {
        setScanning(false);
      }
    }, 1400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [message, enabled]);

  if (!enabled || message.trim().length < 15) return null;

  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#111] px-4 py-3 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${scanning ? "bg-yellow-400 animate-pulse" : items.length > 0 ? "bg-red-500" : "bg-green-500"}`} />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Privacy Impact Preview
        </span>
        {scanning && (
          <span className="text-[10px] text-gray-600 ml-1">scanning…</span>
        )}
        {!scanning && items.length === 0 && (
          <span className="text-[10px] text-green-500 ml-1">No sensitive data detected</span>
        )}
        {!scanning && items.length > 0 && (
          <span className="text-[10px] text-red-400 ml-1">
            {items.length} signal{items.length !== 1 ? "s" : ""} detected before you submit
          </span>
        )}
      </div>

      {!scanning && items.length > 0 && (
        <div className="space-y-1.5 mt-2">
          {items.map((item, i) => (
            <div key={i} className={`flex items-start gap-2 rounded px-2.5 py-1.5 border text-xs ${RISK_COLOR[item.risk]}`}>
              <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${RISK_DOT[item.risk]}`} />
              <div className="flex-1 min-w-0">
                <span className="font-mono">"{item.text}"</span>
                {item.alternative && (
                  <span className="ml-2 text-gray-500">
                    → <span className="text-gray-400 italic">{item.alternative}</span>
                  </span>
                )}
              </div>
              <span className="capitalize text-gray-600 flex-shrink-0">{item.type}</span>
            </div>
          ))}
          <p className="text-[10px] text-gray-600 pt-1">
            Nora will protect these before your message reaches AI.
          </p>
        </div>
      )}
    </div>
  );
}
