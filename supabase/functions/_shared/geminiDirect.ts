/**
 * Hybrid AI switch: direct Google Gemini API (customer's own GEMINI_API_KEY)
 * with automatic fallback to the Lovable AI Gateway.
 *
 * Google exposes an OpenAI-compatible chat-completions endpoint, so the request
 * and response shapes are identical to the gateway. That means every edge
 * function that already speaks OpenAI/gateway JSON works unchanged.
 *
 * If GEMINI_API_KEY is not set, or the direct call fails for ANY reason,
 * callers fall back to the Lovable AI Gateway — nothing breaks.
 */

import { tryVertexChat, hasVertex } from "./vertexDirect.ts";

const GEMINI_OPENAI_BASE = "https://generativelanguage.googleapis.com/v1beta/openai";

/** Map gateway / legacy OpenAI model ids onto real direct-API Gemini model names. */
export function directGeminiModel(model: unknown): string {
  const m = typeof model === "string" ? model.toLowerCase() : "";
  if (/lite/.test(m)) return "gemini-2.5-flash-lite";
  if (/pro/.test(m)) return "gemini-2.5-pro";
  return "gemini-2.5-flash";
}

export function hasDirectGemini(): boolean {
  return !!Deno.env.get("GEMINI_API_KEY") || hasVertex();
}

/**
 * Attempt a chat completion against the direct Gemini API.
 * Returns the parsed OpenAI-shaped JSON on success, or null when the direct
 * path is unavailable / failed (caller must then use the Lovable gateway).
 */
export async function tryDirectGeminiChat(
  body: Record<string, unknown>,
): Promise<any | null> {
  // 1) Vertex AI (postpay, service account) has priority when configured.
  const vertex = await tryVertexChat(body);
  if (vertex) return vertex;

  // 2) Google AI Studio API key.
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return null;

  // deno-lint-ignore no-explicit-any
  const rawFetch: typeof fetch = (globalThis as any).__ORIGINAL_FETCH__ ?? fetch;

  const payload: Record<string, unknown> = { ...body, model: directGeminiModel(body.model) };
  // Gemini's OpenAI layer uses max_tokens, not max_completion_tokens.
  const budget = Number(payload.max_completion_tokens ?? payload.max_tokens ?? 0);
  delete payload.max_completion_tokens;
  delete payload.reasoning_effort;
  if (budget) payload.max_tokens = Math.max(budget, 2048);

  try {
    const res = await rawFetch(`${GEMINI_OPENAI_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Works with any key format (legacy AIzaSy… and the new AQ.… keys).
        // No prefix validation — the key is passed through as-is.
        Authorization: `Bearer ${key}`,
        "x-goog-api-key": key,
      },
      body: JSON.stringify(payload),
    });


    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`[geminiDirect] direct API ${res.status}, falling back to gateway:`, text.slice(0, 300));
      return null;
    }

    const data = await res.json();
    const message = data?.choices?.[0]?.message;
    if (!message?.content && !message?.tool_calls) {
      console.warn("[geminiDirect] empty direct response, falling back to gateway");
      return null;
    }
    return data;
  } catch (e) {
    console.warn("[geminiDirect] direct API error, falling back to gateway:", e instanceof Error ? e.message : String(e));
    return null;
  }
}

/** Same as above but returns a Response (for the fetch-patch redirect path). */
export async function tryDirectGeminiChatResponse(
  body: Record<string, unknown>,
): Promise<Response | null> {
  const data = await tryDirectGeminiChat(body);
  if (!data) return null;
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
