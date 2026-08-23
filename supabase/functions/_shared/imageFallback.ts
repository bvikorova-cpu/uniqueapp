// Extra image-generation capacity used ONLY when Vertex AI is rate-limited
// (429 RESOURCE_EXHAUSTED) or unavailable. Vertex stays the primary provider.
// Order: Vertex (caller) → Gemini API (GEMINI_API_KEY) → Lovable AI Gateway.

function aspectHint(size?: string) {
  if (size === "1024x1536") return " Portrait 2:3 aspect ratio.";
  if (size === "1536x1024") return " Landscape 3:2 aspect ratio.";
  return " Square 1:1 aspect ratio.";
}

/** Google AI Studio (generativelanguage) — separate quota pool from Vertex. */
export async function tryGeminiApiImage(prompt: string, size?: string): Promise<string | null> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return null;
  const rawFetch: typeof fetch = (globalThis as any).__ORIGINAL_FETCH__ ?? fetch;
  const models = ["gemini-2.5-flash-image", "gemini-2.0-flash-preview-image-generation"];
  for (const model of models) {
    try {
      const res = await rawFetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(45_000),
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt + aspectHint(size) }] }],
            generationConfig: { responseModalities: ["IMAGE", "TEXT"], temperature: 0.9 },
          }),
        },
      );
      if (!res.ok) {
        console.warn(`[imageFallback] gemini-api ${model} ${res.status}`);
        continue;
      }
      const data = await res.json();
      const parts = data?.candidates?.[0]?.content?.parts;
      if (Array.isArray(parts)) {
        for (const p of parts) {
          const b64 = p?.inlineData?.data;
          if (typeof b64 === "string" && b64.length) return b64;
        }
      }
    } catch (e) {
      console.warn("[imageFallback] gemini-api error", e instanceof Error ? e.message : String(e));
    }
  }
  return null;
}

/** Lovable AI Gateway — last-resort image provider. */
export async function tryGatewayImage(prompt: string, size?: string): Promise<string | null> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return null;
  const rawFetch: typeof fetch = (globalThis as any).__ORIGINAL_FETCH__ ?? fetch;
  try {
    const res = await rawFetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(60_000),
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt + aspectHint(size) }],
        modalities: ["image", "text"],
      }),
    });
    if (!res.ok) {
      console.warn(`[imageFallback] gateway ${res.status}`);
      return null;
    }
    const data = await res.json();
    const url = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (typeof url === "string" && url.startsWith("data:")) {
      const b64 = url.split(",")[1];
      return b64 || null;
    }
  } catch (e) {
    console.warn("[imageFallback] gateway error", e instanceof Error ? e.message : String(e));
  }
  return null;
}

/** Runs both fallbacks in order and returns raw base64 PNG data. */
export async function tryFallbackImage(prompt: string, size?: string): Promise<string | null> {
  return (await tryGeminiApiImage(prompt, size)) ?? (await tryGatewayImage(prompt, size));
}
