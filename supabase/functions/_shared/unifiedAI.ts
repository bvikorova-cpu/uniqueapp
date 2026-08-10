import "../_shared/aiRedirect.ts";
import "./aiRedirect.ts";
import { hasDirectGemini, tryDirectGeminiChat } from "./geminiDirect.ts";

/**
 * Unified AI provider for all Supabase Edge Functions.
 *
 * Behavior:
 *  - Vertex AI (postpay service account) is the PRIMARY provider for all calls.
 *  - The Lovable AI Gateway is only used as a fallback when Vertex is unavailable.
 *  - If Vertex fails with a retryable status (429, 402, >=500), we fall back to
 *    the Lovable AI Gateway with backoff.
 *  - OpenAI is never called directly.
 *
 * No provider-specific errors are exposed to the user.
 */

export interface UnifiedMessage {
  role: "system" | "user" | "assistant";
  content: string | null;
  /** Optional for tool results. */
  name?: string;
  tool_calls?: unknown[];
  tool_call_id?: string;
}

export interface UnifiedToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters?: Record<string, unknown>;
  };
}

export interface UnifiedAIOptions {
  /** OpenAI model id. We map it to a Lovable gateway id when needed. */
  model?: string;
  temperature?: number;
  max_tokens?: number;
  max_completion_tokens?: number;
  response_format?: { type: "json_object" } | { type: "text" };
  /** Force response_format=json_object. */
  json?: boolean;
  tools?: UnifiedToolDefinition[];
  tool_choice?: "auto" | "none" | { type: "function"; function: { name: string } };
  /**
   * Cost tier. Default "cheap": the first attempt always uses a low-cost model
   * (gpt-4o-mini / gemini-3.6-flash) and only escalates to the requested,
   * more expensive model if the cheap attempt fails.
   * Set "premium" to always use the requested model directly.
   */
  tier?: "cheap" | "premium";
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

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const GATEWAY_MODEL_MAP: Record<string, string> = {
  "gpt-4o-mini": "openai/gpt-5.4-mini",
  "gpt-4o": "openai/gpt-5.5",
  "gpt-4o-latest": "openai/gpt-5.5",
  "gpt-4": "openai/gpt-5.5",
  "gpt-4-turbo": "openai/gpt-5.5",
  "gpt-3.5-turbo": "openai/gpt-5.4-mini",
};

/** Low-cost defaults used for the first attempt of every call. */
export const CHEAP_OPENAI_MODEL = "gpt-4o-mini";
export const CHEAP_GATEWAY_MODEL = "google/gemini-3.6-flash";

/** Models we consider expensive and downgrade on the first (cheap) attempt. */
function isExpensiveModel(model: string): boolean {
  return /gpt-4o(?!-mini)|gpt-4(?!o)|gpt-5(?!\.\d-(mini|nano))|pro/i.test(model);
}

function isRetryableStatus(status: number) {
  return status === 429 || status === 402 || status >= 500;
}

function gatewayModel(model?: string): string {
  if (!model) return CHEAP_GATEWAY_MODEL;
  if (model.includes("/")) return model; // already a gateway id
  return GATEWAY_MODEL_MAP[model] || `openai/${model}`;
}

/**
 * Resolve the model to use for a given attempt.
 * cheap=true -> force the low-cost model, unless the caller asked for "premium".
 */
function resolveModel(opts: UnifiedAIOptions, useGateway: boolean, cheap: boolean): string {
  const requested = opts.model || CHEAP_OPENAI_MODEL;
  const target = useGateway ? gatewayModel(requested) : requested;
  if (!cheap || opts.tier === "premium") return target;
  if (useGateway) return CHEAP_GATEWAY_MODEL;
  if (!isExpensiveModel(target)) return target;
  return CHEAP_OPENAI_MODEL;
}


function buildBody(
  messages: UnifiedMessage[],
  opts: UnifiedAIOptions,
  useGateway: boolean,
  cheap: boolean,
): Record<string, unknown> {
  const targetModel = resolveModel(opts, useGateway, cheap);
  const body: Record<string, unknown> = { model: targetModel, messages };

  // Newer OpenAI generations (gpt-5.x and o-series) reject `max_tokens` and
  // require `max_completion_tokens`. The Lovable gateway maps legacy ids onto
  // those models, so translate the body instead of failing with a 400.
  const needsCompletionTokens = /gpt-5|o1|o3|o4/i.test(targetModel);
  const requested = opts.max_completion_tokens ?? opts.max_tokens;

  // gpt-5.x rejects non-default temperature.
  if (opts.temperature !== undefined && !needsCompletionTokens) body.temperature = opts.temperature;
  // Gemini "flash" models also spend hidden thinking tokens before emitting
  // text, so a tight limit returns an empty answer. Keep headroom everywhere.
  const isThinkingModel = needsCompletionTokens || /gemini/i.test(targetModel);
  if (requested) {
    const budget = isThinkingModel ? Math.max(requested, 2048) : requested;
    if (needsCompletionTokens) body.max_completion_tokens = budget;
    else body.max_tokens = budget;
  } else if (isThinkingModel) {
    if (needsCompletionTokens) body.max_completion_tokens = 2048;
    else body.max_tokens = 2048;
  }


  if (opts.response_format) body.response_format = opts.response_format;
  else if (opts.json) body.response_format = { type: "json_object" };
  if (opts.tools?.length) body.tools = opts.tools;
  if (opts.tool_choice) body.tool_choice = opts.tool_choice;
  return body;
}


async function callProviderRaw(
  useGateway: boolean,
  messages: UnifiedMessage[],
  opts: UnifiedAIOptions,
  cheap: boolean,
): Promise<any> {

  const key = Deno.env.get("LOVABLE_API_KEY");
  const providerName = "Lovable AI Gateway";
  const body = buildBody(messages, opts, true, cheap);

  // 1) Try the project's own Gemini API key first (cheapest, highest limits).
  if (hasDirectGemini()) {
    const direct = await tryDirectGeminiChat(body);
    if (direct) return direct;
  }

  // 2) Fall back to the Lovable AI Gateway.
  if (!key) {
    throw new UnifiedAIError(500, `${providerName} key is not configured`, providerName);
  }

  const headers = { "Lovable-API-Key": key, "Content-Type": "application/json" };

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
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

  return await res.json();
}

export interface UnifiedAIResult {
  content: string;
  tool_calls?: unknown[];
  usage?: unknown;
  raw: any;
}

async function callProvider(
  useGateway: boolean,
  messages: UnifiedMessage[],
  opts: UnifiedAIOptions,
  cheap = true,
): Promise<UnifiedAIResult> {
  const data = await callProviderRaw(useGateway, messages, opts, cheap);
  const message = data.choices?.[0]?.message;

  const content = message?.content?.toString().trim() || "";
  if (!content && !message?.tool_calls) {
    throw new UnifiedAIError(502, "AI returned an empty response. Please try again.", "Lovable AI Gateway");
  }
  return {
    content,
    tool_calls: message?.tool_calls,
    usage: data.usage,
    raw: data,
  };
}

/**
 * Call a chat-completion with automatic provider fallback.
 * OpenAI is primary. Lovable AI Gateway is the fallback.
 */
export async function callUnifiedAI(
  messages: UnifiedMessage[],
  opts: UnifiedAIOptions = {},
): Promise<string> {
  const result = await callUnifiedAIEx(messages, opts);
  return result.content;
}

export async function callUnifiedAIEx(
  messages: UnifiedMessage[],
  opts: UnifiedAIOptions = {},
): Promise<UnifiedAIResult> {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableKey) {
    throw new UnifiedAIError(500, "AI is not configured. Please add an API key.");
  }

