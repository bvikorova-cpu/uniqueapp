// Runs periodically. For every confirmed appointment whose scheduled_at is
// more than 2h in the past and still not completed/cancelled/no_show,
// mark it as no_show_auto_refund and issue a full Stripe refund.
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
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2025-08-27.basil",
    });

    const cutoff = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
    const { data: appts } = await admin
      .from("healthcare_appointments")
      .select("id, patient_id, provider_id, price_cents, scheduled_at, stripe_payment_intent_id, status")
      .eq("status", "confirmed")
      .lt("scheduled_at", cutoff)
      .limit(200);

    let processed = 0;
    for (const appt of appts ?? []) {
      try {
        if (appt.stripe_payment_intent_id) {
          await stripe.refunds.create({
            payment_intent: appt.stripe_payment_intent_id,
            reason: "requested_by_customer",
          });
        }
        const now = new Date().toISOString();
        await admin
          .from("healthcare_appointments")
          .update({
            status: "no_show_auto_refund",
            cancelled_at: now,
            cancelled_by: "system",
            cancellation_reason: "Auto-refund: doctor did not mark appointment as completed within 2h.",
            refunded_at: now,
            refund_amount_cents: appt.price_cents,
          })
          .eq("id", appt.id);

        await admin
          .from("doctor_payouts")
          .update({ status: "cancelled" })
          .eq("appointment_id", appt.id);

        await admin.from("notifications").insert([
          {
            user_id: appt.patient_id,
            type: "doctor_appointment_auto_refund",
            title: "Appointment refunded",
            message: `The doctor did not confirm your appointment scheduled for ${new Date(appt.scheduled_at).toUTCString()}. You have been fully refunded.`,
          },
          {
            user_id: appt.provider_id,
            type: "doctor_appointment_auto_refund",
            title: "Appointment auto-cancelled",
            message: `Appointment on ${new Date(appt.scheduled_at).toUTCString()} was auto-refunded because it was not marked as completed within 2h.`,
          },
        ]);
        processed++;
      } catch (e) {
        console.error("[doctor-appointments-cron] refund failed", appt.id, e);
      }
    }

    return new Response(JSON.stringify({ ok: true, processed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("doctor-appointments-cron error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
