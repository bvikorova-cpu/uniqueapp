import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    if (!authHeader) throw new Error("No auth header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) throw new Error("Auth failed");
    const user = userData.user;

    // Find latest open dunning row for this user
    const { data: rows, error } = await supabase
      .from("dunning_events")
      .select("*")
      .eq("user_id", user.id)
      .in("kind", ["failed", "requires_action"])
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw error;

    const dunning = rows?.[0] ?? null;

    // Optionally cross-check live with Stripe to avoid stale rows
    let stillPastDue = !!dunning;
    if (dunning?.stripe_subscription_id) {
      try {
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        const sub = await stripe.subscriptions.retrieve(dunning.stripe_subscription_id);
        stillPastDue = ["past_due", "unpaid", "incomplete"].includes(sub.status);
      } catch (_e) { /* keep DB state */ }
    }

    return new Response(
      JSON.stringify({
        has_dunning: stillPastDue,
        dunning: stillPastDue ? dunning : null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg, has_dunning: false }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
