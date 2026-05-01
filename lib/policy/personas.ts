import type {
  CategoryWeights,
  DataCategory,
  Persona,
} from "@/lib/types";
import type { RiskLevel } from "@/lib/thirdPartyRegistry";

/**
 * Single source of truth for persona behavior. All API routes, prompts, and
 * resolvers should consume this — never restate persona rules in English.
 *
 * - `categoryWeights`: per-category sensitivity (0..1). Higher = more
 *   protective. The runtime resolver uses these as the base weight before
 *   learning adjustments are applied.
 * - `serviceTrust`: per-risk-level decision when the agent calls out to a
 *   third-party service.
 * - `confirmationThreshold`: sensitivity at which to require user confirmation
 *   instead of auto-allowing.
 * - `inferenceProtection`: when true, indirectly-implied sensitive context
 *   (e.g. a clinic visit implying health) is treated as sensitive too.
 * - `locationPrecision` / `calendarVisibility` / `financialDetail`:
 *   minimization presets used by the rewriter when exposure is unavoidable.
 */
export interface PersonaPolicy {
  persona: Persona;
  label: string;
  description: string;
  categoryWeights: CategoryWeights;
  serviceTrust: Record<RiskLevel, "allow" | "confirm" | "block">;
  confirmationThreshold: number;
  inferenceProtection: boolean;
  locationPrecision: "exact" | "neighborhood" | "city" | "region";
  calendarVisibility: "full" | "title-only" | "free-busy" | "none";
  financialDetail: "raw" | "tokenized" | "category-only" | "none";
}

export const PERSONAS: Record<Persona, PersonaPolicy> = {
  conservative: {
    persona: "conservative",
    label: "Conservative",
    description:
      "Block exact locations, all health signals, emotional state, financial hints, and behavioral patterns. Prefer institutional alternatives over consumer services.",
    categoryWeights: {
      address: 0.95,
      health: 0.95,
      emotional: 0.9,
      financial: 0.9,
      academic: 0.8,
      behavioral: 0.85,
    },
    serviceTrust: { high: "block", medium: "block", low: "allow" },
    confirmationThreshold: 0.4,
    inferenceProtection: true,
    locationPrecision: "city",
    calendarVisibility: "free-busy",
    financialDetail: "category-only",
  },
  balanced: {
    persona: "balanced",
    label: "Balanced",
    description:
      "Block clearly sensitive disclosures — exact addresses, explicit health conditions, raw financial detail, emotional state — while allowing general context for usability.",
    categoryWeights: {
      address: 0.8,
      health: 0.8,
      emotional: 0.65,
      financial: 0.75,
      academic: 0.5,
      behavioral: 0.55,
    },
    serviceTrust: { high: "block", medium: "confirm", low: "allow" },
    confirmationThreshold: 0.6,
    inferenceProtection: true,
    locationPrecision: "neighborhood",
    calendarVisibility: "title-only",
    financialDetail: "tokenized",
  },
  open: {
    persona: "open",
    label: "Open",
    description:
      "Allow most data through. Block only the riskiest direct disclosures — explicit medical conditions and raw financial details.",
    categoryWeights: {
      address: 0.55,
      health: 0.85,
      emotional: 0.3,
      financial: 0.85,
      academic: 0.25,
      behavioral: 0.3,
    },
    serviceTrust: { high: "confirm", medium: "allow", low: "allow" },
    confirmationThreshold: 0.8,
    inferenceProtection: false,
    locationPrecision: "exact",
    calendarVisibility: "full",
    financialDetail: "tokenized",
  },
};

export function getPolicy(persona: Persona): PersonaPolicy {
  return PERSONAS[persona] ?? PERSONAS.balanced;
}

/**
 * Categories considered "sensitive" for a given persona — i.e. those whose
 * weight is above the confirmation threshold. The agent route uses this to
 * decide which detected categories should be intercepted vs. allowed through.
 */
export function sensitiveCategoriesFor(persona: Persona): DataCategory[] {
  const policy = getPolicy(persona);
  const threshold = policy.confirmationThreshold;
  return (Object.keys(policy.categoryWeights) as DataCategory[]).filter(
    (cat) => policy.categoryWeights[cat] >= threshold
  );
}

/**
 * Decision for a third-party service of a given risk level under this persona.
 */
export function decisionForService(
  persona: Persona,
  riskLevel: RiskLevel
): "allow" | "confirm" | "block" {
  return getPolicy(persona).serviceTrust[riskLevel];
}

export function shouldBlockService(persona: Persona, riskLevel: RiskLevel): boolean {
  return decisionForService(persona, riskLevel) === "block";
}

/**
 * Renders the persona policy as compact, structured data that can be embedded
 * in an LLM system prompt — replaces hand-restated English rules.
 */
export function policyAsPromptData(persona: Persona): string {
  const p = getPolicy(persona);
  return JSON.stringify(
    {
      persona: p.persona,
      label: p.label,
      description: p.description,
      categoryWeights: p.categoryWeights,
      serviceTrust: p.serviceTrust,
      confirmationThreshold: p.confirmationThreshold,
      inferenceProtection: p.inferenceProtection,
      locationPrecision: p.locationPrecision,
      calendarVisibility: p.calendarVisibility,
      financialDetail: p.financialDetail,
    },
    null,
    2
  );
}
