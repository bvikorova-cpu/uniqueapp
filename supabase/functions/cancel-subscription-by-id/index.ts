// Cancels a specific subscription by Stripe subscription_id (at period end).
// Body: { subscription_id: string, immediate?: boolean }

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (s: string, d?: any) =>
  console.log(`[CANCEL-SUB-BY-ID] ${s}${d ? " - " + JSON.stringify(d) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Early auth pre-check (returns 401 instead of crashing inside try → 500)
  const _earlyAuth = req.headers.get("Authorization");
  if (!_earlyAuth || !_earlyAuth.toLowerCase().startsWith("bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

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

    const { subscription_id, immediate = false } = await req.json();
    if (!subscription_id) throw new Error("subscription_id required");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Ownership check
    const sub = await stripe.subscriptions.retrieve(subscription_id);
    const customer = await stripe.customers.retrieve(sub.customer as string);
    if ((customer as Stripe.Customer).email !== user.email) {
      throw new Error("Subscription does not belong to this user");
    }

    let result: Stripe.Subscription;
    if (immediate) {
      result = await stripe.subscriptions.cancel(subscription_id);
    } else {
      result = await stripe.subscriptions.update(subscription_id, {
        cancel_at_period_end: true,
      });
    }

    log("canceled", { id: result.id, immediate });

    return new Response(
      JSON.stringify({
        success: true,
        immediate,
        cancel_at: (result as any).current_period_end
          ? new Date((result as any).current_period_end * 1000).toISOString()
          : null,
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
