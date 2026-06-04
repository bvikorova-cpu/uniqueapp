import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRICE_TO_TIER: Record<string, "premium" | "top_premium"> = {
  price_1TOvuRGaXSfGtYFt6sfpt2Dy: "premium",
  price_1TOvuTGaXSfGtYFtIheCgIzQ: "top_premium",
};

const TIER_PRICE: Record<string, number> = { premium: 10, top_premium: 15 };

const log = (s: string, d?: unknown) =>
  console.log(`[check-megatalent-subscription] ${s}${d ? " - " + JSON.stringify(d) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr) throw new Error(`Auth error: ${userErr.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    log("user", { id: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      log("no customer");
      // mark any active row inactive
      await supabaseAdmin
        .from("megatalent_subscriptions")
        .update({ status: "inactive" })
        .eq("user_id", user.id)
        .eq("status", "active");
      return new Response(
        JSON.stringify({ subscribed: false, tier: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    const customerId = customers.data[0].id;
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 5,
    });

    // find an MT subscription
    const mtSub = subs.data.find((s) =>
      s.items.data.some((it) => PRICE_TO_TIER[it.price.id])
    );

    if (!mtSub) {
      log("no active MT sub");
      await supabaseAdmin
        .from("megatalent_subscriptions")
        .update({ status: "inactive" })
        .eq("user_id", user.id)
        .eq("status", "active");
      return new Response(
        JSON.stringify({ subscribed: false, tier: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    const priceId = mtSub.items.data.find((it) => PRICE_TO_TIER[it.price.id])!.price.id;
    const tier = PRICE_TO_TIER[priceId];
    const periodEnd = new Date(mtSub.current_period_end * 1000).toISOString();
    log("active MT sub", { id: mtSub.id, tier, periodEnd });

    // upsert into megatalent_subscriptions
    const { data: existing } = await supabaseAdmin
      .from("megatalent_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    const payload = {
      user_id: user.id,
      tier,
      price: TIER_PRICE[tier],
      bonus_votes: 0,
      win_chance_boost: tier === "top_premium" ? 100 : 0,

      status: "active",
      stripe_customer_id: customerId,
      stripe_subscription_id: mtSub.id,
      current_period_end: periodEnd,
    };

    if (existing) {
      await supabaseAdmin
        .from("megatalent_subscriptions")
        .update(payload)
        .eq("id", existing.id);
    } else {
      await supabaseAdmin.from("megatalent_subscriptions").insert(payload);
    }

    return new Response(
      JSON.stringify({
        subscribed: true,
        tier,
        current_period_end: periodEnd,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});