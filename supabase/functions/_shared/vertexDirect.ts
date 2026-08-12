/**
 * Google Vertex AI (postpay) direct path.
 *
 * Uses a service-account JSON stored in GCP_SERVICE_ACCOUNT_JSON to mint a
 * short-lived OAuth access token, then calls Vertex AI's OpenAI-compatible
 * chat-completions endpoint so request/response shapes match the gateway.
 *
 * Any failure returns null so callers fall back (API key → Lovable Gateway).
 */

type ServiceAccount = {
  client_email: string;
  private_key: string;
  project_id?: string;
};

let cachedToken: { token: string; exp: number } | null = null;

export function getServiceAccount(): ServiceAccount | null {
  const raw = Deno.env.get("GCP_SERVICE_ACCOUNT_JSON");
  if (!raw) return null;
  try {
    const sa = JSON.parse(raw) as ServiceAccount;
    if (!sa.client_email || !sa.private_key) return null;
    return sa;
  } catch {
    console.warn("[vertexDirect] GCP_SERVICE_ACCOUNT_JSON is not valid JSON");
    return null;
  }
}

export function hasVertex(): boolean {
  return !!getServiceAccount();
}

function b64url(bytes: Uint8Array | string): string {
  const data = typeof bytes === "string" ? new TextEncoder().encode(bytes) : bytes;
  let s = "";
  for (const b of data) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

export async function getAccessToken(sa: ServiceAccount): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp - 60 > now) return cachedToken.token;

  try {
    const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claims = b64url(JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }));
    const key = await importPrivateKey(sa.private_key);
    const sig = new Uint8Array(
      await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${claims}`)),
    );
    const assertion = `${header}.${claims}.${b64url(sig)}`;

    const rawFetch: typeof fetch = (globalThis as any).__ORIGINAL_FETCH__ ?? fetch;
    const res = await rawFetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    });
    if (!res.ok) {
      console.warn("[vertexDirect] token error", res.status, (await res.text()).slice(0, 300));
      return null;
    }
    const data = await res.json();
    if (!data?.access_token) return null;
    cachedToken = { token: data.access_token, exp: now + (Number(data.expires_in) || 3600) };
    return cachedToken.token;
  } catch (e) {
    console.warn("[vertexDirect] token exception", e instanceof Error ? e.message : String(e));
    return null;
  }
}

/** Map any incoming model id onto a Vertex publisher model id. */
export function vertexModel(model: unknown): string {
  const m = typeof model === "string" ? model.toLowerCase() : "";
  if (/lite/.test(m)) return "google/gemini-2.5-flash-lite";
  if (/pro/.test(m)) return "google/gemini-2.5-pro";
  return "google/gemini-2.5-flash";
}

/** Vertex AI chat completion. Returns OpenAI-shaped JSON or null on failure. */
export async function tryVertexChat(body: Record<string, unknown>): Promise<any | null> {
  const sa = getServiceAccount();
  if (!sa) return null;

  const projectId = Deno.env.get("GCP_PROJECT_ID") || sa.project_id;
  if (!projectId) return null;

  const token = await getAccessToken(sa);
  if (!token) return null;

  const payload: Record<string, unknown> = { ...body, model: vertexModel(body.model) };
  const budget = Number(payload.max_completion_tokens ?? payload.max_tokens ?? 0);
  delete payload.max_completion_tokens;
  delete payload.reasoning_effort;
  if (budget) payload.max_tokens = Math.max(budget, 2048);

  const primary = Deno.env.get("GCP_LOCATION") || "us-central1";
  const locations = [primary, "global", "us-east4", "europe-west4", "us-west1"]
    .filter((location, index, all) => all.indexOf(location) === index);
  const rawFetch: typeof fetch = (globalThis as any).__ORIGINAL_FETCH__ ?? fetch;

  for (const location of locations) {
    const host = location === "global" ? "aiplatform.googleapis.com" : `${location}-aiplatform.googleapis.com`;
    const url = `https://${host}/v1/projects/${projectId}/locations/${location}/endpoints/openapi/chat/completions`;
    try {
      const res = await rawFetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.warn(`[vertexDirect] chat ${location} ${res.status}:`, text.slice(0, 300));
        continue;
      }
      const data = await res.json();
      const message = data?.choices?.[0]?.message;
      if (!message?.content && !message?.tool_calls) {
        console.warn(`[vertexDirect] chat ${location} returned an empty response`);
        continue;
      }
      return data;
    } catch (e) {
      console.warn(`[vertexDirect] chat ${location} error:`, e instanceof Error ? e.message : String(e));
    }
  }
  return null;
}

