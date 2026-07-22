// Shared idempotency helper for edge functions.
// Two ways to use:
//
// 1) Manual check + save around your logic:
//      const cached = await checkIdempotency(req, sb, "stripe.checkout");
//      if (cached) return cached;
//      ...
//      await saveIdempotency(req, sb, "stripe.checkout", body, 200);
//
// 2) Wrapper (recommended for large handlers):
//      return await withIdempotency(req, "create-checkout", () => handler(req));
//
// Client should pass an "Idempotency-Key" header (UUID) on retryable mutations.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type SB = ReturnType<typeof createClient>;

function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );
}

export async function checkIdempotency(
  req: Request,
  sb: SB,
  scope: string,
): Promise<Response | null> {
  const key = req.headers.get("idempotency-key");
  if (!key) return null;
  const { data } = await sb
    .from("idempotency_keys")
    .select("response_body, response_status")
    .eq("key", key)
    .eq("scope", scope)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (data?.response_body) {
    return new Response(JSON.stringify(data.response_body), {
      status: (data.response_status as number) ?? 200,
      headers: { "Content-Type": "application/json", "X-Idempotent-Replay": "true" } });
  }
  return null;
}

export async function saveIdempotency(
  req: Request,
  sb: SB,
  scope: string,
  body: unknown,
  status = 200,
  userId?: string,
): Promise<void> { const key = req.headers.get("idempotency-key");
  if (!key) return;
  await sb.from("idempotency_keys").upsert(
    {
      key,
      scope,
      user_id: userId ?? null,
      response_body: body as never,
      response_status: status },
    { onConflict: "key" },
  );
}

/**
 * Wrap an entire handler with idempotency semantics.
 * Requires the client to send an `Idempotency-Key` header (UUID).
 * Only 2xx JSON responses are cached (retries of failed requests re-run).
 */
export async function withIdempotency(
  req: Request,
  scope: string,
  handler: () => Promise<Response>,
): Promise<Response> {
  const key = req.headers.get("idempotency-key");
  if (!key) return handler();

  const sb = adminClient();
  const cached = await checkIdempotency(req, sb, scope);
  if (cached) return cached;

  const res = await handler();
  if (res.status >= 200 && res.status < 300) {
    try {
      const clone = res.clone();
      const text = await clone.text();
      let parsed: unknown = text;
      try { parsed = JSON.parse(text); } catch { /* keep raw */ }
      await saveIdempotency(req, sb, scope, parsed, res.status);
    } catch (e) {
      console.warn("[withIdempotency] save failed", (e as Error).message);
    }
  }
  return res;
}
