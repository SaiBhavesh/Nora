import { z } from "zod";

export const PersonaSchema = z.enum(["conservative", "balanced", "open"]);

export const DataCategorySchema = z.enum([
  "address",
  "health",
  "emotional",
  "financial",
  "academic",
  "behavioral",
]);

export const ConfirmationThresholdSchema = z.enum(["always", "high-risk", "never"]);

export const RiskSchema = z.enum(["high", "medium", "low"]);

export const FeedbackTypeSchema = z.enum([
  "well-balanced",
  "over-protected",
  "under-protected",
]);

export const SensitiveItemSchema = z.object({
  text: z.string().min(1),
  type: DataCategorySchema,
  risk: RiskSchema,
  reasoning: z.string().optional(),
  alternative: z.string().optional(),
});

export const NoraResultSchema = z.object({
  sensitive_detected: z.array(SensitiveItemSchema),
  rewritten_message: z.string(),
  without_sentinel_response: z.string(),
  with_sentinel_response: z.string(),
  protection_score: z.number().min(0).max(100),
  persona_impact: z.string(),
});

// ----- /api/intercept -----

export const InterceptInputSchema = z.object({
  message: z.string().min(1).max(4000),
  persona: PersonaSchema.default("balanced"),
  blockedCategories: z.array(DataCategorySchema).default([]),
});
export type InterceptInput = z.infer<typeof InterceptInputSchema>;

export const InterceptOutputSchema = NoraResultSchema;
export type InterceptOutput = z.infer<typeof InterceptOutputSchema>;

// ----- /api/scan -----

export const ScanInputSchema = z.object({
  message: z.string(),
});
export type ScanInput = z.infer<typeof ScanInputSchema>;

export const ScanOutputSchema = z.object({
  sensitive_detected: z.array(SensitiveItemSchema),
});
export type ScanOutput = z.infer<typeof ScanOutputSchema>;

// ----- /api/compare -----

export const CompareInputSchema = z.object({
  message: z.string().min(1).max(4000),
});
export type CompareInput = z.infer<typeof CompareInputSchema>;

export const ComparePersonaResultSchema = z.object({
  sensitive_detected: z.array(SensitiveItemSchema),
  rewritten_message: z.string(),
  protection_score: z.number(),
  persona_impact: z.string(),
});

export const CompareOutputSchema = z.object({
  conservative: ComparePersonaResultSchema.partial(),
  balanced: ComparePersonaResultSchema.partial(),
  open: ComparePersonaResultSchema.partial(),
});
export type CompareOutput = z.infer<typeof CompareOutputSchema>;

// ----- /api/agent -----

export const AgentVerdictSchema = z.enum([
  "clean",
  "intercepted",
  "blocked",
  "negotiated",
]);

export const RawAgentStepSchema = z.object({
  id: z.number(),
  action: z.string(),
  description: z.string(),
  data_categories: z.array(DataCategorySchema),
  data_details: z.string(),
  third_party: z.string(),
  exposed_data: z.string(),
  inferred_risk: z.string().optional().default(""),
});

export const AgentStepSchema = RawAgentStepSchema.extend({
  verdict: AgentVerdictSchema,
  nora_action: z.string(),
  alternative_service: z.string().optional(),
  minimized_data: z.string().optional(),
});

export const AgentTraceSummarySchema = z.object({
  total_steps: z.number(),
  clean: z.number(),
  intercepted: z.number(),
  blocked: z.number(),
  negotiated: z.number(),
  data_protected: z.array(DataCategorySchema),
  third_parties_blocked: z.array(z.string()),
  standard_agent_exposure: z.array(DataCategorySchema),
});

export const AgentTraceSchema = z.object({
  goal_summary: z.string(),
  auto_persona: PersonaSchema.optional(),
  auto_persona_reason: z.string().optional(),
  steps: z.array(AgentStepSchema),
  summary: AgentTraceSummarySchema,
});

export const AgentInputSchema = z.object({
  goal: z.string().min(1).max(2000),
  persona: PersonaSchema.default("balanced"),
});
export type AgentInput = z.infer<typeof AgentInputSchema>;

export const AgentOutputSchema = AgentTraceSchema;
export type AgentOutput = z.infer<typeof AgentOutputSchema>;

// ----- Storage payloads (used by lib/storage.ts) -----

export const PersonaProfileSchema = z.object({
  name: z.string(),
  persona: PersonaSchema,
  blockedCategories: z.array(DataCategorySchema),
  confirmationThreshold: ConfirmationThresholdSchema,
  createdAt: z.string(),
});

export const HistoryEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  originalMessage: z.string(),
  persona: PersonaSchema,
  protection_score: z.number(),
  sensitive_count: z.number(),
});

export const CategoryWeightsSchema = z.object({
  address: z.number(),
  health: z.number(),
  emotional: z.number(),
  financial: z.number(),
  academic: z.number(),
  behavioral: z.number(),
});

export const WeeklyBudgetStoreSchema = z.object({
  week: z.string(),
  usage: CategoryWeightsSchema, // numeric per-category, same shape
});

// ----- Helpers -----

/**
 * Parse a value with a Zod schema, throwing a tagged error so API routes can
 * return a clean 400/500 response with structured details.
 */
export class SchemaError extends Error {
  constructor(message: string, public readonly issues: z.ZodIssue[]) {
    super(message);
    this.name = "SchemaError";
  }
}

export function parseOrThrow<T>(schema: z.ZodType<T>, value: unknown, label: string): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new SchemaError(`Invalid ${label}`, result.error.issues);
  }
  return result.data;
}
