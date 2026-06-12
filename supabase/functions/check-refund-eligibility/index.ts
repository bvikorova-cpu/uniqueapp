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
    const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!userData.user?.email) throw new Error("Unauthorized");

    const { subscription_id } = await req.json();
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
    const sub = await stripe.subscriptions.retrieve(subscription_id, { expand: ["customer"] });
    if ((sub.customer as Stripe.Customer).email !== userData.user.email) throw new Error("Forbidden");

    const invoices = await stripe.invoices.list({ subscription: subscription_id, status: "paid", limit: 1 });
    const inv = invoices.data[0];
    if (!inv) {
      return new Response(JSON.stringify({ eligible: false, reason: "no_invoice" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const hours_left = REFUND_WINDOW_HOURS - (Date.now() / 1000 - inv.created) / 3600;
    return new Response(
      JSON.stringify({
        eligible: hours_left > 0,
        hours_left: Math.max(0, hours_left),
        amount: inv.amount_paid,
        currency: inv.currency,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ eligible: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
