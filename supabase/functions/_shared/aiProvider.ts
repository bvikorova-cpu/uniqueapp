/**
 * Centralized AI Provider Module
 * 
 * Single point of entry for all OpenAI API calls.
 * Change the model here to update all edge functions at once.
 */

// Configuration - change these values to update all functions
export const AI_CONFIG = {
  // Default model for all AI calls
  defaultModel: "gpt-4o-mini",
  
  // Model for complex reasoning tasks
  advancedModel: "gpt-4o",
  
  // API endpoint
  apiEndpoint: "https://api.openai.com/v1/chat/completions",
  
  // Default max tokens
  defaultMaxTokens: 1000,
  
  // Default temperature
  defaultTemperature: 0.7,
};

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

/**
 * Get OpenAI API key from environment
 */
export function getOpenAIKey(): string {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) {
    throw new Error("OPENAI_API_KEY not configured");
  }
  return key;
}

/**
 * Make a chat completion request to OpenAI
 */
export async function chatCompletion(options: AIRequestOptions): Promise<AIResponse> {
  const apiKey = getOpenAIKey();
  
  const body: Record<string, unknown> = {
    model: options.model || AI_CONFIG.defaultModel,
    messages: options.messages,
    max_completion_tokens: options.maxTokens || AI_CONFIG.defaultMaxTokens,
  };
  
  if (options.responseFormat === "json_object") {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(AI_CONFIG.apiEndpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI API error:", response.status, errorText);
    
    if (response.status === 429) {
      throw new AIRateLimitError("OpenAI rate limit exceeded");
    }
    if (response.status === 402) {
      throw new AIPaymentError("OpenAI payment required");
    }
    
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    content: data.choices[0].message.content,
    usage: data.usage,
  };
}

/**
 * Make a streaming chat completion request
 */
export async function streamChatCompletion(options: AIRequestOptions): Promise<Response> {
  const apiKey = getOpenAIKey();
  
  const response = await fetch(AI_CONFIG.apiEndpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model || AI_CONFIG.defaultModel,
      messages: options.messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI API error:", response.status, errorText);
    
    if (response.status === 429) {
      throw new AIRateLimitError("OpenAI rate limit exceeded");
    }
    if (response.status === 402) {
      throw new AIPaymentError("OpenAI payment required");
    }
    
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

// Custom error classes
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

// ============================================
// COMMON AI TASKS - Universal methods
// ============================================

/**
 * Analyze text content (emotions, sentiment, themes)
 */
export async function analyzeText(
  text: string,
  analysisType: "emotion" | "sentiment" | "themes" | "summary",
  language: string = "en"
): Promise<AIResponse> {
  const prompts: Record<string, string> = {
    emotion: `Analyze the emotional content of this text and return a JSON object with emotion scores (0-100): joy, sadness, anger, fear, excitement, peace. Include "dominant_emotion" and "summary" fields.`,
    sentiment: `Analyze the sentiment of this text. Return JSON with: sentiment (positive/negative/neutral), confidence (0-100), and explanation.`,
    themes: `Identify the main themes in this text. Return JSON with: themes (array of strings), keywords (array), and summary.`,
    summary: `Summarize this text concisely. Return JSON with: summary (string), key_points (array), word_count (number).`,
  };

  return chatCompletion({
    messages: [
      { role: "system", content: `You are an expert text analyst. Respond only in valid JSON. Language: ${language}` },
      { role: "user", content: `${prompts[analysisType]}\n\nText: "${text}"` }
    ],
    responseFormat: "json_object",
    maxTokens: 500,
  });
}

/**
 * Generate creative content
 */
export async function generateContent(
  prompt: string,
  contentType: "story" | "article" | "social_post" | "description",
  options?: { tone?: string; length?: "short" | "medium" | "long"; language?: string }
): Promise<AIResponse> {
  const lengthTokens = { short: 200, medium: 500, long: 1000 };
  
  const systemPrompts: Record<string, string> = {
    story: "You are a creative storyteller. Write engaging narratives.",
    article: "You are a professional content writer. Create well-structured articles.",
    social_post: "You are a social media expert. Create engaging posts with emojis and hashtags.",
    description: "You are a product copywriter. Write compelling descriptions.",
  };

  return chatCompletion({
    messages: [
      { 
        role: "system", 
        content: `${systemPrompts[contentType]} Tone: ${options?.tone || "professional"}. Language: ${options?.language || "en"}.`
      },
      { role: "user", content: prompt }
    ],
    maxTokens: lengthTokens[options?.length || "medium"],
  });
}

/**
 * Chat with AI persona
 */
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

/**
 * Analyze image (vision)
 */
export async function analyzeImage(
  imageUrl: string,
  prompt: string
): Promise<AIResponse> {
  const apiKey = getOpenAIKey();

  const response = await fetch(AI_CONFIG.apiEndpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      max_completion_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vision API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: data.usage,
  };
}
