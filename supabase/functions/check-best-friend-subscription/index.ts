// check-best-friend-subscription
// - Checks Stripe subscription status (via check-subscription proxy with tier=best_friend)
// - Syncs subscription_status into best_friend_subscriptions
// - Returns usage counters (free_messages_used, monthly_messages_used, bonus_messages)
//   needed by useBestFriendSubscription hook on the frontend.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = req.headers.get("Authorization") ?? "";
  const apikey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  // 1. Ask universal check-subscription
  let subscribed = false;
  let subscription_end: string | null = null;
  let product_id: string | null = null;
  try {
    const r = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/check-subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth, apikey },
      body: JSON.stringify({ tier: "best_friend" }),
    });
    const j = await r.json().catch(() => ({}));
    subscribed = !!j.subscribed;
    subscription_end = j.subscription_end ?? null;
    product_id = j.product_id ?? null;
  } catch (e) {
    console.error("check-subscription proxy failed", e);
  }

  // 2. Identify user (anon client w/ JWT)
  const anon = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: auth } }, auth: { persistSession: false } },
  );
  const { data: userData } = await anon.auth.getUser();
  const user = userData.user;

  let free_messages_used = 0;
  let monthly_messages_used = 0;
  let bonus_messages = 0;

  if (user) {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    let { data: row } = await admin
      .from("best_friend_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!row) {
      const { data: created } = await admin
        .from("best_friend_subscriptions")
        .insert({ user_id: user.id, subscription_status: subscribed ? "active" : "free" })
        .select("*").single();
      row = created;
    }

    // Sync status from Stripe
    const desired = subscribed ? "active" : (row?.subscription_status === "active" ? "free" : (row?.subscription_status ?? "free"));
    if (row && desired !== row.subscription_status) {
      const patch: Record<string, unknown> = { subscription_status: desired };
      if (subscribed) patch.subscription_end = subscription_end;
      const { data: updated } = await admin
        .from("best_friend_subscriptions")
        .update(patch).eq("user_id", user.id).select("*").single();
      if (updated) row = updated;
    }

    free_messages_used = row?.free_messages_used ?? 0;
    monthly_messages_used = row?.monthly_messages_used ?? 0;
    bonus_messages = row?.bonus_messages ?? 0;
  }

  return new Response(
    JSON.stringify({
      subscribed,
      tier: "best_friend",
      product_id,
      subscription_end,
      free_messages_used,
      monthly_messages_used,
      bonus_messages,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
