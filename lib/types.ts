export type Persona = "conservative" | "balanced" | "open";
export type DataCategory = "address" | "health" | "emotional" | "financial" | "academic" | "behavioral";
export type ConfirmationThreshold = "always" | "high-risk" | "never";
export type FeedbackType = "well-balanced" | "over-protected" | "under-protected";

export const ALL_CATEGORIES: DataCategory[] = ["address", "health", "emotional", "financial", "academic", "behavioral"];

export interface PersonaProfile {
  name: string;
  persona: Persona;
  blockedCategories: DataCategory[];
  confirmationThreshold: ConfirmationThreshold;
  createdAt: string;
}

export interface SensitiveItem {
  text: string;
  type: DataCategory;
  risk: "high" | "medium" | "low";
  reasoning?: string;
  alternative?: string;
}

export interface NoraResult {
  sensitive_detected: SensitiveItem[];
  rewritten_message: string;
  without_sentinel_response: string;
  with_sentinel_response: string;
  protection_score: number;
  persona_impact: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  originalMessage: string;
  persona: Persona;
  protection_score: number;
  sensitive_count: number;
}

// Per-category learned weights (0.0 = never block, 1.0 = always block)
export type CategoryWeights = Record<DataCategory, number>;

export const DEFAULT_WEIGHTS: Record<Persona, CategoryWeights> = {
  conservative: { address: 0.9, health: 0.9, emotional: 0.9, financial: 0.9, academic: 0.9, behavioral: 0.9 },
  balanced:     { address: 0.8, health: 0.8, financial: 0.8, emotional: 0.5, academic: 0.5, behavioral: 0.5 },
  open:         { address: 0.3, health: 0.3, financial: 0.3, emotional: 0.2, academic: 0.2, behavioral: 0.2 },
};

// Weekly budget: max exposures per category per week
export const WEEKLY_LIMITS: Record<DataCategory, number> = {
  address: 5, health: 3, financial: 3, emotional: 10, academic: 15, behavioral: 15,
};

export interface WeeklyBudgetStore {
  week: string; // ISO week string e.g. "2026-W18"
  usage: Record<DataCategory, number>;
}

// Agent Playground types
export type AgentVerdict = "clean" | "intercepted" | "blocked" | "negotiated";

export interface RawAgentStep {
  id: number;
  action: string;
  description: string;
  data_categories: DataCategory[];
  data_details: string;
  third_party: string;
  exposed_data: string;
  inferred_risk?: string;
}

export interface AgentStep extends RawAgentStep {
  verdict: AgentVerdict;
  nora_action: string;
  alternative_service?: string;
  minimized_data?: string;
}

export interface AgentTraceSummary {
  total_steps: number;
  clean: number;
  intercepted: number;
  blocked: number;
  negotiated: number;
  data_protected: DataCategory[];
  third_parties_blocked: string[];
  standard_agent_exposure: string[];
}

export interface AgentTrace {
  goal_summary: string;
  auto_persona?: Persona;
  auto_persona_reason?: string;
  steps: AgentStep[];
  summary: AgentTraceSummary;
}