/** Append an aspect-ratio hint to the prompt for non-square sizes (best-effort; Gemini image gen honors it when it can). */
function imagePromptWithAspect(prompt: string, size?: unknown): string {
  const s = typeof size === "string" ? size.toLowerCase() : "";
  let ratio = "";
  if (s.includes("1024x1792") || s.includes("768x1344")) ratio = "9:16 portrait";
  else if (s.includes("1792x1024") || s.includes("1344x768")) ratio = "16:9 landscape";
  else if (s.includes("1024x1536") || s.includes("1536x1024")) ratio = "3:2";
  else if (s.includes("832x1248") || s.includes("1248x832")) ratio = "2:3 portrait";
  if (!ratio) return prompt;
  return `${prompt}\n\n(Aspect ratio ${ratio}.)`;
}

/**
 * Image generation on Vertex AI (postpay) using Gemini 2.5 Flash Image
 * (`gemini-2.5-flash-image`) via the native generateContent endpoint with
 * responseModalities = ["IMAGE","TEXT"]. This model is the only image-capable
 * model enabled on the project's Vertex AI; Imagen (`:predict`) and the
 * dedicated image-generation preview models are NOT enabled (404).
 *
 * Returns an OpenAI-shaped image-generation response
 * (`{ data: [{ b64_json }] }`) so the fetch-patch redirect path can wrap it
 * transparently, or null when Vertex is unavailable / failed (caller falls
 * back to the Lovable Gateway).
 */
