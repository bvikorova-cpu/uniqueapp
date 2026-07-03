// Sync the current user's Challenge PRO subscription status from Stripe
// into public.challenge_pro_subscribers. Returns { active, activeUntil }.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (s: string, d?: unknown) =>
  console.log(`[SYNC-CHALLENGE-PRO] ${s}${d ? ` ${JSON.stringify(d)}` : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ active: false, reason: "no-auth" }, 200);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData.user?.email) return json({ active: false, reason: "invalid-auth" }, 200);
    const user = userData.user;

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      await admin.from("challenge_pro_subscribers").delete().eq("user_id", user.id);
      return json({ active: false }, 200);
    }
    const customerId = customers.data[0].id;

    const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 20 });
    let match: { end: number; subId: string } | null = null;
    for (const s of subs.data) {
      const md = (s.metadata || {}) as Record<string, string>;
      if (md.type === "challenge_pro" || md.product === "challenge_pro") {
        if (!match || s.current_period_end > match.end) {
          match = { end: s.current_period_end, subId: s.id };
        }
      }
    }

    if (!match) {
      // No active PRO — remove any stale row
      await admin.from("challenge_pro_subscribers").delete().eq("user_id", user.id);
      return json({ active: false }, 200);
    }

    const activeUntil = new Date(match.end * 1000).toISOString();
    await admin.from("challenge_pro_subscribers").upsert({
      user_id: user.id,
      active_until: activeUntil,
      stripe_subscription_id: match.subId,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    log("synced PRO", { user: user.id, activeUntil });
    return json({ active: true, activeUntil }, 200);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", msg);
    return json({ active: false, error: msg }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}
