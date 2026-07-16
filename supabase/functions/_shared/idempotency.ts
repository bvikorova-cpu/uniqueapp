// Shared idempotency helper for edge functions.
// Usage:
//   const cached = await checkIdempotency(req, supabase, "stripe.checkout");
//   if (cached) return cached;
//   ... do work ...
//   await saveIdempotency(req, supabase, "stripe.checkout", body, 200);
//
// Client should pass an "Idempotency-Key" header (UUID) on retryable mutations.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type SB = ReturnType<typeof createClient>;

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
      status: data.response_status ?? 200,
      headers: { "Content-Type": "application/json", "X-Idempotent-Replay": "true" },
    });
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
): Promise<void> {
  const key = req.headers.get("idempotency-key");
  if (!key) return;
  await sb.from("idempotency_keys").upsert(
    {
      key,
      scope,
      user_id: userId ?? null,
      response_body: body as never,
      response_status: status,
    },
    { onConflict: "key" },
  );
}
