"use client";
import { useEffect, useState, useCallback } from "react";
import { DataCategory, WeeklyBudgetStore, WEEKLY_LIMITS, ALL_CATEGORIES } from "./types";

const STORAGE_KEY = "nora_budget";

function getISOWeek(): string {
  const now = new Date();
  const jan4 = new Date(now.getFullYear(), 0, 4);
  const week = Math.ceil(((now.getTime() - jan4.getTime()) / 86400000 + jan4.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function emptyStore(): WeeklyBudgetStore {
  const usage = Object.fromEntries(ALL_CATEGORIES.map((c) => [c, 0])) as Record<DataCategory, number>;
  return { week: getISOWeek(), usage };
}

export function usePrivacyBudget() {
  const [store, setStore] = useState<WeeklyBudgetStore>(emptyStore);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WeeklyBudgetStore;
        if (parsed.week === getISOWeek()) {
          setStore(parsed);
          return;
        }
      }
    } catch {}
    const fresh = emptyStore();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setStore(fresh);
  }, []);

  // Call after each intercept with the categories that were detected (exposed to analysis)
  const recordExposure = useCallback((categories: DataCategory[]) => {
    setStore((prev) => {
      const next: WeeklyBudgetStore = {
        week: getISOWeek(),
        usage: { ...prev.usage },
      };
      for (const cat of categories) {
        next.usage[cat] = (next.usage[cat] ?? 0) + 1;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  function getBudgetStatus(cat: DataCategory) {
    const used = store.usage[cat] ?? 0;
    const limit = WEEKLY_LIMITS[cat];
    return { used, limit, remaining: Math.max(0, limit - used), pct: Math.min(1, used / limit) };
  }

  function resetBudget() {
    const fresh = emptyStore();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setStore(fresh);
  }

  return { store, recordExposure, getBudgetStatus, resetBudget };
}
