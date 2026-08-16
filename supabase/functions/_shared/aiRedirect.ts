/**
 * PLATFORM-WIDE RULE: Vertex AI (postpay) is the ONLY AI provider.
 * The Lovable AI Gateway is NOT used anywhere. OpenAI is never called.
 *
 * Importing this module patches `globalThis.fetch` so that:
 *  - Any call to `api.openai.com` is served by Vertex AI.
 *  - Any call to `ai.gateway.lovable.dev` is served by Vertex AI.
 *
 * Vertex responses are reshaped into OpenAI-compatible JSON, so every existing
 * edge function keeps working unchanged. If Vertex cannot serve a request the
 * call fails with a clear 503 — there is no third-party fallback.
 */

import { tryVertexChat, tryVertexImage, tryVertexTranscribe, tryVertexEmbeddings, tryVertexSpeech } from "./vertexDirect.ts";

function blocked(reason: string): Response {
  console.error(`[aiRedirect] Vertex AI could not serve the request: ${reason}`);
  return new Response(
    JSON.stringify({ error: { message: "AI service unavailable", type: "ai_unavailable", reason } }),
    { status: 503, headers: { "Content-Type": "application/json" } },
  );
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

/** Retry a Vertex attempt a few times with backoff before giving up. */
async function withRetry<T>(label: string, fn: () => Promise<T | null>, attempts = 3): Promise<T | null> {
  for (let i = 0; i < attempts; i++) {
    const out = await fn();
    if (out) return out;
    if (i < attempts - 1) {
      console.warn(`[aiRedirect] vertex ${label} attempt #${i + 1} failed, retrying`);
      await new Promise((r) => setTimeout(r, 600 * (i + 1)));
    }
  }
  return null;
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

    // Only intercept AI-provider URLs; everything else passes through.
    const isAiProvider = url.includes("api.openai.com") || url.includes("ai.gateway.lovable.dev");
    if (!isAiProvider) return await originalFetch(input as any, init);

    try {
      const rawBody = init?.body;

      // ---- multipart endpoints (audio transcriptions / translations) ----
      if (url.includes("/audio/transcriptions") || url.includes("/audio/translations")) {
        let form: FormData | null = null;
        if (rawBody instanceof FormData) form = rawBody;
        else if (input instanceof Request) form = await input.clone().formData().catch(() => null);
        if (!form) return blocked("unsupported transcription payload");

        const file = form.get("file");
        if (!(file instanceof File) && !(file instanceof Blob)) {
          return blocked("transcription payload has no audio file");
        }
        const bytes = new Uint8Array(await (file as Blob).arrayBuffer());
        let b64 = "";
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
          b64 += String.fromCharCode(...bytes.subarray(i, i + chunk));
        }
        const mime = (file as File).type || "audio/webm";
        const transcript = await withRetry("transcribe", () => tryVertexTranscribe(btoa(b64), mime));
        if (transcript === null) return blocked("vertex transcription failed");
        return json({ text: transcript });
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

      if (url.includes("/chat/completions")) {
        const data = await withRetry("chat", () => tryVertexChat(body!));
        if (!data) return blocked("vertex chat completion failed");
        return json(data);
      }

      if (url.includes("/images/generations") || url.includes("/images/edits")) {
        // Collect any reference image the caller supplied (edit / transform flows).
        const b = body!;
        const refs: unknown[] = [];
        for (const key of ["image", "image_url", "images", "reference_image", "reference_image_url"]) {
          const v = (b as Record<string, unknown>)[key];
          if (Array.isArray(v)) refs.push(...v);
          else if (typeof v === "string" && v) refs.push(v);
        }
        const messagePrompt = Array.isArray(b.messages)
          ? b.messages
              .map((message) => {
                if (!message || typeof message !== "object") return "";
                const content = (message as Record<string, unknown>).content;
                if (typeof content === "string") return content;
                if (!Array.isArray(content)) return "";
                return content
                  .map((part) => part && typeof part === "object" ? String((part as Record<string, unknown>).text ?? "") : "")
                  .filter(Boolean)
                  .join("\n");
              })
              .filter(Boolean)
              .join("\n")
          : "";
        const contentsPrompt = Array.isArray(b.contents)
          ? b.contents
              .flatMap((content) => content && typeof content === "object" && Array.isArray((content as Record<string, unknown>).parts)
                ? ((content as Record<string, unknown>).parts as unknown[])
                : [])
              .map((part) => part && typeof part === "object" ? String((part as Record<string, unknown>).text ?? "") : "")
              .filter(Boolean)
              .join("\n")
          : "";
        const prompt = String(b.prompt || messagePrompt || contentsPrompt).trim();
        if (!prompt) return blocked("image generation payload has no prompt");
        const img = await withRetry("image", () => tryVertexImage(prompt, b.size, b.n, refs), 1);
        if (!img) return blocked("vertex image generation failed");
        return json(img);
      }


      if (url.includes("/embeddings")) {
        const emb = await withRetry("embeddings", () => tryVertexEmbeddings(body!.input));
        if (!emb) return blocked("vertex embeddings failed");
        return json(emb);
      }

      if (url.includes("/audio/speech")) {
        const audio = await withRetry(
          "tts",
          () => tryVertexSpeech(String(body!.input ?? ""), body!.voice, body!.instructions),
        );

        if (!audio) return blocked("vertex text-to-speech failed");
        return new Response(audio, { status: 200, headers: { "Content-Type": "audio/wav" } });
      }

      return blocked(`unsupported AI endpoint: ${url}`);
    } catch (e) {
      return blocked(`redirect error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }) as typeof fetch;
}

export {};
