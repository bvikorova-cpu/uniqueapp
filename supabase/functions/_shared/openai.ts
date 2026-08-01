// Centralized AI API wrapper for all edge functions.
// Now uses both OpenAI and Lovable AI Gateway with automatic fallback.
// OpenAI is primary; Lovable is the fallback when OpenAI is rate-limited (429),
// out of quota (402), or experiences a server error (>=500).
//
// Usage:
//   import { callOpenAI, callOpenAIJSON } from "../_shared/openai.ts";
//   const reply = await callOpenAI({ system: "...", user: "..." });

import {
  callUnifiedAI,
  callUnifiedAIEx,
  callUnifiedAIJSON,
  UnifiedAIError,
} from "./unifiedAI.ts";
import type { UnifiedAIOptions, UnifiedMessage } from "./unifiedAI.ts";

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

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
  tool_calls?: unknown[];
  tool_call_id?: string;
};

export interface CallOptions {
  messages?: ChatMessage[];
  system?: string;
  user?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  max_completion_tokens?: number;
  response_format?: { type: "json_object" } | { type: "text" };
  /** Convenience: when true, forces response_format=json_object. */
  json?: boolean;
  tools?: Array<{ type: "function"; function: { name: string; description: string; parameters?: Record<string, unknown> } }>;
  tool_choice?: "auto" | "none" | { type: "function"; function: { name: string } };
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

function toUnifiedOptions(opts: CallOptions): UnifiedAIOptions {
  return {
    model: opts.model || DEFAULT_MODEL,
    temperature: opts.temperature,
    max_tokens: opts.max_tokens,
    max_completion_tokens: opts.max_completion_tokens,
    response_format: opts.response_format,
    json: opts.json,
    tools: opts.tools,
    tool_choice: opts.tool_choice,
  };
}

export async function callOpenAIRaw(opts: CallOptions): Promise<any> {
  const messages = buildMessages(opts) as UnifiedMessage[];
  try {
    const result = await callUnifiedAIEx(messages, toUnifiedOptions(opts));
    return {
      choices: [
        { message: { role: "assistant", content: result.content, tool_calls: result.tool_calls }, index: 0, finish_reason: "stop" },
      ],
      usage: result.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    };
  } catch (e) {
    const status = e instanceof Error && "status" in e ? (e as { status: number }).status : 500;
    throw new OpenAIError(e instanceof Error ? e.message : "AI request failed", status);
  }
}

/** Returns the assistant text content. */
export async function callOpenAI(opts: CallOptions): Promise<string> {
  const data = await callOpenAIRaw(opts);
  return data.choices?.[0]?.message?.content?.trim() || "";
}

/** Returns parsed JSON. Forces response_format=json_object. */
export async function callOpenAIJSON<T = any>(opts: CallOptions): Promise<T> {
  const messages = buildMessages(opts) as UnifiedMessage[];
  try {
    return await callUnifiedAIJSON<T>(messages, toUnifiedOptions(opts));
  } catch (e) {
    const status = e instanceof Error && "status" in e ? (e as { status: number }).status : 500;
    throw new OpenAIError(e instanceof Error ? e.message : "AI request failed", status);
  }
}

export { callUnifiedAI, callUnifiedAIJSON, callUnifiedAIEx, UnifiedAIError };
