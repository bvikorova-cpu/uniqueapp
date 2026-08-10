/**
 * PLATFORM-WIDE RULE: Vertex AI (postpay) is the PRIMARY AI provider.
 * The Lovable AI Gateway is only a fallback when Vertex is unavailable.
 * OpenAI is never called directly.
 *
 * Importing this module patches `globalThis.fetch` so that:
 *  - Any call to `api.openai.com` is rerouted to Vertex AI first, then the
 *    Lovable AI Gateway (chat completions, image generation, embeddings, TTS).
 *  - Any direct call to `ai.gateway.lovable.dev/v1/chat/completions` is also
 *    intercepted and sent to Vertex AI first; the gateway is used only as a
 *    fallback. This ensures every chat completion — no matter which URL the
 *    edge function called — goes through Vertex AI first.
 *
 * The gateway is OpenAI-compatible, so response shapes stay identical and no
 * other function code has to change. If a request cannot be rerouted, it fails
 * with a clear error instead of reaching OpenAI.
 */

import { tryDirectGeminiChatResponse } from "./geminiDirect.ts";

const GATEWAY_BASE = "https://ai.gateway.lovable.dev/v1";


/** Legacy OpenAI ids -> supported gateway ids (cheap-first). */
const MODEL_MAP: Record<string, string> = {
  "gpt-4o-mini": "google/gemini-3.6-flash",
  "gpt-4.1-mini": "google/gemini-3.6-flash",
  "gpt-4.1-nano": "google/gemini-3.1-flash-lite",
  "gpt-3.5-turbo": "google/gemini-3.6-flash",
  "gpt-4o": "google/gemini-3.6-flash",
  "gpt-4o-latest": "google/gemini-3.6-flash",
  "gpt-4": "google/gemini-3.6-flash",
  "gpt-4-turbo": "google/gemini-3.6-flash",
  "gpt-4.1": "google/gemini-3.6-flash",
  "o1-mini": "google/gemini-3.6-flash",
  "o3-mini": "google/gemini-3.6-flash",
  "o4-mini": "google/gemini-3.6-flash",
};

const DEFAULT_CHAT_MODEL = "google/gemini-3.6-flash";
const DEFAULT_IMAGE_MODEL = "openai/gpt-image-1-mini";
const DEFAULT_TTS_MODEL = "openai/gpt-4o-mini-tts";
const DEFAULT_STT_MODEL = "openai/gpt-4o-mini-transcribe";

function mapChatModel(model: unknown): string {
  if (typeof model !== "string" || !model) return DEFAULT_CHAT_MODEL;
  if (model.includes("/")) return model;
  return MODEL_MAP[model] ?? DEFAULT_CHAT_MODEL;
}

function gatewayAudioModel(model: unknown, fallback: string): string {
  if (typeof model === "string" && model.includes("/")) return model;
  return fallback;
}

function blocked(reason: string): Response {
  console.error(`[aiRedirect] blocked OpenAI call: ${reason}`);
  return new Response(
    JSON.stringify({ error: { message: "AI service unavailable", type: "ai_unavailable", reason } }),
    { status: 503, headers: { "Content-Type": "application/json" } },
  );
}

// deno-lint-ignore no-explicit-any
const originalFetch: typeof fetch = (globalThis as any).__ORIGINAL_FETCH__ ?? globalThis.fetch.bind(globalThis);
// deno-lint-ignore no-explicit-any
(globalThis as any).__ORIGINAL_FETCH__ = originalFetch;