export async function tryVertexImage(
  prompt: string,
  size?: unknown,
  _n?: unknown,
  refImages?: unknown,
): Promise<any | null> {
  const sa = getServiceAccount();
  if (!sa) return null;
  const projectId = Deno.env.get("GCP_PROJECT_ID") || sa.project_id;
  if (!projectId) return null;
  const token = await getAccessToken(sa);
  if (!token) return null;

  const rawFetch: typeof fetch = (globalThis as any).__ORIGINAL_FETCH__ ?? fetch;

  // Reference images (for edit / avatar transforms) → inlineData parts.
  const imageParts: Array<Record<string, unknown>> = [];
  const refs = Array.isArray(refImages) ? refImages : refImages ? [refImages] : [];
  for (const ref of refs.slice(0, 3)) {
    const inline = await toInlineImage(String(ref), rawFetch);
    if (inline) imageParts.push({ inlineData: inline });
  }

  const models = [
    Deno.env.get("GCP_IMAGE_MODEL") || "gemini-2.5-flash-image",
    "gemini-2.5-flash-image-preview",
  ].filter((m, i, a) => a.indexOf(m) === i);

  // Image quota (429 RESOURCE_EXHAUSTED) is per-region, so rotate regions
  // instead of hammering one. Whole routine is bounded by a time budget so an
  // edge function never dies waiting on retries.
  const primary = Deno.env.get("GCP_LOCATION") || "us-central1";
  const locations = [primary, "us-east4", "europe-west4", "us-west1", "asia-southeast1"]
    .filter((l, i, a) => a.indexOf(l) === i);

  const deadline = Date.now() + 70_000;

  for (const model of models) {
    for (const location of locations) {
      if (Date.now() > deadline) break;
      const url =
        `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;
      try {
        const res = await rawFetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(35_000),
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [...imageParts, { text: imagePromptWithAspect(prompt, size) }],
            }],
            generationConfig: { responseModalities: ["IMAGE", "TEXT"], temperature: 0.9 },
          }),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.warn(`[vertexDirect] image ${model}@${location} ${res.status}:`, text.slice(0, 160));
          continue;
        }
        const data = await res.json();
        const parts = data?.candidates?.[0]?.content?.parts;
        const images: string[] = [];
        if (Array.isArray(parts)) {
          for (const p of parts) {
            const b64 = p?.inlineData?.data;
            if (typeof b64 === "string" && b64.length) images.push(b64);
          }
        }
        if (images.length) return { data: images.map((b64) => ({ b64_json: b64 })) };
        console.warn(`[vertexDirect] image ${model}@${location} returned no inlineData`);
      } catch (e) {
        console.warn(`[vertexDirect] image ${model}@${location} error:`, e instanceof Error ? e.message : String(e));
      }
    }
  }
  return null;
}

/** Turn a data URL or http(s) image URL into a Gemini inlineData payload. */
async function toInlineImage(
  ref: string,
  rawFetch: typeof fetch,
): Promise<{ mimeType: string; data: string } | null> {
  try {
    if (ref.startsWith("data:")) {
      const [head, data] = ref.split(",");
      if (!data) return null;
      const mimeType = head.slice(5).split(";")[0] || "image/png";
      return { mimeType, data };
    }
    if (!/^https?:\/\//.test(ref)) return null;
    const res = await rawFetch(ref, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    const mimeType = res.headers.get("content-type")?.split(";")[0] || "image/png";
    const bytes = new Uint8Array(await res.arrayBuffer());
    let bin = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return { mimeType, data: btoa(bin) };
  } catch {
    return null;
  }
}




/**
 * Speech-to-text on Vertex AI (postpay) using Gemini's native audio input.
 * Returns the transcript, or null when Vertex is unavailable / failed so the
 * caller can fall back to the Lovable AI Gateway.
 */
export async function tryVertexTranscribe(
  audioBase64: string,
  mime: string,
): Promise<string | null> {
  const sa = getServiceAccount();
  if (!sa) return null;

  const projectId = Deno.env.get("GCP_PROJECT_ID") || sa.project_id;
  const location = Deno.env.get("GCP_LOCATION") || "us-central1";
  if (!projectId) return null;

  const token = await getAccessToken(sa);
  if (!token) return null;

  const model = "gemini-2.5-flash";
  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;

  try {
    const rawFetch: typeof fetch = (globalThis as any).__ORIGINAL_FETCH__ ?? fetch;
    const res = await rawFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { inlineData: { mimeType: mime, data: audioBase64 } },
            {
              text:
                "Transcribe the spoken words in this audio verbatim. " +
                "Return ONLY the transcript text, with no commentary, labels or timestamps. " +
                "If there is no intelligible speech, return an empty response.",
            },
          ],
        }],
        generationConfig: { temperature: 0, maxOutputTokens: 4096 },
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`[vertexDirect] transcribe ${res.status}, falling back:`, text.slice(0, 300));
      return null;
    }
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    const transcript = Array.isArray(parts)
      ? parts.map((p: any) => (typeof p?.text === "string" ? p.text : "")).join(" ").trim()
      : "";
    return transcript || null;
  } catch (e) {
    console.warn("[vertexDirect] transcribe error, falling back:", e instanceof Error ? e.message : String(e));
    return null;
  }
}

/**
 * Text embeddings on Vertex AI (postpay).
 * Returns an OpenAI-shaped embeddings response, or null on failure.
 */
export async function tryVertexEmbeddings(
  input: unknown,
): Promise<any | null> {
  const sa = getServiceAccount();
  if (!sa) return null;
  const projectId = Deno.env.get("GCP_PROJECT_ID") || sa.project_id;
  const location = Deno.env.get("GCP_LOCATION") || "us-central1";
  if (!projectId) return null;
  const token = await getAccessToken(sa);
  if (!token) return null;

  const texts = Array.isArray(input)
    ? input.map((t) => String(t))
    : [String(input ?? "")];
  if (!texts.length) return null;

  const model = Deno.env.get("GCP_EMBEDDING_MODEL") || "text-embedding-005";
  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;

  try {
    const rawFetch: typeof fetch = (globalThis as any).__ORIGINAL_FETCH__ ?? fetch;
    const res = await rawFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ instances: texts.map((content) => ({ content })) }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`[vertexDirect] embeddings ${res.status}:`, text.slice(0, 300));
      return null;
    }
    const data = await res.json();
    const preds = data?.predictions;
    if (!Array.isArray(preds) || !preds.length) return null;
    return {
      object: "list",
      model,
      data: preds.map((p: any, i: number) => ({
        object: "embedding",
        index: i,
        embedding: p?.embeddings?.values ?? [],
      })),
      usage: { prompt_tokens: 0, total_tokens: 0 },
    };
  } catch (e) {
    console.warn("[vertexDirect] embeddings error:", e instanceof Error ? e.message : String(e));
    return null;
  }
}

/**
 * Text-to-speech on Vertex AI (postpay) using Gemini TTS.
 * Returns raw audio bytes (PCM/WAV-wrapped) or null on failure.
 */
export async function tryVertexSpeech(
  text: string,
  voice?: unknown,
): Promise<Uint8Array | null> {
  const sa = getServiceAccount();
  if (!sa) return null;
  const projectId = Deno.env.get("GCP_PROJECT_ID") || sa.project_id;
  const location = Deno.env.get("GCP_LOCATION") || "us-central1";
  if (!projectId) return null;
  const token = await getAccessToken(sa);
  if (!token) return null;

  const model = Deno.env.get("GCP_TTS_MODEL") || "gemini-2.5-flash-preview-tts";
  const voiceName = typeof voice === "string" && /^[A-Z][a-z]+$/.test(voice) ? voice : "Kore";
  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;

  try {
    const rawFetch: typeof fetch = (globalThis as any).__ORIGINAL_FETCH__ ?? fetch;
    const res = await rawFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
        },
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.warn(`[vertexDirect] tts ${res.status}:`, t.slice(0, 300));
      return null;
    }
    const data = await res.json();
    const b64 = data?.candidates?.[0]?.content?.parts?.find((p: any) => p?.inlineData?.data)?.inlineData?.data;
    if (typeof b64 !== "string" || !b64) return null;
    const pcm = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return wrapPcmAsWav(pcm, 24000);
  } catch (e) {
    console.warn("[vertexDirect] tts error:", e instanceof Error ? e.message : String(e));
    return null;
  }
}

/** Wrap raw 16-bit mono PCM in a WAV container so browsers can play it. */
function wrapPcmAsWav(pcm: Uint8Array, sampleRate: number): Uint8Array {
  const header = new ArrayBuffer(44);
  const v = new DataView(header);
  const write = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i));
  };
  write(0, "RIFF");
  v.setUint32(4, 36 + pcm.length, true);
  write(8, "WAVE");
  write(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  write(36, "data");
  v.setUint32(40, pcm.length, true);
  const out = new Uint8Array(44 + pcm.length);
  out.set(new Uint8Array(header), 0);
  out.set(pcm, 44);
  return out;
}

/* ------------------------------------------------------------------ *
 * Veo video generation (Vertex AI, long-running operations)
 * ------------------------------------------------------------------ */

const VEO_MODELS = [
  Deno.env.get("GCP_VIDEO_MODEL") || "veo-3.1-fast-generate-preview",
  "veo-3.0-fast-generate-001",
  "veo-3.0-generate-001",
  "veo-2.0-generate-001",
].filter((m, i, a) => a.indexOf(m) === i);

function veoLocations(): string[] {
  const primary = Deno.env.get("GCP_VIDEO_LOCATION") || "us-central1";
  return [primary, "us-east4", "europe-west4"].filter((l, i, a) => a.indexOf(l) === i);
}

const GEMINI_VEO_MODELS = [
  "veo-3.1-fast-generate-preview",
  "veo-3.1-lite-generate-preview",
  "veo-3.1-generate-preview",
];

/** Veo through the Google Gemini API (used because Veo publisher models are not enabled on the Vertex project). */
async function startGeminiVideo(opts: { prompt: string; durationSeconds?: number; aspectRatio?: string }) {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return null;
  const rawFetch: typeof fetch = (globalThis as any).__ORIGINAL_FETCH__ ?? fetch;
  for (const model of GEMINI_VEO_MODELS) {
    try {
      const res = await rawFetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(30_000),
          body: JSON.stringify({
            instances: [{ prompt: opts.prompt }],
            parameters: {
              aspectRatio: opts.aspectRatio ?? "9:16",
              durationSeconds: Math.min(Math.max(opts.durationSeconds ?? 8, 4), 8),
              personGeneration: "allow_adult",
            },
          }),
        },
      );
      if (!res.ok) {
        console.warn(`[vertexDirect] gemini veo start ${model} ${res.status}:`, (await res.text().catch(() => "")).slice(0, 200));
        continue;
      }
      const data = await res.json();
      if (data?.name) return { operationName: String(data.name), model, location: "gemini-api" };
    } catch (e) {
      console.warn(`[vertexDirect] gemini veo start ${model} error:`, e instanceof Error ? e.message : String(e));
    }
  }
  return null;
}

async function pollGeminiVideo(op: { operationName: string }) {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return null;
  const rawFetch: typeof fetch = (globalThis as any).__ORIGINAL_FETCH__ ?? fetch;
  try {
    const res = await rawFetch(
      `https://generativelanguage.googleapis.com/v1beta/${op.operationName}?key=${key}`,
      { signal: AbortSignal.timeout(30_000) },
    );
    if (!res.ok) {
      console.warn("[vertexDirect] gemini veo poll", res.status, (await res.text().catch(() => "")).slice(0, 200));
      return null;
    }
    const data = await res.json();
    if (!data?.done) return { done: false };
    if (data?.error) return { done: true, error: String(data.error?.message || "generation failed") };
    const sample = data?.response?.generateVideoResponse?.generatedSamples?.[0]
      ?? data?.response?.generatedSamples?.[0];
    const uri: string | undefined = sample?.video?.uri ?? sample?.video?.videoUri;
    const inline: string | undefined = sample?.video?.bytesBase64Encoded;
    if (inline) return { done: true, videoBase64: inline };
    if (!uri) {
      const filtered = data?.response?.generateVideoResponse?.raiMediaFilteredReasons?.[0];
      return { done: true, error: filtered ? String(filtered) : "Video generation returned no data." };
    }
    const dl = await rawFetch(uri.includes("key=") ? uri : `${uri}${uri.includes("?") ? "&" : "?"}key=${key}`, {
      signal: AbortSignal.timeout(120_000),
    });
    if (!dl.ok) return { done: true, error: `Could not download the generated video (${dl.status}).` };
    const buf = new Uint8Array(await dl.arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.length; i += 8192) {
      bin += String.fromCharCode(...buf.subarray(i, i + 8192));
    }
    return { done: true, videoBase64: btoa(bin) };
  } catch (e) {
    console.warn("[vertexDirect] gemini veo poll error:", e instanceof Error ? e.message : String(e));
    return null;
  }
}

