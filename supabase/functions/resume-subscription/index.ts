// Resumes a paused subscription OR un-cancels a subscription scheduled for cancellation.
// Body: { subscription_id: string }

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (s: string, d?: any) =>
  console.log(`[RESUME-SUB] ${s}${d ? " - " + JSON.stringify(d) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user?.email) throw new Error("Auth failed");
    const user = userData.user;

    const { subscription_id } = await req.json();
    if (!subscription_id) throw new Error("subscription_id required");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Verify ownership: subscription must belong to a customer with this user's email.
    const sub = await stripe.subscriptions.retrieve(subscription_id);
    const customer = await stripe.customers.retrieve(sub.customer as string);
    if ((customer as Stripe.Customer).email !== user.email) {
      throw new Error("Subscription does not belong to this user");
    }

    // Resume from paused state OR clear cancel_at_period_end
    const updated = await stripe.subscriptions.update(subscription_id, {
      pause_collection: "" as any, // clears pause
      cancel_at_period_end: false,
    });

    log("resumed", { id: updated.id });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription resumed",
        subscription_id: updated.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
