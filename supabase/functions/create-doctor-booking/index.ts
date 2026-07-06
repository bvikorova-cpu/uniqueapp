// Create a pending doctor appointment + Stripe Checkout session.
// Body: { doctor_id: uuid, scheduled_at: ISO, patient_notes?: string }
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
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await anonClient.auth.getUser(token);
    if (userErr) throw new Error(userErr.message);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { doctor_id, scheduled_at, patient_notes } = await req.json();
    if (!doctor_id || !scheduled_at) throw new Error("doctor_id and scheduled_at required");

    const scheduledDate = new Date(scheduled_at);
    if (isNaN(+scheduledDate) || scheduledDate.getTime() < Date.now()) {
      throw new Error("scheduled_at must be a future date");
    }
    if (patient_notes && String(patient_notes).length > 2000) {
      throw new Error("patient_notes too long");
    }
    if (doctor_id === user.id) throw new Error("Cannot book yourself");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Load doctor profile
    const { data: profile } = await admin
      .from("healthcare_profiles")
      .select("user_id, provider_name, consultation_duration_min, consultation_price_cents, is_accepting_bookings")
      .eq("user_id", doctor_id)
      .maybeSingle();
    if (!profile || !profile.is_accepting_bookings)
      throw new Error("Doctor is not accepting bookings");
    if (!profile.consultation_price_cents || profile.consultation_price_cents < 100)
      throw new Error("Doctor pricing not configured");

    const duration = profile.consultation_duration_min || 30;
    const priceCents = profile.consultation_price_cents;
    const slotStart = scheduledDate.getTime();
    const slotEnd = slotStart + duration * 60000;

    // Conflict check: any existing appt overlapping?
    const { data: conflicts } = await admin
      .from("healthcare_appointments")
      .select("id, scheduled_at, duration_minutes, status")
      .eq("provider_id", doctor_id)
      .in("status", ["pending_payment", "pending", "confirmed"])
      .gte("scheduled_at", new Date(slotStart - 4 * 3600 * 1000).toISOString())
      .lte("scheduled_at", new Date(slotEnd + 4 * 3600 * 1000).toISOString());

    if (conflicts?.some((c: any) => {
      const cStart = new Date(c.scheduled_at).getTime();
      const cEnd = cStart + (c.duration_minutes || 30) * 60000;
      return slotStart < cEnd && slotEnd > cStart;
    })) {
      throw new Error("This time slot is no longer available");
    }

    // Create pending_payment appointment
    const { data: appt, error: apptErr } = await admin
      .from("healthcare_appointments")
      .insert({
        provider_id: doctor_id,
        patient_id: user.id,
        scheduled_at: scheduledDate.toISOString(),
        duration_minutes: duration,
        status: "pending_payment",
        price_cents: priceCents,
        currency: "EUR",
        patient_notes: patient_notes ?? null,
      })
      .select("id")
      .single();
    if (apptErr) throw new Error(apptErr.message);

    // Stripe Checkout
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: priceCents,
            product_data: {
              name: `Consultation with ${profile.provider_name ?? "Doctor"}`,
              description: `${duration} min · ${scheduledDate.toUTCString()}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointment_id: appt.id,
        doctor_id,
        patient_id: user.id,
        type: "doctor_consultation",
      },
      success_url: `${origin}/doctors/booking/${appt.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/doctors/${doctor_id}?cancelled=1`,
    });

    await admin
      .from("healthcare_appointments")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", appt.id);

    return new Response(JSON.stringify({ url: session.url, appointment_id: appt.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("create-doctor-booking error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
