// Shared rate-limit wrapper for AI edge functions.
// Calls the SECURITY DEFINER RPC `check_rate_limit(_bucket, _max, _window_seconds)`.
//
// Usage:
//   const rl = await enforceRateLimit(req, supabase, { bucket: 'ai.foo', max: 30, windowSec: 60 });
//   if (rl) return rl; // 429 Response — short-circuit
//
// Requires that the caller already validated the JWT (we need user.id).

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export interface RateLimitOptions {
  /** Bucket key, e.g. `ai.story-generate`. Combined server-side with user_id. */
  bucket: string;
  /** Max requests per window per user. */
  max: number;
  /** Window length in seconds. */
  windowSec: number;
}

export async function enforceRateLimit(
  userId: string,
  supabase: SupabaseClient,
  opts: RateLimitOptions,
  corsHeaders: Record<string, string> = {},
): Promise<Response | null> {
  if (!userId) return null; // anonymous endpoints: skip — gate elsewhere
  const { data, error } = await supabase.rpc("check_rate_limit", {
    _bucket: `${opts.bucket}:${userId}`,
    _max: opts.max,
    _window_seconds: opts.windowSec,
    _user_id: userId,
  });
  if (error) {
    // Fail open — log but do not block on infra issue.
    console.warn("[withRateLimit] rpc error", error.message);
    return null;
  }
  if (data === false) {
    return new Response(
      JSON.stringify({
        error: "rate_limited",
        message: `Too many requests. Try again in ${opts.windowSec}s.`,
        bucket: opts.bucket,
      }),
      {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(opts.windowSec) },
      },
    );
  }
  return null;
}
