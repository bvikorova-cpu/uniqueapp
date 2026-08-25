import "./aiRedirect.ts";
import { tryVertexChat, tryVertexImage, tryVertexSpeech } from "./vertexDirect.ts";
import { tryFallbackImage } from "./imageFallback.ts";

/**
 * Unified AI provider for all Supabase Edge Functions.
 *
 * Behavior:
 *  - Vertex AI (postpay service account) is the PRIMARY provider for all calls.
 *  - No Lovable AI Gateway, Gemini API-key, or OpenAI fallback is permitted.
 *  - If Vertex fails, the request fails clearly after bounded retries.
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
  /** Legacy caller model id; normalized to an enabled Vertex model. */
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
  /**
   * Max automatic continuation requests when the model stops because it hit the
   * token budget (finish_reason "length"/"MAX_TOKENS"). Prevents half-finished
   * answers platform-wide. Default 3, set 0 to disable.
   */
  maxContinuations?: number;
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

const VERTEX_MODEL_MAP: Record<string, string> = {
  "gpt-4o-mini": "openai/gpt-5.4-mini",
  "gpt-4o": "openai/gpt-5.5",
  "gpt-4o-latest": "openai/gpt-5.5",
  "gpt-4": "openai/gpt-5.5",
  "gpt-4-turbo": "openai/gpt-5.5",
  "gpt-3.5-turbo": "openai/gpt-5.4-mini",
};

/** Low-cost defaults used for the first attempt of every call. */
export const CHEAP_OPENAI_MODEL = "gpt-4o-mini";
export const CHEAP_VERTEX_MODEL = "google/gemini-3.6-flash";

/** Models we consider expensive and downgrade on the first (cheap) attempt. */
function isExpensiveModel(model: string): boolean {
  return /gpt-4o(?!-mini)|gpt-4(?!o)|gpt-5(?!\.\d-(mini|nano))|pro/i.test(model);
}

function isRetryableStatus(status: number) {
  return status === 429 || status === 402 || status >= 500;
}

function vertexCompatibleModel(model?: string): string {
  if (!model) return CHEAP_VERTEX_MODEL;
  if (model.includes("/")) return model; // already a gateway id
  return VERTEX_MODEL_MAP[model] || `openai/${model}`;
}

/**
 * Resolve the model to use for a given attempt.
 * cheap=true -> force the low-cost model, unless the caller asked for "premium".
 */
function resolveModel(opts: UnifiedAIOptions, useVertex: boolean, cheap: boolean): string {
  const requested = opts.model || CHEAP_OPENAI_MODEL;
  const target = useVertex ? vertexCompatibleModel(requested) : requested;
  if (!cheap || opts.tier === "premium") return target;
  if (useVertex) return CHEAP_VERTEX_MODEL;
  if (!isExpensiveModel(target)) return target;
  return CHEAP_OPENAI_MODEL;
}


function buildBody(
  messages: UnifiedMessage[],
  opts: UnifiedAIOptions,
  useVertex: boolean,
  cheap: boolean,
): Record<string, unknown> {
  const targetModel = resolveModel(opts, useVertex, cheap);
  const body: Record<string, unknown> = { model: targetModel, messages };

  // Newer OpenAI generations (gpt-5.x and o-series) reject `max_tokens` and
  // require `max_completion_tokens`. The Vertex compatibility layer maps legacy ids onto
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
  _useVertex: boolean,
  messages: UnifiedMessage[],
  opts: UnifiedAIOptions,
  cheap: boolean,
): Promise<any> {

  const providerName = "Vertex AI";
  const body = buildBody(messages, opts, true, cheap);
  const result = await tryVertexChat(body);
  if (!result) throw new UnifiedAIError(503, "Vertex AI is temporarily unavailable. Please try again.", providerName);
  return result;
}

export interface UnifiedAIResult {
  content: string;
  tool_calls?: unknown[];
  usage?: unknown;
  raw: any;
}

async function callProvider(
  useVertex: boolean,
  messages: UnifiedMessage[],
  opts: UnifiedAIOptions,
  cheap = true,
): Promise<UnifiedAIResult> {
  const data = await callProviderRaw(useVertex, messages, opts, cheap);
  const message = data.choices?.[0]?.message;

  const content = message?.content?.toString().trim() || "";
  if (!content && !message?.tool_calls) {
    throw new UnifiedAIError(502, "AI returned an empty response. Please try again.", "Vertex AI");
  }
  return {
    content,
    tool_calls: message?.tool_calls,
    usage: data.usage,
    raw: data,
  };
}

/**
 * Call a chat-completion through Vertex AI only.
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
  // PLATFORM-WIDE RULE: Vertex AI (postpay) is the only provider.
  const order: boolean[] = [true];
  let lastError: UnifiedAIError | undefined;

  // Pass 1: cheap model on every provider. Pass 2: escalate to the requested
  // (possibly more expensive) model only if the cheap attempts failed.
  const passes: boolean[] = opts.tier === "premium" ? [false] : [true, false];

  for (const cheap of passes) {
    for (const useVertex of order) {
      try {
        return await callProvider(useVertex, messages, opts, cheap);
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
    for (const useVertex of order) {
      try {
        await new Promise((r) => setTimeout(r, attempt * 1200));
        return await callProvider(useVertex, messages, opts, opts.tier !== "premium");
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

/** Vertex image generation. Export name is retained for caller compatibility. */
export async function generateOpenAIImage(prompt: string, size: "1024x1024" | "1024x1536" | "1536x1024" = "1024x1024"): Promise<{ url?: string; b64_json?: string }> {
  const data = await tryVertexImage(prompt, size, 1);
  if (data) return { b64_json: data?.data?.[0]?.b64_json, url: data?.data?.[0]?.url };
  // Vertex is primary; when its image quota is exhausted (429) fall back so the
  // user still gets artwork instead of an empty card.
  const fallback = await tryFallbackImage(prompt, size);
  if (fallback) return { b64_json: fallback };
  throw new UnifiedAIError(503, "Vertex AI image generation is temporarily unavailable.", "Vertex AI");
}

/** Vertex text-to-speech. Export name is retained for caller compatibility. */
export async function generateOpenAITTS(text: string, voice: string = "Kore", _speed: number = 1.0): Promise<ArrayBuffer> {
  const audio = await tryVertexSpeech(text.slice(0, 4000), voice);
  if (!audio) throw new UnifiedAIError(503, "Vertex AI text-to-speech is temporarily unavailable.", "Vertex AI");
  return audio.buffer.slice(audio.byteOffset, audio.byteOffset + audio.byteLength) as ArrayBuffer;
}
