import Anthropic from "@anthropic-ai/sdk";

export type LLMModel = "haiku" | "sonnet";

const MODEL_IDS: Record<LLMModel, string> = {
  haiku: "claude-haiku-4-5",
  sonnet: "claude-sonnet-4-5",
};

const DEFAULT_TIMEOUT_MS = 25_000;
const DEFAULT_MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 400;

let cachedClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.ANTHROPIC_API_KEY ?? process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new LLMNotConfiguredError(
      "ANTHROPIC_API_KEY (or OPENROUTER_API_KEY) is not set. Add it to .env.local."
    );
  }

  const usingOpenRouter = !process.env.ANTHROPIC_API_KEY && !!process.env.OPENROUTER_API_KEY;

  cachedClient = new Anthropic({
    apiKey,
    baseURL: usingOpenRouter ? "https://openrouter.ai/api/v1" : undefined,
    timeout: DEFAULT_TIMEOUT_MS,
    maxRetries: 0,
    defaultHeaders: usingOpenRouter
      ? {
          "HTTP-Referer": "https://nora-privacy.vercel.app",
          "X-Title": "Nora Privacy Governance",
        }
      : undefined,
  });

  return cachedClient;
}

export class LLMNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LLMNotConfiguredError";
  }
}

export class LLMError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "LLMError";
  }
}

export function isLLMConfigured(): boolean {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.OPENROUTER_API_KEY);
}

function resolveModel(model: LLMModel): string {
  const usingOpenRouter = !process.env.ANTHROPIC_API_KEY && !!process.env.OPENROUTER_API_KEY;
  return usingOpenRouter ? `anthropic/${MODEL_IDS[model]}` : MODEL_IDS[model];
}

function shouldRetry(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const anyErr = err as { status?: number; name?: string };
  if (anyErr.name === "APITimeoutError" || anyErr.name === "APIConnectionError") return true;
  const status = anyErr.status;
  return status === 408 || status === 429 || (typeof status === "number" && status >= 500);
}

async function withRetries<T>(fn: () => Promise<T>, retries = DEFAULT_MAX_RETRIES): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === retries || !shouldRetry(err)) break;
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 200;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new LLMError("LLM call failed after retries", lastErr);
}

export interface CompleteOptions {
  model?: LLMModel;
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}

export async function complete(opts: CompleteOptions): Promise<string> {
  const client = getClient();
  const model = resolveModel(opts.model ?? "sonnet");

  return withRetries(async () => {
    const response = await client.messages.create({
      model,
      system: opts.system,
      messages: [{ role: "user", content: opts.user }],
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.maxTokens ?? 1024,
    });

    const block = response.content.find((b) => b.type === "text");
    return block && block.type === "text" ? block.text.trim() : "";
  });
}

export interface ToolDefinition {
  name: string;
  description?: string;
  // JSON Schema describing the tool's input. Kept as `unknown` so callers can
  // pass through the SDK's type without us having to redeclare it here.
  input_schema: Record<string, unknown>;
}

export interface ToolCallOptions {
  model?: LLMModel;
  system: string;
  user: string;
  tool: ToolDefinition;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Calls the model and forces it to return a `tool_use` block matching the
 * provided tool's input_schema. Returns the structured `input` payload.
 */
export async function callWithTool<T>(opts: ToolCallOptions): Promise<T> {
  const client = getClient();
  const model = resolveModel(opts.model ?? "sonnet");

  return withRetries(async () => {
    const response = await client.messages.create({
      model,
      system: opts.system,
      messages: [{ role: "user", content: opts.user }],
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.maxTokens ?? 2048,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [opts.tool as any],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tool_choice: { type: "tool", name: opts.tool.name } as any,
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new LLMError(`Model did not return a tool_use block for "${opts.tool.name}"`);
    }
    return toolUse.input as T;
  });
}

/** Test-only: reset the cached client between unit tests. */
export function __resetClientForTests() {
  cachedClient = null;
}
