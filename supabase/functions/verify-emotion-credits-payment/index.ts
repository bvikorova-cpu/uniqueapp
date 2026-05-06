import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Idempotently credits the user's emotion_credits row after Stripe payment is confirmed.
// Identifies the session via session_id (preferred) or trusts the latest paid emotion_credits session for this user.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization required");
    const supa = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: { user } } = await supa.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) throw new Error("Not authenticated");

    const body = await req.json().catch(() => ({}));
    const sessionId: string | undefined = body.session_id;

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find the relevant Checkout session
    let session: Stripe.Checkout.Session | null = null;
    if (sessionId) {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } else {
      // Fallback: find most recent paid emotion_credits session for this email
      const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      const cid = customers.data[0]?.id;
      if (cid) {
        const list = await stripe.checkout.sessions.list({ customer: cid, limit: 10 });
        session =
          list.data.find(
            (s) =>
              s.metadata?.product_type === "emotion_credits" &&
              s.payment_status === "paid"
          ) || null;
      }
    }

    if (!session) throw new Error("Session not found");
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ verified: false, status: session.payment_status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    const credits = parseInt(session.metadata?.credits ?? "0", 10);
    if (!credits) throw new Error("Session has no credits metadata");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Idempotency: check payment_records first
    const { data: existing } = await admin
      .from("payment_records")
      .select("id, verified_at")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (existing?.verified_at) {
      return new Response(JSON.stringify({ verified: true, credits, alreadyCredited: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    await admin.from("payment_records").upsert(
      {
        user_id: user.id,
        product_type: "emotion_credits",
        amount_cents: session.amount_total ?? 0,
        currency: session.currency ?? "eur",
        status: "paid",
        stripe_session_id: session.id,
        metadata: session.metadata ?? {},
        verified_at: new Date().toISOString(),
      },
      { onConflict: "stripe_session_id" }
    );

    // Credit the user's emotion_credits row
    const { data: row } = await admin
      .from("emotion_credits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (row) {
      await admin
        .from("emotion_credits")
        .update({
          credits_remaining: (row.credits_remaining ?? 0) + credits,
          total_credits_purchased: (row.total_credits_purchased ?? 0) + credits,
        })
        .eq("user_id", user.id);
    } else {
      await admin.from("emotion_credits").insert({
        user_id: user.id,
        credits_remaining: credits,
        total_credits_purchased: credits,
        total_credits_used: 0,
      });
    }

    return new Response(JSON.stringify({ verified: true, credits }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[verify-emotion-credits-payment]", msg);
    return new Response(JSON.stringify({ verified: false, error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