// deno-lint-ignore no-explicit-any
if (!(globalThis as any).__AI_REDIRECT_INSTALLED__) {
  // deno-lint-ignore no-explicit-any
  (globalThis as any).__AI_REDIRECT_INSTALLED__ = true;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string"
      ? input
      : input instanceof URL
      ? input.toString()
      : (input as Request).url;

    // Only intercept OpenAI and Lovable-gateway URLs; everything else passes through.
    const isOpenAI = url.includes("api.openai.com");
    const isGateway = url.includes("ai.gateway.lovable.dev");
    if (!isOpenAI && !isGateway) {
      return await originalFetch(input as any, init);
    }

    try {
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      if (!lovableKey) return blocked("LOVABLE_API_KEY is not configured");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Lovable-API-Key": lovableKey,
      };

      // Retry transient gateway failures (429 / 5xx) with backoff before giving up.
      const postWithRetry = async (
        endpoint: string,
        payload: Record<string, unknown>,
        fallbackModels: string[] = [],
      ): Promise<Response> => {
        const models = [payload.model as string, ...fallbackModels].filter(Boolean);
        let last: Response | null = null;
        for (let i = 0; i < Math.max(models.length, 1) + 1; i++) {
          const model = models[Math.min(i, models.length - 1)];
          const res = await originalFetch(endpoint, {
            method: "POST",
            headers,
            body: JSON.stringify({ ...payload, ...(model ? { model } : {}) }),
          });
          if (res.ok) return res;
          if (res.status !== 429 && res.status < 500) return res;
          last = res;
          console.warn(`[aiRedirect] gateway ${res.status} on ${model}, retry #${i + 1}`);
          await new Promise((r) => setTimeout(r, 600 * (i + 1)));
        }
        return last!;
      };

      // ---- multipart endpoints (audio transcriptions / translations) ----
      const rawBody = init?.body;
      if (url.includes("/audio/transcriptions") || url.includes("/audio/translations")) {
        let form: FormData | null = null;
        if (rawBody instanceof FormData) form = rawBody;
        else if (input instanceof Request) form = await input.clone().formData().catch(() => null);
        if (!form) return blocked("unsupported transcription payload");

        const out = new FormData();
        for (const [k, v] of form.entries()) {
          if (k === "model") continue;
          out.append(k, v as any);
        }
        out.append("model", gatewayAudioModel(form.get("model"), DEFAULT_STT_MODEL));
        return await originalFetch(`${GATEWAY_BASE}/audio/transcriptions`, {
          method: "POST",
          // Lovable AI Gateway authenticates every endpoint with this header,
          // including its OpenAI-compatible multipart transcription route.
          headers: { "Lovable-API-Key": lovableKey },
          body: out,
        });
      }

      // ---- JSON endpoints ----
      let body: Record<string, unknown> | null = null;
      if (typeof rawBody === "string") {
        try {
          body = JSON.parse(rawBody);
        } catch {
          body = null;
        }
      } else if (input instanceof Request) {
        body = await input.clone().json().catch(() => null);
      }
      if (!body) return blocked("unsupported request payload");

      // ---- Direct Lovable Gateway calls: Vertex AI is primary, gateway is fallback ----
      if (isGateway) {
        if (url.includes("/chat/completions")) {
          // Vertex AI (postpay) gets the first attempt for every gateway chat call.
          const direct = await tryDirectGeminiChatResponse(body);
          if (direct) return direct;
          // Vertex unavailable/failed — fall back to the Lovable gateway with retry.
          return await postWithRetry(GATEWAY_BASE + "/chat/completions", body, [
            "google/gemini-3.1-flash-lite",
            "google/gemini-3.5-flash",
          ]);
        }
        // Non-chat gateway endpoints (images, audio, embeddings): pass through unchanged.
        return await originalFetch(input as any, init);
      }

      if (url.includes("/chat/completions")) {
        const model = mapChatModel(body.model);
        body.model = model;
        // Gemini/gpt-5 style models need headroom and reject some legacy fields.
        const budget = Number(body.max_completion_tokens ?? body.max_tokens ?? 0);
        delete body.max_tokens;
        delete body.max_completion_tokens;
        body.max_completion_tokens = Math.max(budget || 0, 2048);
        if (/gpt-5/i.test(model)) delete body.temperature;
        if (/gpt-5\.6/i.test(model)) body.reasoning_effort = "none";

        // Hybrid: prefer the project's own Gemini API key, fall back to gateway.
        const direct = await tryDirectGeminiChatResponse(body);
        if (direct) return direct;

        return await postWithRetry(`${GATEWAY_BASE}/chat/completions`, body, [
          "google/gemini-3.1-flash-lite",
          "google/gemini-3.5-flash",
        ]);
      }


      if (url.includes("/images/generations") || url.includes("/images/edits")) {
        const gwBody = {
          model: DEFAULT_IMAGE_MODEL,
          prompt: body.prompt,
          n: 1,
          ...(body.size ? { size: body.size } : {}),
          quality: "low",
        };
        return await postWithRetry(`${GATEWAY_BASE}/images/generations`, gwBody, [
          "google/gemini-3-pro-image",
        ]);
      }

      if (url.includes("/embeddings")) {
        const gwBody = {
          ...body,
          model: typeof body.model === "string" && body.model.includes("/")
            ? body.model
            : "openai/text-embedding-3-small",
        };
        return await postWithRetry(`${GATEWAY_BASE}/embeddings`, gwBody);
      }

      if (url.includes("/audio/speech")) {
        const gwBody = {
          ...body,
          model: gatewayAudioModel(body.model, DEFAULT_TTS_MODEL),
        };
        const res = await originalFetch(`${GATEWAY_BASE}/audio/speech`, {
          method: "POST",
          headers,
          body: JSON.stringify(gwBody),
        });
        return res;
      }

      return blocked(`unsupported OpenAI endpoint: ${url}`);
    } catch (e) {
      return blocked(`redirect error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }) as typeof fetch;
}

export {};
