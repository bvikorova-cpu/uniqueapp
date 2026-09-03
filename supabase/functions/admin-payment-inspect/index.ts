import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const { data: userData, error: userErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userData.user) throw new Error("Authentication failed");
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden: admin role required");

    const { paymentRecordId } = (await req.json()) as { paymentRecordId?: string };
    if (!paymentRecordId) throw new Error("paymentRecordId required");

    const { data: record } = await supabase
      .from("payment_records")
      .select("*")
      .eq("id", paymentRecordId)
      .maybeSingle();
    if (!record) throw new Error("Payment record not found");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let intent: any = null;
    let session: any = null;

    if (record.stripe_payment_intent_id) {
      intent = await stripe.paymentIntents.retrieve(record.stripe_payment_intent_id, {
        expand: ["latest_charge"],
      });
    }
    if (record.stripe_session_id) {
      try {
        session = await stripe.checkout.sessions.retrieve(record.stripe_session_id);
        if (!intent && typeof session.payment_intent === "string") {
          intent = await stripe.paymentIntents.retrieve(session.payment_intent, {
            expand: ["latest_charge"],
          });
        }
      } catch (_e) {
        // session may be expired/unavailable
      }
    }

    const charge = intent?.latest_charge && typeof intent.latest_charge === "object"
      ? intent.latest_charge
      : null;

    const outcome = charge?.outcome ?? null;
    const err = intent?.last_payment_error ?? null;

    const failureReason = err?.message ??
      charge?.failure_message ??
      (outcome?.seller_message as string | undefined) ??
      null;

    return new Response(
      JSON.stringify({
        record,
        stripe: {
          intent_status: intent?.status ?? null,
          amount: intent?.amount ?? null,
          currency: intent?.currency ?? null,
          session_status: session?.status ?? null,
          session_payment_status: session?.payment_status ?? null,
          customer_email: session?.customer_details?.email ?? charge?.billing_details?.email ?? null,
          payment_method_type: charge?.payment_method_details?.type ?? null,
          card_brand: charge?.payment_method_details?.card?.brand ?? null,
          card_last4: charge?.payment_method_details?.card?.last4 ?? null,
          card_country: charge?.payment_method_details?.card?.country ?? null,
          receipt_url: charge?.receipt_url ?? null,
          charge_status: charge?.status ?? null,
          refunded: charge?.refunded ?? null,
          amount_refunded: charge?.amount_refunded ?? null,
          disputed: charge?.disputed ?? null,
          failure_code: err?.code ?? charge?.failure_code ?? null,
          decline_code: err?.decline_code ?? charge?.outcome?.reason ?? null,
          failure_reason: failureReason,
          risk_level: outcome?.risk_level ?? null,
          network_status: outcome?.network_status ?? null,
          created: intent?.created ?? null,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
