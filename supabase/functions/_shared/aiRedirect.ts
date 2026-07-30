/**
 * TEMPORARY PLATFORM-WIDE SWITCH: OpenAI -> Lovable AI Gateway.
 *
 * Importing this module patches `globalThis.fetch` so that any direct call to
 * `api.openai.com` made by an edge function is transparently rerouted to the
 * Lovable AI Gateway (chat completions + image generation).
 *
 * Nothing else in the function code has to change: the gateway is
 * OpenAI-compatible, so the response shape stays identical.
 *
 * To go back to OpenAI later, set the secret AI_PROVIDER=openai (or delete the
 * `import "../_shared/aiRedirect.ts";` lines).
 */

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

function mapChatModel(model: unknown): string {
  if (typeof model !== "string" || !model) return DEFAULT_CHAT_MODEL;
  if (model.includes("/")) return model;
  return MODEL_MAP[model] ?? DEFAULT_CHAT_MODEL;
}

function isDisabled() {
  return (Deno.env.get("AI_PROVIDER") ?? "").toLowerCase() === "openai" ||
    !Deno.env.get("LOVABLE_API_KEY");
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
    try {
      const url = typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : (input as Request).url;

      if (!url.includes("api.openai.com") || isDisabled()) {
        return await originalFetch(input as any, init);
      }

        const lovableKey = Deno.env.get("LOVABLE_API_KEY");
        if (!lovableKey) return await originalFetch(input as any, init);

      // Only JSON bodies from plain fetch calls can be rewritten safely.
      const rawBody = init?.body;
      if (typeof rawBody !== "string") {
        return await originalFetch(input as any, init);
      }

      let body: Record<string, unknown>;
      try {
        body = JSON.parse(rawBody);
      } catch {
        return await originalFetch(input as any, init);
      }

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

        const res = await postWithRetry(`${GATEWAY_BASE}/chat/completions`, body, [
          "google/gemini-3.1-flash-lite",
          "openai/gpt-5.4-mini",
        ]);
        if (res.ok) return res;
        console.warn("[aiRedirect] gateway chat failed:", res.status, "- trying OpenAI");
        const direct = await originalFetch(input as any, init);
        return direct.ok ? direct : res;
      }

      if (url.includes("/images/generations")) {
        const gwBody = {
          model: DEFAULT_IMAGE_MODEL,
          prompt: body.prompt,
          n: 1,
          ...(body.size ? { size: body.size } : {}),
          quality: "low",
        };
        const res = await postWithRetry(`${GATEWAY_BASE}/images/generations`, gwBody, [
          "google/gemini-3-pro-image",
        ]);
        if (res.ok) return res;
        console.warn("[aiRedirect] gateway image generation failed:", res.status);
        const direct = await originalFetch(input as any, init);
        return direct.ok ? direct : res;
      }

      // Anything else (audio/speech, transcriptions, embeddings...) stays on OpenAI.
      return await originalFetch(input as any, init);

    } catch (e) {
      console.error("[aiRedirect] error, falling back to original fetch:", e);
      return await originalFetch(input as any, init);
    }
  }) as typeof fetch;
}

export {};
