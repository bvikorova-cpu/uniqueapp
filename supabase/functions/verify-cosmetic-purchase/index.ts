// Verifies a Stripe Checkout Session for a cosmetic item, then grants ownership.
// Idempotent: if the user already owns the item, it returns ok without duplicating.
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
    const { sessionId, itemId } = await req.json();
    if (!sessionId || !itemId) {
      return new Response(JSON.stringify({ ok: false, error: "missing_params" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ ok: false, error: "unauthenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: u } = await userClient.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = u.user;
    if (!user) {
      return new Response(JSON.stringify({ ok: false, error: "unauthenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ ok: false, error: "not_paid" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (session.metadata?.itemId !== itemId) {
      return new Response(JSON.stringify({ ok: false, error: "item_mismatch" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (session.metadata?.userId && session.metadata.userId !== user.id) {
      return new Response(JSON.stringify({ ok: false, error: "user_mismatch" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service-role client to bypass RLS for the grant + audit.
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Anti-double-grant: check first.
    const { data: existing } = await adminClient
      .from("user_rewards_cosmetics")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_id", itemId)
      .maybeSingle();

    if (!existing) {
      const { error: insErr } = await adminClient.from("user_rewards_cosmetics").insert({
        user_id: user.id,
        item_id: itemId,
        is_equipped: false,
        acquired_via: "stripe",
      });
      if (insErr) {
        console.error("insert ownership failed", insErr);
        return new Response(JSON.stringify({ ok: false, error: "grant_failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Best-effort audit log.
      await adminClient.from("reward_audit_log").insert({
        user_id: user.id,
        source: "cosmetic_stripe",
        reward_type: "cosmetic",
        reward_value: 0,
        reference_id: itemId,
        metadata: { session_id: sessionId, amount_total: session.amount_total },
      });
    }

    return new Response(JSON.stringify({ ok: true, already_owned: !!existing }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    console.error("verify-cosmetic-purchase error:", e);
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
