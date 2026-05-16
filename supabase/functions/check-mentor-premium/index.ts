// Check Personal Mentor Premium subscription status
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PRICE_TO_PLAN: Record<string, string> = {
  price_1TXnOuGaXSfGtYFtNzPlq3GN: "monthly",
  price_1TXnOvGaXSfGtYFtxGWrODSu: "yearly",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user } } = await supa.auth.getUser();
    if (!user?.email) return new Response(JSON.stringify({ subscribed: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (!customers.data.length) {
      await admin.from("mentor_premium_subs").upsert({ user_id: user.id, email: user.email, status: "inactive", plan: "monthly" }, { onConflict: "user_id" });
      return new Response(JSON.stringify({ subscribed: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const customerId = customers.data[0].id;
    const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 5 });
    const mentorSub = subs.data.find((s) => s.items.data.some((i) => PRICE_TO_PLAN[i.price.id]));
    if (!mentorSub) {
      await admin.from("mentor_premium_subs").upsert({ user_id: user.id, email: user.email, stripe_customer_id: customerId, status: "inactive", plan: "monthly" }, { onConflict: "user_id" });
      return new Response(JSON.stringify({ subscribed: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const item = mentorSub.items.data.find((i) => PRICE_TO_PLAN[i.price.id])!;
    const plan = PRICE_TO_PLAN[item.price.id];
    const periodEnd = new Date((mentorSub as any).current_period_end * 1000).toISOString();
    await admin.from("mentor_premium_subs").upsert({
      user_id: user.id, email: user.email, stripe_customer_id: customerId, stripe_subscription_id: mentorSub.id,
      status: "active", plan, current_period_end: periodEnd,
    }, { onConflict: "user_id" });
    return new Response(JSON.stringify({ subscribed: true, plan, current_period_end: periodEnd }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
