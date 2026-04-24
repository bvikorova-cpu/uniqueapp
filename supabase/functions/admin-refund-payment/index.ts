import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) => {
  console.log(`[ADMIN-REFUND] ${step}${details ? " " + JSON.stringify(details) : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // 1. Auth → must be admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) throw new Error("Authentication failed");
    const adminId = userData.user.id;

    const { data: isAdmin, error: roleErr } = await supabase.rpc("has_role", {
      _user_id: adminId,
      _role: "admin",
    });
    if (roleErr) throw new Error(`Role check failed: ${roleErr.message}`);
    if (!isAdmin) throw new Error("Forbidden: admin role required");
    log("admin verified", { adminId });

    // 2. Parse body
    const body = await req.json();
    const { paymentRecordId, amountCents, reason, adminNotes } = body as {
      paymentRecordId: string;
      amountCents?: number;
      reason?: "duplicate" | "fraudulent" | "requested_by_customer";
      adminNotes?: string;
    };
    if (!paymentRecordId) throw new Error("paymentRecordId required");

    // 3. Load payment record
    const { data: record, error: recErr } = await supabase
      .from("payment_records")
      .select("*")
      .eq("id", paymentRecordId)
      .maybeSingle();
    if (recErr || !record) throw new Error("Payment record not found");
    if (record.refunded_at) throw new Error("This payment is already refunded");
    if (!record.stripe_payment_intent_id) {
      throw new Error("No Stripe payment intent attached to this record");
    }
    log("loaded record", { id: record.id, pi: record.stripe_payment_intent_id });

    // 4. Create Stripe refund
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const refundAmount = amountCents ?? record.amount_cents;
    const refund = await stripe.refunds.create({
      payment_intent: record.stripe_payment_intent_id,
      amount: refundAmount,
      reason: reason ?? "requested_by_customer",
      metadata: {
        payment_record_id: record.id,
        admin_id: adminId,
        notes: adminNotes ?? "",
      },
    });
    log("refund created", { id: refund.id, status: refund.status });

    // 5. Update payment_records
    const { error: updErr } = await supabase
      .from("payment_records")
      .update({
        status: "refunded",
        refunded_at: new Date().toISOString(),
        refund_amount_cents: refundAmount,
        refund_reason: reason ?? "requested_by_customer",
        stripe_refund_id: refund.id,
        refunded_by: adminId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", record.id);
    if (updErr) throw new Error(`Failed to update record: ${updErr.message}`);

    // 6. Audit log
    await supabase.from("admin_audit_log").insert({
      admin_id: adminId,
      action: "payment_refunded",
      target_type: "payment_records",
      target_id: record.id,
      details: {
        stripe_refund_id: refund.id,
        amount_cents: refundAmount,
        reason: reason ?? "requested_by_customer",
        notes: adminNotes ?? null,
        product_type: record.product_type,
        product_id: record.product_id,
        original_user_id: record.user_id,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        refund_id: refund.id,
        status: refund.status,
        amount_refunded: refundAmount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
