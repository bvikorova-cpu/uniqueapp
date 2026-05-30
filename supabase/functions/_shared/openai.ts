// Centralized OpenAI API wrapper for all edge functions.
// Handles auth, default model (gpt-4o), error normalization (429/402/5xx),
// and consistent request/response shape.
//
// Usage:
//   import { callOpenAI, callOpenAIJSON } from "../_shared/openai.ts";
//   const reply = await callOpenAI({ system: "...", user: "..." });

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
export const DEFAULT_MODEL = "gpt-4o";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function errorResponse(message: string, status = 500): Response {
  return jsonResponse({ error: message }, status);
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export interface CallOptions {
  messages?: ChatMessage[];
  system?: string;
  user?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" } | { type: "text" };
}

export class OpenAIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function buildMessages(opts: CallOptions): ChatMessage[] {
  if (opts.messages?.length) return opts.messages;
  const m: ChatMessage[] = [];
  if (opts.system) m.push({ role: "system", content: opts.system });
  if (opts.user) m.push({ role: "user", content: opts.user });
  return m;
}

export async function callOpenAIRaw(opts: CallOptions): Promise<any> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) throw new OpenAIError("OPENAI_API_KEY is not configured", 500);

  const body: Record<string, unknown> = {
    model: opts.model || DEFAULT_MODEL,
    messages: buildMessages(opts),
  };
  if (opts.temperature !== undefined) body.temperature = opts.temperature;
  if (opts.max_tokens !== undefined) body.max_tokens = opts.max_tokens;
  if (opts.response_format) body.response_format = opts.response_format;

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status === 429) throw new OpenAIError("Rate limit exceeded, please try again later.", 429);
  if (res.status === 402 || res.status === 401) {
    throw new OpenAIError("OpenAI auth/quota issue. Please check your OPENAI_API_KEY or billing.", 402);
  }
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error("OpenAI error", res.status, t);
    throw new OpenAIError(`OpenAI error (${res.status})`, 500);
  }
  return await res.json();
}

/** Returns the assistant text content. */
export async function callOpenAI(opts: CallOptions): Promise<string> {
  const data = await callOpenAIRaw(opts);
  return data.choices?.[0]?.message?.content?.trim() || "";
}

/** Returns parsed JSON. Forces response_format=json_object. */
export async function callOpenAIJSON<T = any>(opts: CallOptions): Promise<T> {
  const text = await callOpenAI({ ...opts, response_format: { type: "json_object" } });
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned) as T;
}
