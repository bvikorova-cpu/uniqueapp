import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("Missing authorization");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { tipId, reason } = await req.json();
    if (!tipId) throw new Error("tipId required");

    const { data: tip, error: tipErr } = await admin
      .from("profile_tips")
      .select("*")
      .eq("id", tipId)
      .maybeSingle();
    if (tipErr || !tip) throw new Error("Tip not found");

    // Authorize: recipient OR admin
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (tip.recipient_id !== user.id && !isAdmin) {
      throw new Error("Forbidden");
    }

    if (tip.status === "refunded") {
      return new Response(JSON.stringify({ ok: true, alreadyRefunded: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (tip.status !== "completed") {
      throw new Error(`Cannot refund tip in status: ${tip.status}`);
    }
    if (!tip.stripe_payment_intent_id) {
      throw new Error("No payment intent on tip");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2025-08-27.basil",
    });

    const refund = await stripe.refunds.create({
      payment_intent: tip.stripe_payment_intent_id,
      reason: "requested_by_customer",
      reverse_transfer: !!tip.destination_account_id,
      refund_application_fee: !!tip.destination_account_id,
    });

    await admin
      .from("profile_tips")
      .update({
        status: "refunded",
        refunded_at: new Date().toISOString(),
        refund_reason: reason ?? null,
        stripe_refund_id: refund.id,
        refunded_by: user.id,
      })
      .eq("id", tipId);

    return new Response(JSON.stringify({ ok: true, refund_id: refund.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
