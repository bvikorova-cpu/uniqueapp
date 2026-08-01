import {
  callUnifiedAIEx,
  callUnifiedAIJSON,
} from "./unifiedAI.ts";
import type { UnifiedAIOptions, UnifiedMessage } from "./unifiedAI.ts";

export interface CallOptions {
  messages?: Array<{
    role: "system" | "user" | "assistant";
    content: string;
    name?: string;
    tool_calls?: unknown[];
    tool_call_id?: string;
  }>;
  system?: string;
  user?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  max_completion_tokens?: number;
  response_format?: { type: "json_object" } | { type: "text" };
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

function messagesFor(options: CallOptions): UnifiedMessage[] {
  if (options.messages?.length) return options.messages as UnifiedMessage[];
  const messages: UnifiedMessage[] = [];
  if (options.system) messages.push({ role: "system", content: options.system });
  if (options.user) messages.push({ role: "user", content: options.user });
  return messages;
}

function unifiedOptions(options: CallOptions): UnifiedAIOptions {
  return {
    model: options.model || "gpt-4o",
    temperature: options.temperature,
    max_tokens: options.max_tokens,
    max_completion_tokens: options.max_completion_tokens,
    response_format: options.response_format,
    json: options.json,
    tools: options.tools,
    tool_choice: options.tool_choice,
  };
}

export async function callOpenAIRaw(options: CallOptions): Promise<any> {
  try {
    const result = await callUnifiedAIEx(messagesFor(options), unifiedOptions(options));
    return {
      choices: [{
        message: { role: "assistant", content: result.content, tool_calls: result.tool_calls },
        index: 0,
        finish_reason: "stop",
      }],
      usage: result.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    };
  } catch (error) {
    const status = error instanceof Error && "status" in error
      ? Number((error as Error & { status: number }).status)
      : 500;
    throw new OpenAIError(error instanceof Error ? error.message : "AI request failed", status);
  }
}

export async function callOpenAI(options: CallOptions): Promise<string> {
  const data = await callOpenAIRaw(options);
  return data.choices?.[0]?.message?.content?.trim() || "";
}

export async function callOpenAIJSON<T = unknown>(options: CallOptions): Promise<T> {
  try {
    return await callUnifiedAIJSON<T>(messagesFor(options), unifiedOptions(options));
  } catch (error) {
    const status = error instanceof Error && "status" in error
      ? Number((error as Error & { status: number }).status)
      : 500;
    throw new OpenAIError(error instanceof Error ? error.message : "AI request failed", status);
  }
}