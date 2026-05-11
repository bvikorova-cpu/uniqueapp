import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function tierFromAmount(amount: number | null | undefined): "pro" | "elite" | "free" {
  if (!amount) return "free";
  if (amount >= 1500) return "elite";
  if (amount >= 500) return "pro";
  return "free";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user?.email) throw new Error("Unauthenticated");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      await admin.from("iq_subscriptions").upsert({
        user_id: user.id, tier: "free", status: "inactive",
      }, { onConflict: "user_id" });
      return new Response(JSON.stringify({ subscribed: false, tier: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
    const sub = subs.data[0];

    if (!sub) {
      await admin.from("iq_subscriptions").upsert({
        user_id: user.id, tier: "free", status: "inactive",
        stripe_customer_id: customerId,
      }, { onConflict: "user_id" });
      return new Response(JSON.stringify({ subscribed: false, tier: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const item = sub.items.data[0];
    const tier = tierFromAmount(item?.price?.unit_amount);
    const periodEnd = new Date((sub as any).current_period_end * 1000).toISOString();

    await admin.from("iq_subscriptions").upsert({
      user_id: user.id,
      tier,
      status: sub.status,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      current_period_end: periodEnd,
      cancel_at_period_end: sub.cancel_at_period_end,
    }, { onConflict: "user_id" });

    return new Response(JSON.stringify({
      subscribed: true,
      tier,
      current_period_end: periodEnd,
      cancel_at_period_end: sub.cancel_at_period_end,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
