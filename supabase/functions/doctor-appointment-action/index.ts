// Doctor-side lifecycle actions on an appointment.
// Body: { appointment_id: uuid, action: 'cancel' | 'complete' | 'no_show', reason?: string, notes?: string }
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

    const { appointment_id, action, reason, notes } = await req.json();
    if (!appointment_id || !["cancel", "complete", "no_show"].includes(action)) {
      throw new Error("Invalid action");
    }

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
    if (appt.provider_id !== user.id) throw new Error("Not authorized");

    const now = new Date().toISOString();
    const update: Record<string, unknown> = { doctor_notes: notes ?? appt.doctor_notes };

    if (action === "cancel") {
      update.status = "cancelled_by_doctor";
      update.cancelled_at = now;
      update.cancelled_by = "doctor";
      update.cancellation_reason = reason ?? null;

      // Full refund
      if (appt.stripe_payment_intent_id) {
        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
          apiVersion: "2025-08-27.basil",
        });
        try {
          await stripe.refunds.create({
            payment_intent: appt.stripe_payment_intent_id,
            reason: "requested_by_customer",
          });
          update.refunded_at = now;
          update.refund_amount_cents = appt.price_cents;
        } catch (e) {
          console.error("Refund failed", e);
        }
        // Void payout
        await admin
          .from("doctor_payouts")
          .update({ status: "cancelled" })
          .eq("appointment_id", appointment_id);
      }
    } else if (action === "complete") {
      update.status = "completed";
      update.completed_at = now;
    } else if (action === "no_show") {
      update.status = "no_show";
      update.completed_at = now; // doctor still gets paid
    }

    await admin.from("healthcare_appointments").update(update).eq("id", appointment_id);

    await admin.from("notifications").insert({
      user_id: appt.patient_id,
      type: `doctor_appointment_${action}`,
      title:
        action === "cancel"
          ? "Appointment cancelled by doctor"
          : action === "complete"
            ? "Appointment marked as completed"
            : "Marked as no-show",
      message:
        action === "cancel"
          ? `Your appointment on ${new Date(appt.scheduled_at).toUTCString()} was cancelled and refunded.`
          : `Your appointment on ${new Date(appt.scheduled_at).toUTCString()} is ${action}.`,
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("doctor-appointment-action error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
