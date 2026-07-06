// Patient cancels their appointment. >24h before scheduled_at → full refund.
// Body: { appointment_id: uuid, reason?: string }
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authentication required");
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: userData } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { appointment_id, reason } = await req.json();
    if (!appointment_id) throw new Error("appointment_id required");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: appt } = await admin
      .from("healthcare_appointments")
      .select("*")
      .eq("id", appointment_id)
      .maybeSingle();
    if (!appt) throw new Error("Appointment not found");
    if (appt.patient_id !== user.id) throw new Error("Not authorized");
    if (!["pending_payment", "confirmed"].includes(appt.status))
      throw new Error("Cannot cancel this appointment");

    const now = new Date();
    const hoursUntil = (new Date(appt.scheduled_at).getTime() - now.getTime()) / 3600000;
    const eligibleForRefund = hoursUntil >= 24;

    const update: Record<string, unknown> = {
      status: "cancelled_by_patient",
      cancelled_at: now.toISOString(),
      cancelled_by: "patient",
      cancellation_reason: reason ?? null,
    };

    if (eligibleForRefund && appt.stripe_payment_intent_id) {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
        apiVersion: "2025-08-27.basil",
      });
      try {
        await stripe.refunds.create({
          payment_intent: appt.stripe_payment_intent_id,
          reason: "requested_by_customer",
        });
        update.refunded_at = now.toISOString();
        update.refund_amount_cents = appt.price_cents;
      } catch (e) {
        console.error("Refund failed", e);
      }
      await admin
        .from("doctor_payouts")
        .update({ status: "cancelled" })
        .eq("appointment_id", appointment_id);
    }

    await admin.from("healthcare_appointments").update(update).eq("id", appointment_id);

    await admin.from("notifications").insert({
      user_id: appt.provider_id,
      type: "doctor_appointment_cancelled_by_patient",
      title: "Appointment cancelled by patient",
      message: `Appointment on ${new Date(appt.scheduled_at).toUTCString()} was cancelled by the patient${eligibleForRefund ? " (refunded)" : " (no refund, <24h)"}.`,
    });

    return new Response(
      JSON.stringify({ ok: true, refunded: eligibleForRefund }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("patient-cancel-booking error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
