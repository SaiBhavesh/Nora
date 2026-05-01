"use client";
import { useEffect, useState, useCallback } from "react";
import {
  CategoryWeights, DataCategory, FeedbackType, Persona,
  DEFAULT_WEIGHTS, ALL_CATEGORIES,
} from "./types";

const STORAGE_KEY = "nora_learning";
const STEP = 0.12;
const MIN_WEIGHT = 0.05;
const MAX_WEIGHT = 1.0;
const BLOCK_THRESHOLD = 0.45;

export function usePersonaLearning(persona: Persona) {
  const [weights, setWeights] = useState<CategoryWeights>(() => ({ ...DEFAULT_WEIGHTS[persona] }));

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<CategoryWeights>;
        setWeights((prev) => ({ ...prev, ...parsed }));
      } else {
        setWeights({ ...DEFAULT_WEIGHTS[persona] });
      }
    } catch {
      setWeights({ ...DEFAULT_WEIGHTS[persona] });
    }
  }, [persona]);

  const applyFeedback = useCallback(
    (affectedCategories: DataCategory[], feedback: FeedbackType) => {
      if (feedback === "well-balanced") return;
      setWeights((prev) => {
        const next = { ...prev };
        const targets = affectedCategories.length > 0 ? affectedCategories : ALL_CATEGORIES;
        for (const cat of targets) {
          if (feedback === "over-protected") {
            next[cat] = Math.max(MIN_WEIGHT, (next[cat] ?? 0.5) - STEP);
          } else {
            next[cat] = Math.min(MAX_WEIGHT, (next[cat] ?? 0.5) + STEP);
          }
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  function resetLearning() {
    const defaults = { ...DEFAULT_WEIGHTS[persona] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    setWeights(defaults);
  }

  // Returns categories that should be blocked based on learned weights
  function getLearnedBlockedCategories(): DataCategory[] {
    return ALL_CATEGORIES.filter((cat) => (weights[cat] ?? 0.5) >= BLOCK_THRESHOLD);
  }

  return { weights, applyFeedback, resetLearning, getLearnedBlockedCategories };
}
