/**
 * Unified AI provider for all Supabase Edge Functions.
 *
 * Behavior:
 *  - OpenAI is preferred if OPENAI_API_KEY is configured.
 *  - If OpenAI fails with 429, 402, or >=500, we immediately switch to Lovable AI Gateway.
 *  - If Lovable fails with 429, 402, or >=500, we retry the other provider with backoff.
 *  - All provider errors are normalized to a small set of friendly statuses.
 *
 * No provider-specific errors are exposed to the user.
 */

export interface UnifiedMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface UnifiedAIOptions {
  /** OpenAI model id. We map it to a Lovable gateway id when needed. */
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" } | { type: "text" };
  /** Force response_format=json_object. */
  json?: boolean;
}

export class UnifiedAIError extends Error {
  status: number;
  provider?: string;
  constructor(status: number, message: string, provider?: string) {
    super(message);
    this.status = status;
    this.name = "UnifiedAIError";
    if (provider) this.provider = provider;
  }
}

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const GATEWAY_MODEL_MAP: Record<string, string> = {
  "gpt-4o-mini": "openai/gpt-5.4-mini",
  "gpt-4o": "openai/gpt-5.5",
  "gpt-4o-latest": "openai/gpt-5.5",
  "gpt-4": "openai/gpt-5.5",
  "gpt-4-turbo": "openai/gpt-5.5",
  "gpt-3.5-turbo": "openai/gpt-5.4-mini",
};

function isRetryableStatus(status: number) {
  return status === 429 || status === 402 || status >= 500;
}

function gatewayModel(model?: string): string {
  if (!model) return "openai/gpt-5.4-mini";
  if (model.includes("/")) return model; // already a gateway id
  return GATEWAY_MODEL_MAP[model] || `openai/${model}`;
}

function buildBody(
  messages: UnifiedMessage[],
  opts: UnifiedAIOptions,
  useGateway: boolean,
): Record<string, unknown> {
  const openaiModel = opts.model || "gpt-4o-mini";
  const body: Record<string, unknown> = {
    model: useGateway ? gatewayModel(openaiModel) : openaiModel,
    messages,
    temperature: opts.temperature ?? 0.7,
  };
  if (opts.max_tokens) body.max_tokens = opts.max_tokens;
  if (opts.response_format) body.response_format = opts.response_format;
  else if (opts.json) body.response_format = { type: "json_object" };
  return body;
}

async function callProvider(
  useGateway: boolean,
  messages: UnifiedMessage[],
  opts: UnifiedAIOptions,
): Promise<{ content: string; usage?: unknown }> {
  const key = useGateway
    ? Deno.env.get("LOVABLE_API_KEY")
    : Deno.env.get("OPENAI_API_KEY");
  const providerName = useGateway ? "Lovable AI Gateway" : "OpenAI";

  if (!key) {
    throw new UnifiedAIError(500, `${providerName} key is not configured`, providerName);
  }

  const headers = useGateway
    ? { "Lovable-API-Key": key, "Content-Type": "application/json" }
    : { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

  const res = await fetch(useGateway ? GATEWAY_URL : OPENAI_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(buildBody(messages, opts, useGateway)),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`UnifiedAI ${providerName} error:`, res.status, text);
    if (res.status === 429) {
      throw new UnifiedAIError(429, "AI is busy right now. Please try again in a few seconds.", providerName);
    }
    if (res.status === 402) {
      throw new UnifiedAIError(402, "AI service temporarily unavailable. Please try again later.", providerName);
    }
    if (res.status >= 500) {
      throw new UnifiedAIError(502, "AI provider is having issues. Please try again.", providerName);
    }
    throw new UnifiedAIError(res.status, "AI request failed. Please try again.", providerName);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.toString().trim() || "";
  if (!content) {
    throw new UnifiedAIError(502, "AI returned an empty response. Please try again.", providerName);
  }
  return { content, usage: data.usage };
}

/**
 * Call a chat-completion with automatic provider fallback.
 * OpenAI is primary. Lovable AI Gateway is the fallback.
 */
export async function callUnifiedAI(
  messages: UnifiedMessage[],
  opts: UnifiedAIOptions = {},
): Promise<string> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (!openaiKey && !lovableKey) {
    throw new UnifiedAIError(500, "AI is not configured. Please add an API key.");
  }

  // Order: prefer OpenAI first, then Lovable.
  const order: boolean[] = openaiKey ? [false, true] : [true];
  let lastError: UnifiedAIError | undefined;

  for (const useGateway of order) {
    try {
      const result = await callProvider(useGateway, messages, opts);
      return result.content;
    } catch (e) {
      if (e instanceof UnifiedAIError && isRetryableStatus(e.status)) {
        lastError = e;
        console.warn(`UnifiedAI provider ${e.provider || "unknown"} failed (${e.status}), trying fallback...`);
        continue;
      }
      throw e;
    }
  }

  // If both providers failed with retryable errors, retry each once with backoff.
  for (let attempt = 1; attempt <= 2; attempt++) {
    for (const useGateway of order) {
      try {
        await new Promise((r) => setTimeout(r, attempt * 1200));
        const result = await callProvider(useGateway, messages, opts);
        return result.content;
      } catch (e) {
        if (e instanceof UnifiedAIError) lastError = e;
      }
    }
  }

  throw lastError || new UnifiedAIError(502, "All AI providers are unavailable. Please try again later.");
}

/**
 * Call a chat-completion and return parsed JSON.
 * Forces response_format=json_object.
 */
export async function callUnifiedAIJSON<T = any>(
  messages: UnifiedMessage[],
  opts: Omit<UnifiedAIOptions, "json" | "response_format"> = {},
): Promise<T> {
  const text = await callUnifiedAI(messages, { ...opts, json: true });
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new UnifiedAIError(502, "AI returned invalid JSON. Please try again.");
  }
}

/** Convenience one-shot system+user call. */
export async function askAI(system: string, user: string, opts?: UnifiedAIOptions): Promise<string> {
  return callUnifiedAI(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    opts,
  );
}

/** Convenience one-shot JSON system+user call. */
export async function askAIJSON<T = any>(system: string, user: string, opts?: Omit<UnifiedAIOptions, "json" | "response_format">): Promise<T> {
  return callUnifiedAIJSON<T>(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    opts,
  );
}
