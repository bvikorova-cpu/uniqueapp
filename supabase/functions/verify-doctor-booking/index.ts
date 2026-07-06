// Verify Stripe session and mark the appointment as confirmed if paid.
// Called from the /doctors/booking/:appointmentId success page.
// Body: { appointment_id: uuid, session_id: string }
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLATFORM_FEE_BPS = 1500; // 15%

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
    if (!user) throw new Error("User not authenticated");

    const { appointment_id, session_id } = await req.json();
    if (!appointment_id || !session_id) throw new Error("appointment_id and session_id required");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: appt, error } = await admin
      .from("healthcare_appointments")
      .select("*")
      .eq("id", appointment_id)
      .maybeSingle();
    if (error || !appt) throw new Error("Appointment not found");
    if (appt.patient_id !== user.id) throw new Error("Not authorized");

    // Helper: fetch emails for patient + doctor (used so the client can build mailto links)
    const fetchEmails = async () => {
      const [{ data: patient }, { data: doctor }, { data: dprof }] = await Promise.all([
        admin.auth.admin.getUserById(appt.patient_id),
        admin.auth.admin.getUserById(appt.provider_id),
        admin
          .from("healthcare_profiles")
          .select("provider_name, contact_email")
          .eq("user_id", appt.provider_id)
          .maybeSingle(),
      ]);
      return {
        patient_email: patient?.user?.email ?? null,
        doctor_email: (dprof as any)?.contact_email ?? doctor?.user?.email ?? null,
        doctor_name: (dprof as any)?.provider_name ?? "Doctor",
      };
    };

    // Already confirmed?
    if (appt.status === "confirmed") {
      const emails = await fetchEmails();
      return new Response(JSON.stringify({ status: "confirmed", appointment: appt, ...emails }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2025-08-27.basil",
    });
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent"],
    });

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ status: appt.status, payment_status: session.payment_status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentIntent =
      typeof session.payment_intent === "string"
        ? await stripe.paymentIntents.retrieve(session.payment_intent)
        : session.payment_intent;
    const chargeId = paymentIntent?.latest_charge as string | null;

    const platformFee = Math.round((appt.price_cents * PLATFORM_FEE_BPS) / 10000);
    const doctorAmount = appt.price_cents - platformFee;

    await admin
      .from("healthcare_appointments")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        stripe_payment_intent_id: paymentIntent?.id,
        stripe_charge_id: chargeId,
      })
      .eq("id", appointment_id);

    // Record payout row (pending payout)
    await admin.from("doctor_payouts").upsert(
      {
        doctor_id: appt.provider_id,
        appointment_id,
        amount_cents: doctorAmount,
        platform_fee_cents: platformFee,
        currency: "EUR",
        status: "pending",
      },
      { onConflict: "appointment_id" },
    );

    // Notifications (best-effort)
    await admin.from("notifications").insert([
      {
        user_id: appt.provider_id,
        type: "doctor_booking_confirmed",
        title: "New appointment booked",
        message: `You have a new confirmed appointment on ${new Date(appt.scheduled_at).toUTCString()}.`,
      },
      {
        user_id: appt.patient_id,
        type: "doctor_booking_confirmed",
        title: "Appointment confirmed",
        message: `Your appointment is confirmed for ${new Date(appt.scheduled_at).toUTCString()}.`,
      },
    ]);

    return new Response(JSON.stringify({ status: "confirmed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("verify-doctor-booking error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
