// Verify Stripe session and mark service booking as confirmed.
// Returns customer + provider emails for direct mailto contact.
// Body: { booking_id: uuid, session_id: string }
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

    const { booking_id, session_id } = await req.json();
    if (!booking_id || !session_id) throw new Error("booking_id and session_id required");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: booking, error } = await admin
      .from("service_bookings")
      .select("*")
      .eq("id", booking_id)
      .maybeSingle();
    if (error || !booking) throw new Error("Booking not found");
    if (booking.customer_id !== user.id && booking.provider_id !== user.id) {
      throw new Error("Not authorized");
    }

    const fetchMeta = async () => {
      const [{ data: cust }, { data: prov }, { data: pprof }] = await Promise.all([
        admin.auth.admin.getUserById(booking.customer_id),
        admin.auth.admin.getUserById(booking.provider_id),
        admin
          .from("service_providers")
          .select("business_name, category")
          .eq("owner_id", booking.provider_id)
          .maybeSingle(),
      ]);
      return {
        customer_email: cust?.user?.email ?? null,
        provider_email: prov?.user?.email ?? null,
        provider_name: (pprof as any)?.business_name ?? "Provider",
        provider_category: (pprof as any)?.category ?? null,
      };
    };

    if (booking.status === "confirmed") {
      const meta = await fetchMeta();
      return new Response(JSON.stringify({ status: "confirmed", booking, ...meta }), {
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
      return new Response(
        JSON.stringify({ status: booking.status, payment_status: session.payment_status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const paymentIntent =
      typeof session.payment_intent === "string"
        ? await stripe.paymentIntents.retrieve(session.payment_intent)
        : session.payment_intent;
    const chargeId = paymentIntent?.latest_charge as string | null;

    const platformFee = Math.round((booking.price_cents * PLATFORM_FEE_BPS) / 10000);
    const providerAmount = booking.price_cents - platformFee;

    await admin
      .from("service_bookings")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        stripe_payment_intent_id: paymentIntent?.id,
        stripe_charge_id: chargeId,
      })
      .eq("id", booking_id);

    await admin.from("service_payouts").upsert(
      {
        provider_id: booking.provider_id,
        booking_id,
        amount_cents: providerAmount,
        platform_fee_cents: platformFee,
        currency: "EUR",
        status: "pending",
      },
      { onConflict: "booking_id" },
    );

    await admin.from("notifications").insert([
      {
        user_id: booking.provider_id,
        type: "service_booking_confirmed",
        title: "New service booking",
        message: `You have a new booking on ${new Date(booking.scheduled_at).toUTCString()}.`,
      },
      {
        user_id: booking.customer_id,
        type: "service_booking_confirmed",
        title: "Booking confirmed",
        message: `Your booking is confirmed for ${new Date(booking.scheduled_at).toUTCString()}.`,
      },
    ]);

    const meta = await fetchMeta();
    return new Response(
      JSON.stringify({
        status: "confirmed",
        booking: { ...booking, status: "confirmed" },
        ...meta,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("verify-service-booking error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
