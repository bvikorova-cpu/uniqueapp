// Provider action on a booking: confirm, cancel, complete, no-show.
// Body: { booking_id, action: 'confirm'|'cancel'|'complete'|'no_show', reason?: string }
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

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

    const { booking_id, action, reason } = await req.json();
    if (!booking_id || !action) throw new Error("booking_id and action required");
    const allowed = ["confirm", "cancel", "complete", "no_show"];
    if (!allowed.includes(action)) throw new Error("Invalid action");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: booking } = await admin
      .from("service_bookings")
      .select("id, provider_id, customer_id, scheduled_at, status, price_cents, stripe_payment_intent_id")
      .eq("id", booking_id)
      .maybeSingle();
    if (!booking) throw new Error("Booking not found");
    if (booking.provider_id !== user.id) throw new Error("Not authorized");

    const now = new Date().toISOString();
    let status = booking.status;
    let update: any = {};

    if (action === "confirm") {
      if (!["pending_payment"].includes(booking.status)) throw new Error("Only pending payment bookings can be confirmed manually");
      status = "confirmed";
      update = { status, confirmed_at: now };
    } else if (action === "cancel") {
      if (!["pending_payment", "confirmed"].includes(booking.status)) throw new Error("Cannot cancel this booking");
      status = "cancelled_by_provider";
      update = { status, cancelled_at: now, cancelled_by: "provider", cancellation_reason: reason ?? null };
    } else if (action === "complete") {
      if (!["confirmed"].includes(booking.status)) throw new Error("Only confirmed bookings can be completed");
      status = "completed";
      update = { status, completed_at: now };
    } else if (action === "no_show") {
      if (!["confirmed"].includes(booking.status)) throw new Error("Only confirmed bookings can be marked no-show");
      status = "no_show";
      update = { status, completed_at: now };
    }

    const { error } = await admin.from("service_bookings").update(update).eq("id", booking_id);
    if (error) throw new Error(error.message);

    const messages: Record<string, { title: string; message: string }> = {
      confirm: { title: "Booking confirmed", message: "The provider has confirmed your booking." },
      cancel: { title: "Booking cancelled", message: "The provider has cancelled your booking." },
      complete: { title: "Booking completed", message: "Your booking has been marked as completed." },
      no_show: { title: "No-show", message: "Your booking was marked as no-show." },
    };
    await admin.from("notifications").insert({
      user_id: booking.customer_id,
      type: "service_booking_action",
      title: messages[action].title,
      message: messages[action].message,
      link: `/my-bookings/services`,
    });

    return new Response(JSON.stringify({ ok: true, status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("service-booking-action error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
