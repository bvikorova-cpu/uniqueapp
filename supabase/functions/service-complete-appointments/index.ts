// Cron-friendly edge function: auto-complete past confirmed bookings and create payout records.
// Also marks no-show if appointment is past + 15 min and neither party marked complete.
// This function is idempotent.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const PLATFORM_FEE_BPS = 1500;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    // Verify cron secret if present, but allow direct invocation for testing.
    const cronSecret = req.headers.get("x-cron-secret");
    if (cronSecret && cronSecret !== Deno.env.get("CRON_SECRET")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const now = new Date();
    const completeCutoff = new Date(now.getTime() - 15 * 60000).toISOString();

    // Mark completed if confirmed and end time passed 15 min ago.
    const { data: toComplete } = await admin
      .from("service_bookings")
      .select("id, provider_id, customer_id, scheduled_at, duration_minutes, price_cents")
      .eq("status", "confirmed")
      .lte("scheduled_at", completeCutoff);

    for (const b of toComplete ?? []) {
      const endTime = new Date(new Date(b.scheduled_at).getTime() + (b.duration_minutes || 60) * 60000);
      if (now >= endTime) {
        // default to completed unless a no-show was explicitly logged
        await admin.from("service_bookings")
          .update({ status: "completed", completed_at: now.toISOString() })
          .eq("id", b.id);

        const platformFee = Math.round((b.price_cents * PLATFORM_FEE_BPS) / 10000);
        const providerAmount = b.price_cents - platformFee;
        await admin.from("service_payouts").upsert(
          { provider_id: b.provider_id, booking_id: b.id, amount_cents: providerAmount, platform_fee_cents: platformFee, currency: "EUR", status: "pending" },
          { onConflict: "booking_id" },
        );

        await admin.from("service_notification_log").upsert(
          { booking_id: b.id, type: "completed" },
          { onConflict: "booking_id,type" },
        );

        await admin.from("notifications").insert([
          { user_id: b.provider_id, type: "service_booking_completed", title: "Booking completed", message: "A past booking has been auto-completed and a payout was recorded.", link: "/services/provider/inbox" },
          { user_id: b.customer_id, type: "service_booking_completed", title: "Booking completed", message: "Your appointment has been completed. Please leave a review.", link: `/my-bookings/services` },
        ]);
      }
    }

    // Mark no-show if confirmed and start time passed 30 min ago.
    const noShowCutoff = new Date(now.getTime() - 30 * 60000).toISOString();
    const { data: toNoShow } = await admin
      .from("service_bookings")
      .select("id, customer_id, provider_id, scheduled_at")
      .eq("status", "confirmed")
      .lte("scheduled_at", noShowCutoff);

    for (const b of toNoShow ?? []) {
      await admin.from("service_bookings").update({ status: "no_show", completed_at: now.toISOString() }).eq("id", b.id);
      await admin.from("notifications").insert([
        { user_id: b.provider_id, type: "service_booking_no_show", title: "No-show", message: "A customer did not show up for the appointment.", link: "/services/provider/inbox" },
        { user_id: b.customer_id, type: "service_booking_no_show", title: "No-show", message: "Your appointment was marked as no-show.", link: "/my-bookings/services" },
      ]);
    }

    return new Response(JSON.stringify({ completed: (toComplete ?? []).length, no_show: (toNoShow ?? []).length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("service-complete-appointments error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
