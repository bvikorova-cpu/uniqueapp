import "../_shared/aiRedirect.ts";
import "./aiRedirect.ts";
/**
 * Centralized AI Provider Module (legacy compatibility wrapper)
 *
 * Vertex AI (postpay) is primary. Lovable AI Gateway is fallback only.
 * OpenAI is never called directly.
 */

import { callUnifiedAI, callUnifiedAIJSON, UnifiedMessage } from "./unifiedAI.ts";

export const AI_CONFIG = { // Default model for all AI calls
  defaultModel: "gpt-4o-mini",

  // Model for complex reasoning tasks
  advancedModel: "gpt-4o",

  // Default max tokens
  defaultMaxTokens: 1000,

  // Default temperature
  defaultTemperature: 0.7 };

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIRequestOptions {
  messages: AIMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  responseFormat?: "text" | "json_object";
}

export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class AIRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIRateLimitError";
  }
}

export class AIPaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIPaymentError";
  }
}

function toUnified(opts: AIRequestOptions) {
  return {
    model: opts.model || AI_CONFIG.defaultModel,
    temperature: opts.temperature ?? AI_CONFIG.defaultTemperature,
    max_tokens: opts.maxTokens || AI_CONFIG.defaultMaxTokens,
    response_format: opts.responseFormat === "json_object" ? { type: "json_object" } as const : undefined,
  };
}

/**
 * Make a chat completion request with automatic provider fallback.
 */
export async function chatCompletion(options: AIRequestOptions): Promise<AIResponse> {
  try {
    const content = await callUnifiedAI(options.messages as UnifiedMessage[], toUnified(options));
    return { content };
  } catch (e) {
    const status = e instanceof Error && "status" in e ? (e as { status: number }).status : 500;
    if (status === 429) throw new AIRateLimitError("AI is busy right now. Please try again in a few seconds.");
    if (status === 402) throw new AIPaymentError("AI service temporarily unavailable. Please try again later.");
    throw e;
  }
}

/**
 * Make a streaming chat completion request.
 * Note: streaming currently uses OpenAI directly because provider fallback
 * for streaming is not yet implemented in the unified provider.
 */
export async function streamChatCompletion(options: AIRequestOptions): Promise<Response> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("AI is not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Lovable-API-Key": key,
      "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-3.6-flash",
      messages: options.messages,
      stream: true }) });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI API error:", response.status, errorText);
    if (response.status === 429) throw new AIRateLimitError("OpenAI rate limit exceeded");
    if (response.status === 402) throw new AIPaymentError("OpenAI payment required");
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  return response;
}

/**
 * Parse JSON from AI response (handles markdown code blocks)
 */
export function parseAIJson<T>(content: string, fallback: T): T {
  try {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
    return JSON.parse(jsonString) as T;
  } catch {
    console.warn("Failed to parse AI JSON response, using fallback");
    return fallback;
  }
}

// ============================================
// COMMON AI TASKS - Universal methods
// ============================================

export async function analyzeText(
  text: string,
  analysisType: "emotion" | "sentiment" | "themes" | "summary",
  language: string = "en"
): Promise<AIResponse> {
  const prompts: Record<string, string> = {
    emotion: `Analyze the emotional content of this text and return a JSON object with emotion scores (0-100): joy, sadness, anger, fear, excitement, peace. Include "dominant_emotion" and "summary" fields.`,
    sentiment: `Analyze the sentiment of this text. Return JSON with: sentiment (positive/negative/neutral), confidence (0-100), and explanation.`,
    themes: `Identify the main themes in this text. Return JSON with: themes (array of strings), keywords (array), and summary.`,
    summary: `Summarize this text concisely. Return JSON with: summary (string), key_points (array), word_count (number).` };

  return chatCompletion({
    messages: [
      { role: "system", content: `You are an expert text analyst. Respond only in valid JSON. Language: ${language}` },
      { role: "user", content: `${prompts[analysisType]}\n\nText: "${text}"` }
    ],
    responseFormat: "json_object",
    maxTokens: 500 });
}

export async function generateContent(
  prompt: string,
  contentType: "story" | "article" | "social_post" | "description",
  options?: { tone?: string; length?: "short" | "medium" | "long"; language?: string }
): Promise<AIResponse> {
  const lengthTokens = { short: 200, medium: 500, long: 1000 };

  const systemPrompts: Record<string, string> = { story: "You are a creative storyteller. Write engaging narratives.",
    article: "You are a professional content writer. Create well-structured articles.",
    social_post: "You are a social media expert. Create engaging posts with emojis and hashtags.",
    description: "You are a product copywriter. Write compelling descriptions." };

  return chatCompletion({
    messages: [
      {
        role: "system",
        content: `${systemPrompts[contentType]} Tone: ${options?.tone || "professional"}. Language: ${options?.language || "en"}.`
      },
      { role: "user", content: prompt }
    ],
    maxTokens: lengthTokens[options?.length || "medium"] });
}

export async function chatWithPersona(
  messages: AIMessage[],
  persona: string,
  stream: boolean = false
): Promise<AIResponse | Response> {
  const allMessages: AIMessage[] = [
    { role: "system", content: persona },
    ...messages,
  ];

  if (stream) {
    return streamChatCompletion({ messages: allMessages });
  }

  return chatCompletion({ messages: allMessages });
}

export async function analyzeImage(
  imageUrl: string,
  prompt: string
): Promise<AIResponse> {
  // Vision is not yet supported in the unified fallback, so we try OpenAI directly.
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("AI is not configured for vision");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Lovable-API-Key": key,
      "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ] },
      ],
      max_completion_tokens: 1000 }) });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vision API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return { content: data.choices[0].message.content,
    usage: data.usage };
}
