/**
 * Direct Google AI switch: Vertex AI (postpay service account) with automatic
 * fallback to the Lovable AI Gateway.
 *
 * Vertex exposes an OpenAI-compatible chat-completions endpoint, so the request
 * and response shapes are identical to the gateway. That means every edge
 * function that already speaks OpenAI/gateway JSON works unchanged.
 *
 * If Vertex is not configured, or the direct call fails for ANY reason,
 * callers fall back to the Lovable AI Gateway — nothing breaks.
 */

import { tryVertexChat, hasVertex } from "./vertexDirect.ts";

/** Map gateway / legacy OpenAI model ids onto real direct-API Gemini model names. */
export function directGeminiModel(model: unknown): string {
  const m = typeof model === "string" ? model.toLowerCase() : "";
  if (/lite/.test(m)) return "gemini-2.5-flash-lite";
  if (/pro/.test(m)) return "gemini-2.5-pro";
  return "gemini-2.5-flash";
}

export function hasDirectGemini(): boolean {
  return hasVertex();
}

/**
 * Attempt a chat completion against Vertex AI.
 * Returns the parsed OpenAI-shaped JSON on success, or null when the direct
 * path is unavailable / failed (caller must then use the Lovable gateway).
 */
export async function tryDirectGeminiChat(
  body: Record<string, unknown>,
): Promise<any | null> {
  // Vertex AI (postpay, service account) is the only direct provider.
  return await tryVertexChat(body);
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
