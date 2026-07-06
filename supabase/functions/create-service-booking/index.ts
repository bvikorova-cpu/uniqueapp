// Create a pending service booking + Stripe Checkout session.
// Body: { provider_id: uuid, scheduled_at: ISO, offering_id?: uuid, customer_notes?: string }
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
    const { data: userData, error: userErr } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr) throw new Error(userErr.message);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { provider_id, scheduled_at, customer_notes, offering_id } = await req.json();
    if (!provider_id || !scheduled_at) throw new Error("provider_id and scheduled_at required");
    if (provider_id === user.id) throw new Error("Cannot book yourself");

    const scheduledDate = new Date(scheduled_at);
    if (isNaN(+scheduledDate) || scheduledDate.getTime() < Date.now()) {
      throw new Error("scheduled_at must be a future date");
    }
    if (customer_notes && String(customer_notes).length > 2000) {
      throw new Error("customer_notes too long");
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: profile } = await admin
      .from("service_providers")
      .select("owner_id, business_name, category, duration_min, price_cents, is_accepting_bookings")
      .eq("owner_id", provider_id)
      .maybeSingle();
    if (!profile || !profile.is_accepting_bookings) throw new Error("Provider is not accepting bookings");

    let offering: any = null;
    if (offering_id) {
      const { data } = await admin
        .from("service_offerings")
        .select("id, provider_id, name, duration_min, price_cents, is_active")
        .eq("id", offering_id)
        .maybeSingle();
      if (!data || data.provider_id !== provider_id || !data.is_active) {
        throw new Error("Selected service is not available");
      }
      offering = data;
    }

    const duration = offering?.duration_min ?? profile.duration_min ?? 60;
    const priceCents = offering?.price_cents ?? profile.price_cents;
    if (!priceCents || priceCents < 100) throw new Error("Provider pricing not configured");
    const offeringName = offering?.name ?? null;

    const slotStart = scheduledDate.getTime();
    const slotEnd = slotStart + duration * 60000;

    const { data: conflicts } = await admin
      .from("service_bookings")
      .select("id, scheduled_at, duration_minutes, status")
      .eq("provider_id", provider_id)
      .in("status", ["pending_payment", "confirmed"])
      .gte("scheduled_at", new Date(slotStart - 8 * 3600 * 1000).toISOString())
      .lte("scheduled_at", new Date(slotEnd + 8 * 3600 * 1000).toISOString());

    if (conflicts?.some((c: any) => {
      const cStart = new Date(c.scheduled_at).getTime();
      const cEnd = cStart + (c.duration_minutes || duration) * 60000;
      return slotStart < cEnd && slotEnd > cStart;
    })) {
      throw new Error("This time slot is no longer available");
    }

    const { data: booking, error: bookErr } = await admin
      .from("service_bookings")
      .insert({
        provider_id,
        customer_id: user.id,
        scheduled_at: scheduledDate.toISOString(),
        duration_minutes: duration,
        status: "pending_payment",
        price_cents: priceCents,
        currency: "EUR",
        customer_notes: customer_notes ?? null,
        offering_id: offering?.id ?? null,
        offering_name: offeringName,
      })
      .select("id")
      .single();
    if (bookErr) throw new Error(bookErr.message);

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
              name: `${profile.business_name} · ${offeringName ?? profile.category}`,
              description: `${duration} min · ${scheduledDate.toUTCString()}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: booking.id,
        provider_id,
        customer_id: user.id,
        type: "service_booking",
      },
      success_url: `${origin}/services/booking/${booking.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/services/${provider_id}?cancelled=1`,
    });

    await admin
      .from("service_bookings")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", booking.id);

    return new Response(JSON.stringify({ url: session.url, booking_id: booking.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("create-service-booking error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
