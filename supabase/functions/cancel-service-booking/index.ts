// Customer or provider cancels a service booking.
// >24h -> full refund; otherwise no refund.
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

    const { booking_id, reason } = await req.json();
    if (!booking_id) throw new Error("booking_id required");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: booking } = await admin
      .from("service_bookings")
      .select("*")
      .eq("id", booking_id)
      .maybeSingle();
    if (!booking) throw new Error("Booking not found");
    const isCustomer = booking.customer_id === user.id;
    const isProvider = booking.provider_id === user.id;
    if (!isCustomer && !isProvider) throw new Error("Not authorized");
    if (!["pending_payment", "confirmed"].includes(booking.status)) {
      throw new Error(`Cannot cancel booking in status ${booking.status}`);
    }

    const hoursUntil = (new Date(booking.scheduled_at).getTime() - Date.now()) / 3600000;
    // Providers cancelling => always full refund; customers >24h => full refund.
    const shouldRefund =
      booking.status === "confirmed" &&
      booking.stripe_payment_intent_id &&
      (isProvider || hoursUntil >= 24);

    let refundAmount: number | null = null;
    if (shouldRefund) {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
        apiVersion: "2025-08-27.basil",
      });
      const refund = await stripe.refunds.create({
        payment_intent: booking.stripe_payment_intent_id,
      });
      refundAmount = refund.amount;
    }

    await admin
      .from("service_bookings")
      .update({
        status: isCustomer ? "cancelled_by_customer" : "cancelled_by_provider",
        cancelled_at: new Date().toISOString(),
        cancelled_by: isCustomer ? "customer" : "provider",
        cancellation_reason: reason ?? null,
        refund_amount_cents: refundAmount,
        refunded_at: refundAmount ? new Date().toISOString() : null,
      })
      .eq("id", booking_id);

    return new Response(
      JSON.stringify({ ok: true, refunded_cents: refundAmount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("cancel-service-booking error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