  // PLATFORM-WIDE RULE: Vertex AI (postpay) is primary. Lovable gateway is fallback. OpenAI is never used.
  const order: boolean[] = [true];
  let lastError: UnifiedAIError | undefined;

  // Pass 1: cheap model on every provider. Pass 2: escalate to the requested
  // (possibly more expensive) model only if the cheap attempts failed.
  const passes: boolean[] = opts.tier === "premium" ? [false] : [true, false];

  for (const cheap of passes) {
    for (const useGateway of order) {
      try {
        return await callProvider(useGateway, messages, opts, cheap);
      } catch (e) {
        if (e instanceof UnifiedAIError && isRetryableStatus(e.status)) {
          lastError = e;
          console.warn(
            `UnifiedAI ${e.provider || "unknown"} (${cheap ? "cheap" : "premium"}) failed (${e.status}), trying fallback...`,
          );
          continue;
        }
        throw e;
      }
    }
  }

  // Final backoff retry with the cheap model.
  for (let attempt = 1; attempt <= 2; attempt++) {
    for (const useGateway of order) {
      try {
        await new Promise((r) => setTimeout(r, attempt * 1200));
        return await callProvider(useGateway, messages, opts, opts.tier !== "premium");
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
  let lastRaw = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await callUnifiedAI(messages, { ...opts, json: true });
    lastRaw = text;
    const parsed = tryParseLooseJSON<T>(text);
    if (parsed !== undefined) return parsed;
  }
  console.error("UnifiedAI invalid JSON response:", lastRaw.slice(0, 500));
  throw new UnifiedAIError(502, "AI returned invalid JSON. Please try again.");
}

/** Best-effort JSON extraction: strips fences, finds the JSON block, repairs truncation. */
function tryParseLooseJSON<T>(raw: string): T | undefined {
  if (!raw) return undefined;
  let s = raw.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

  const start = s.search(/[{[]/);
  if (start > 0) s = s.slice(start);

  const candidates = [s, repairTruncatedJSON(s)];
  for (const c of candidates) {
    if (!c) continue;
    try {
      return JSON.parse(c) as T;
    } catch { /* try next */ }
  }
  return undefined;
}

/** Closes unterminated strings/brackets so a truncated response can still parse. */
function repairTruncatedJSON(s: string): string | null {
  const stack: string[] = [];
  let inString = false;
  let escaped = false;
  let lastSafe = -1;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{" || ch === "[") stack.push(ch === "{" ? "}" : "]");
    else if (ch === "}" || ch === "]") stack.pop();
    else if (ch === "," || ch === "}" || ch === "]") lastSafe = i;
    if (!inString && (ch === "}" || ch === "]" || ch === "," )) lastSafe = i;
  }

  let out = s;
  if (inString) out += '"';
  // Drop a dangling trailing comma or partial key/value
  out = out.replace(/,\s*$/, "");
  if (/:\s*$/.test(out)) out += "null";
  out = out.replace(/,\s*("(?:[^"\\]|\\.)*")\s*$/, "");
  while (stack.length) out += stack.pop();
  return out === s ? null : out;
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

/** Image generation via OpenAI Images API (no gateway fallback for images). */
export async function generateOpenAIImage(prompt: string, size: "1024x1024" | "1024x1536" | "1536x1024" = "1024x1024"): Promise<{ url?: string; b64_json?: string }> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new UnifiedAIError(500, "AI image generation is not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
    method: "POST",
    headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "openai/gpt-image-1-mini", prompt, n: 1, size, quality: "low" }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("OpenAI image generation error:", res.status, text);
    throw new UnifiedAIError(res.status === 429 ? 429 : res.status === 402 ? 402 : 502, "Image generation failed. Please try again.");
  }
  const data = await res.json();
  return { b64_json: data?.data?.[0]?.b64_json, url: data?.data?.[0]?.url };
}

/** Text-to-speech via OpenAI TTS API (no gateway fallback for audio). */
export async function generateOpenAITTS(text: string, voice: string = "nova", speed: number = 1.0): Promise<ArrayBuffer> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new UnifiedAIError(500, "LOVABLE_API_KEY is not configured for TTS");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
    method: "POST",
    headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "openai/gpt-4o-mini-tts", voice, input: text.slice(0, 4000), response_format: "mp3", speed }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("OpenAI TTS error:", res.status, text);
    throw new UnifiedAIError(res.status === 429 ? 429 : res.status === 402 ? 402 : 502, "Text-to-speech failed. Please try again.");
  }
  return await res.arrayBuffer();
}
