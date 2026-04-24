// Returns a Stripe-hosted invoice or receipt URL for one of the user's
// payment_records rows (so the buyer can download/print it).
// Body: { paymentRecordId: string }
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (s: string, d?: unknown) =>
  console.log(`[GET-INVOICE-URL] ${s}${d ? " - " + JSON.stringify(d) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const supaUrl = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supaUrl, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: u, error: uErr } = await userClient.auth.getUser();
    if (uErr || !u.user) throw new Error("Not authenticated");

    const { paymentRecordId } = await req.json().catch(() => ({}));
    if (!paymentRecordId) throw new Error("paymentRecordId required");

    const admin = createClient(supaUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });
    const { data: rec, error: rErr } = await admin
      .from("payment_records")
      .select("id, user_id, stripe_payment_intent_id, stripe_session_id")
      .eq("id", paymentRecordId)
      .maybeSingle();
    if (rErr) throw new Error(rErr.message);
    if (!rec) throw new Error("Payment not found");
    if (rec.user_id !== u.user.id) throw new Error("Not your payment");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let receiptUrl: string | null = null;
    let invoiceUrl: string | null = null;

    if (rec.stripe_payment_intent_id) {
      const pi = await stripe.paymentIntents.retrieve(rec.stripe_payment_intent_id, {
        expand: ["latest_charge", "invoice"],
      });
      const charge = pi.latest_charge as Stripe.Charge | null;
      if (charge?.receipt_url) receiptUrl = charge.receipt_url;
      const inv = pi.invoice as Stripe.Invoice | null;
      if (inv?.hosted_invoice_url) invoiceUrl = inv.hosted_invoice_url;
    }

    if (!receiptUrl && !invoiceUrl && rec.stripe_session_id) {
      const session = await stripe.checkout.sessions.retrieve(rec.stripe_session_id, {
        expand: ["invoice", "payment_intent.latest_charge"],
      });
      const inv = session.invoice as Stripe.Invoice | null;
      if (inv?.hosted_invoice_url) invoiceUrl = inv.hosted_invoice_url;
      const pi = session.payment_intent as Stripe.PaymentIntent | null;
      const charge = (pi?.latest_charge ?? null) as Stripe.Charge | null;
      if (!receiptUrl && charge?.receipt_url) receiptUrl = charge.receipt_url;
    }

    if (!receiptUrl && !invoiceUrl) {
      throw new Error("No invoice or receipt found for this payment");
    }

    log("returning url", { receiptUrl: !!receiptUrl, invoiceUrl: !!invoiceUrl });

    return new Response(
      JSON.stringify({
        url: invoiceUrl || receiptUrl,
        type: invoiceUrl ? "invoice" : "receipt",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
