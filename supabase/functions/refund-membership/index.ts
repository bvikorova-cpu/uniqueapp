import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const REFUND_WINDOW_HOURS = 24;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user?.email) throw new Error("Unauthorized");

    const { subscription_id } = await req.json();
    if (!subscription_id || typeof subscription_id !== "string") throw new Error("subscription_id required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });
    const sub = await stripe.subscriptions.retrieve(subscription_id, { expand: ["customer"] });
    const customer = sub.customer as Stripe.Customer;
    if (customer.email !== userData.user.email) throw new Error("Forbidden");

    // Find latest paid invoice on this subscription
    const invoices = await stripe.invoices.list({
      subscription: subscription_id,
      status: "paid",
      limit: 1,
    });
    const inv = invoices.data[0];
    if (!inv) throw new Error("No paid invoice found");

    const ageHours = (Date.now() / 1000 - inv.created) / 3600;
    if (ageHours > REFUND_WINDOW_HOURS) {
      return new Response(
        JSON.stringify({
          eligible: false,
          reason: `Refund window expired (${ageHours.toFixed(1)}h > ${REFUND_WINDOW_HOURS}h)`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const piId = typeof inv.payment_intent === "string" ? inv.payment_intent : inv.payment_intent?.id;
    if (!piId) throw new Error("Invoice has no payment intent");

    const refund = await stripe.refunds.create({
      payment_intent: piId,
      reason: "requested_by_customer",
      metadata: { subscription_id, source: "membership_24h_refund", user_id: userData.user.id },
    });

    // Cancel subscription immediately
    await stripe.subscriptions.cancel(subscription_id, { invoice_now: false, prorate: false });

    return new Response(
      JSON.stringify({ eligible: true, refund_id: refund.id, amount_refunded: refund.amount }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[refund-membership]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