/** Start a Veo generation. Returns { operationName, model, location } or null. */
export async function startVertexVideo(opts: {
  prompt: string;
  durationSeconds?: number;
  aspectRatio?: string;
}): Promise<{ operationName: string; model: string; location: string } | null> {
  const sa = getServiceAccount();
  const projectId = sa ? (Deno.env.get("GCP_PROJECT_ID") || sa.project_id) : null;
  const token = sa ? await getAccessToken(sa) : null;
  if (!sa || !projectId || !token) return await startGeminiVideo(opts);
  const rawFetch: typeof fetch = (globalThis as any).__ORIGINAL_FETCH__ ?? fetch;


  for (const model of VEO_MODELS) {
    for (const location of veoLocations()) {
      const url =
        `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predictLongRunning`;
      try {
        const res = await rawFetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(30_000),
          body: JSON.stringify({
            instances: [{ prompt: opts.prompt }],
            parameters: {
              durationSeconds: Math.min(Math.max(opts.durationSeconds ?? 8, 4), 8),
              aspectRatio: opts.aspectRatio ?? "9:16",
              sampleCount: 1,
              generateAudio: true,
              personGeneration: "allow_adult",
            },
          }),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.warn(`[vertexDirect] veo start ${model}@${location} ${res.status}:`, text.slice(0, 200));
          continue;
        }
        const data = await res.json();
        if (data?.name) return { operationName: data.name as string, model, location };
      } catch (e) {
        console.warn(`[vertexDirect] veo start ${model}@${location} error:`, e instanceof Error ? e.message : String(e));
      }
    }
  }
  // Vertex publisher Veo models may not be enabled on the project — fall back to the Gemini API.
  return await startGeminiVideo(opts);
}

