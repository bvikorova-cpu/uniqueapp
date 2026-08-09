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

function getServiceAccount(): ServiceAccount | null {
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

async function getAccessToken(sa: ServiceAccount): Promise<string | null> {
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
  const location = Deno.env.get("GCP_LOCATION") || "us-central1";
  if (!projectId) return null;

  const token = await getAccessToken(sa);
  if (!token) return null;

  const payload: Record<string, unknown> = { ...body, model: vertexModel(body.model) };
  const budget = Number(payload.max_completion_tokens ?? payload.max_tokens ?? 0);
  delete payload.max_completion_tokens;
  delete payload.reasoning_effort;
  if (budget) payload.max_tokens = Math.max(budget, 2048);

  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/endpoints/openapi/chat/completions`;

  try {
    const rawFetch: typeof fetch = (globalThis as any).__ORIGINAL_FETCH__ ?? fetch;
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
      console.warn(`[vertexDirect] ${res.status}, falling back:`, text.slice(0, 300));
      return null;
    }
    const data = await res.json();
    const message = data?.choices?.[0]?.message;
    if (!message?.content && !message?.tool_calls) {
      console.warn("[vertexDirect] empty response, falling back");
      return null;
    }
    return data;
  } catch (e) {
    console.warn("[vertexDirect] error, falling back:", e instanceof Error ? e.message : String(e));
    return null;
  }
}
