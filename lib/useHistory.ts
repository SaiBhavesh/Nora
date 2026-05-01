"use client";
import { useEffect, useState, useCallback } from "react";
import { HistoryEntry } from "./types";

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nora_history");
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const addEntry = useCallback((entry: HistoryEntry) => {
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, 30);
      localStorage.setItem("nora_history", JSON.stringify(next));
      return next;
    });
  }, []);

  function clearHistory() {
    setHistory([]);
    localStorage.removeItem("nora_history");
  }

  return { history, addEntry, clearHistory };
}