/** Poll a Veo operation. Returns { done, videoBase64?, error? } or null when unreachable. */
export async function pollVertexVideo(op: { operationName: string; model: string; location: string }):
  Promise<{ done: boolean; videoBase64?: string; error?: string } | null> {
  if (op.location === "gemini-api") return await pollGeminiVideo(op);
  const sa = getServiceAccount();
  if (!sa) return null;
  const projectId = Deno.env.get("GCP_PROJECT_ID") || sa.project_id;
  if (!projectId) return null;
  const token = await getAccessToken(sa);
  if (!token) return null;

  const rawFetch: typeof fetch = (globalThis as any).__ORIGINAL_FETCH__ ?? fetch;

  const url =
    `https://${op.location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${op.location}/publishers/google/models/${op.model}:fetchPredictOperation`;
  try {
    const res = await rawFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({ operationName: op.operationName }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn("[vertexDirect] veo poll", res.status, text.slice(0, 200));
      return null;
    }
    const data = await res.json();
    if (!data?.done) return { done: false };
    if (data?.error) return { done: true, error: String(data.error?.message || "generation failed") };
    const videos = data?.response?.videos ?? data?.response?.generatedSamples ?? [];
    const first = Array.isArray(videos) ? videos[0] : null;
    const b64 = first?.bytesBase64Encoded ?? first?.video?.bytesBase64Encoded;
    if (typeof b64 === "string" && b64.length) return { done: true, videoBase64: b64 };
    const filtered = data?.response?.raiMediaFilteredReasons?.[0];
    return { done: true, error: filtered ? String(filtered) : "Video generation returned no data." };
  } catch (e) {
    console.warn("[vertexDirect] veo poll error:", e instanceof Error ? e.message : String(e));
    return null;
  }
}
