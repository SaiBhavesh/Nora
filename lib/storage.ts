"use client";

import {
  CategoryWeightsSchema,
  HistoryEntrySchema,
  PersonaProfileSchema,
  WeeklyBudgetStoreSchema,
} from "@/lib/schemas";
import type {
  CategoryWeights,
  HistoryEntry,
  PersonaProfile,
  WeeklyBudgetStore,
} from "@/lib/types";
import { z } from "zod";

/**
 * Versioned localStorage with migration shims.
 *
 * Every record we persist is wrapped in `{ v, data }`. Bumping `CURRENT_VERSION`
 * and registering a migrator below lets us evolve the shape of stored data
 * without silently corrupting returning users — which was a real risk before
 * (see development_plan.md §1.1.5).
 *
 * Public API surface mirrors the prior hook-based stores so callers can switch
 * to it incrementally.
 */

export const CURRENT_VERSION = 1;

export const STORAGE_KEYS = {
  profile: "nora_profile",
  history: "nora_history",
  budget: "nora_budget",
  learning: "nora_learning",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

interface Envelope<T> {
  v: number;
  data: T;
}

type Migrator = (raw: unknown) => unknown;

/**
 * Per-key migrators. Each entry takes the *previous* envelope's `data` field
 * and returns the next version's `data`. Add a new entry whenever you bump
 * `CURRENT_VERSION` for a key.
 */
const MIGRATORS: Record<StorageKey, Record<number, Migrator>> = {
  [STORAGE_KEYS.profile]: {},
  [STORAGE_KEYS.history]: {},
  [STORAGE_KEYS.budget]: {},
  [STORAGE_KEYS.learning]: {},
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * Reads, validates, and migrates a stored value. If the stored value is
 * missing, malformed, or fails schema validation, returns `null` (callers
 * should fall back to a default rather than trust corrupted data).
 */
export function readVersioned<T>(
  key: StorageKey,
  schema: z.ZodType<T>,
): T | null {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(key);
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  // Backwards compat: accept un-enveloped legacy values written before this
  // module existed. Treat them as v0 and migrate forward.
  let envelope: Envelope<unknown>;
  if (parsed && typeof parsed === "object" && "v" in parsed && "data" in parsed) {
    envelope = parsed as Envelope<unknown>;
  } else {
    envelope = { v: 0, data: parsed };
  }

  const migrators = MIGRATORS[key];
  let data = envelope.data;
  for (let v = envelope.v; v < CURRENT_VERSION; v++) {
    const migrate = migrators[v];
    if (migrate) {
      data = migrate(data);
    }
  }

  const result = schema.safeParse(data);
  if (!result.success) {
    if (typeof console !== "undefined") {
      console.warn(`[storage] schema validation failed for "${key}", discarding`, result.error.issues);
    }
    return null;
  }
  return result.data;
}

export function writeVersioned<T>(key: StorageKey, value: T): void {
  if (!isBrowser()) return;
  const envelope: Envelope<T> = { v: CURRENT_VERSION, data: value };
  try {
    window.localStorage.setItem(key, JSON.stringify(envelope));
  } catch (err) {
    if (typeof console !== "undefined") {
      console.warn(`[storage] failed to write "${key}"`, err);
    }
  }
}

export function clearKey(key: StorageKey): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}

export function clearAll(): void {
  if (!isBrowser()) return;
  for (const key of Object.values(STORAGE_KEYS)) {
    window.localStorage.removeItem(key);
  }
}

// ----- Typed accessors -----

export const profileStore = {
  read: () => readVersioned(STORAGE_KEYS.profile, PersonaProfileSchema) as PersonaProfile | null,
  write: (p: PersonaProfile) => writeVersioned(STORAGE_KEYS.profile, p),
  clear: () => clearKey(STORAGE_KEYS.profile),
};

export const historyStore = {
  read: () => {
    const v = readVersioned(STORAGE_KEYS.history, z.array(HistoryEntrySchema));
    return (v ?? []) as HistoryEntry[];
  },
  write: (entries: HistoryEntry[]) => writeVersioned(STORAGE_KEYS.history, entries),
  clear: () => clearKey(STORAGE_KEYS.history),
};

export const budgetStore = {
  read: () => readVersioned(STORAGE_KEYS.budget, WeeklyBudgetStoreSchema) as WeeklyBudgetStore | null,
  write: (b: WeeklyBudgetStore) => writeVersioned(STORAGE_KEYS.budget, b),
  clear: () => clearKey(STORAGE_KEYS.budget),
};

export const learningStore = {
  read: () => readVersioned(STORAGE_KEYS.learning, CategoryWeightsSchema) as CategoryWeights | null,
  write: (w: CategoryWeights) => writeVersioned(STORAGE_KEYS.learning, w),
  clear: () => clearKey(STORAGE_KEYS.learning),
};
