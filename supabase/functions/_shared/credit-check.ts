// Shared credit-check helper for AI edge functions.
// Authenticates the caller and deducts AI credits in a single helper call.
//
// Usage at the top of an edge function:
//   import { requireAiCredits } from "../_shared/credit-check.ts";
//   const auth = await requireAiCredits(req, corsHeaders, { credits: 1, usageType: "ai-chat" });
//   if (auth.errorResponse) return auth.errorResponse;
//   const { user, supabase, deduct } = auth;
//   ...do work...
//   await deduct();  // call after successful AI response
//
// If you don't need post-call gating, you can just call deduct() at the end.

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export interface CreditOptions {
  credits?: number;        // credits to deduct, default 1
  usageType?: string;      // label for ai_usage_history, default "ai_generation"
  description?: string;    // optional description for the usage row
  // Rate limit (per-user, per-bucket). Defaults: 30 req / 60 s using usageType as bucket.
  // Set `rateLimit: false` to disable.
  rateLimit?: false | { bucket?: string; max?: number; windowSec?: number };
}

export interface CreditAuthResult {
  errorResponse?: Response;
  user?: { id: string; email?: string };
  supabase?: SupabaseClient;
  credits?: number;
  deduct?: () => Promise<void>;
}

export async function requireAiCredits(
  req: Request,
  corsHeaders: Record<string, string>,
  opts: CreditOptions = {}
): Promise<CreditAuthResult> {
  const credits = opts.credits ?? 1;
  const usageType = opts.usageType ?? "ai_generation";

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  // Auth client (anon) is used only to validate the caller's JWT.
  // Data client uses the service role so RLS doesn't hide the user's own
  // ai_credits row when the helper queries it server-side.
  const authClient = createClient(supabaseUrl, anonKey);
  const supabase = createClient(supabaseUrl, serviceKey || anonKey);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return {
      errorResponse: new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      ),
    };
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: userErr } = await authClient.auth.getUser(token);
  if (userErr || !user) {
    return {
      errorResponse: new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      ),
    };
  }
  // ---- Rate limiting (per-user, per-bucket) ----
  if (opts.rateLimit !== false) {
    const rl = opts.rateLimit ?? {};
    const bucket = rl.bucket ?? `ai.${usageType}`;
    const max = rl.max ?? 30;
    const windowSec = rl.windowSec ?? 60;
    try {
      const { data: allowed, error: rlErr } = await supabase.rpc("check_rate_limit", {
        _bucket: `${bucket}:${user.id}`,
        _max: max,
        _window_seconds: windowSec,
        _user_id: user.id,
      });
      if (!rlErr && allowed === false) {
        return {
          errorResponse: new Response(
            JSON.stringify({
              error: "rate_limited",
              message: `Too many requests. Try again in ${windowSec}s.`,
              bucket,
            }),
            {
              status: 429,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
                "Retry-After": String(windowSec),
              },
            }
          ),
        };
      }
    } catch (e) {
      // Fail open on infra errors — never block a paying user because of a rate-limit infra glitch.
      console.warn("[requireAiCredits] rate-limit rpc error:", (e as Error).message);
    }
  }


  // Check current credit balance
  const { data: row } = await supabase
    .from("ai_credits")
    .select("credits_remaining")
    .eq("user_id", user.id)
    .maybeSingle();

  const remaining = row?.credits_remaining ?? 0;
  if (remaining < credits) {
    return {
      errorResponse: new Response(
        JSON.stringify({
          error: `Insufficient AI credits. Need ${credits}, have ${remaining}.`,
          creditsRemaining: remaining,
          creditsRequired: credits,
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      ),
    };
  }

  const deduct = async () => {
    await supabase
      .from("ai_credits")
      .update({
        credits_remaining: remaining - credits,
        last_used_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    await supabase.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: usageType,
      credits_used: credits,
      description: opts.description ?? null,
    });
  };

  return {
    user: { id: user.id, email: user.email ?? undefined },
    supabase,
    credits: remaining,
    deduct,
  };
}
