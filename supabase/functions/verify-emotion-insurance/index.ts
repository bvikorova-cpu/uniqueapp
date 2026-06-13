import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LEVEL_LIMITS: Record<string, number> = { basic: 5, standard: 10, premium: 9999 };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supaAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: { user } } = await supaAuth.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("sessionId required");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ success: false, status: session.payment_status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    if (session.metadata?.user_id !== user.id) throw new Error("Session/user mismatch");
    const level = String(session.metadata?.coverage_level ?? "");
    if (!LEVEL_LIMITS[level]) throw new Error("Invalid coverage level");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Idempotent: payment_records keyed by stripe_session_id
    const { data: existing } = await admin
      .from("payment_records")
      .select("id")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (!existing) {
      await admin.from("payment_records").insert({
        user_id: user.id,
        stripe_session_id: sessionId,
        amount_cents: session.amount_total ?? 0,
        currency: session.currency ?? "eur",
        status: "paid",
        product_type: "emotion_insurance",
        metadata: { coverage_level: level },
        verified_at: new Date().toISOString(),
      });

      const monthlyPrice = (session.amount_total ?? 0) / 100;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Deactivate any existing active plan, then insert new
      await admin
        .from("emotion_insurance")
        .update({ status: "expired" })
        .eq("user_id", user.id)
        .eq("status", "active");

      await admin.from("emotion_insurance").insert({
        user_id: user.id,
        coverage_level: level,
        monthly_price: monthlyPrice,
        max_claims: LEVEL_LIMITS[level],
        status: "active",
        expires_at: expiresAt.toISOString(),
      });
    }

    return new Response(JSON.stringify({ success: true, level }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[verify-emotion-insurance]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
