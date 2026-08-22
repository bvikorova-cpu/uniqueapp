// Cron-friendly: send 24h and 1h in-app reminders for confirmed service bookings.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    // Verify cron invocation via the Supabase anon key (apikey header), the standard pattern for pg_cron.
    const apikey = req.headers.get("apikey");
    if (!apikey || apikey !== Deno.env.get("SUPABASE_ANON_KEY")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }



    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const now = new Date();
    const from24h = new Date(now.getTime() + 23 * 3600 * 1000).toISOString();
    const to24h = new Date(now.getTime() + 25 * 3600 * 1000).toISOString();
    const from1h = new Date(now.getTime() + 30 * 60000).toISOString();
    const to1h = new Date(now.getTime() + 90 * 60000).toISOString();

    const { data: bookings24 } = await admin
      .from("service_bookings")
      .select("id, customer_id, provider_id, scheduled_at, business:service_providers(business_name)")
      .eq("status", "confirmed")
      .gte("scheduled_at", from24h)
      .lte("scheduled_at", to24h);

    const { data: bookings1 } = await admin
      .from("service_bookings")
      .select("id, customer_id, provider_id, scheduled_at, business:service_providers(business_name)")
      .eq("status", "confirmed")
      .gte("scheduled_at", from1h)
      .lte("scheduled_at", to1h);

    const sent: string[] = [];

    for (const b of bookings24 ?? []) {
      const already = await admin.from("service_notification_log").select("id").eq("booking_id", b.id).eq("type", "reminder_24h").maybeSingle();
      if (already.data) continue;
      const when = new Date(b.scheduled_at).toLocaleString();
      const businessName = (b.business as any)?.business_name ?? "Book & Glow";
      await admin.from("notifications").insert([
        { user_id: b.customer_id, type: "service_reminder_24h", title: "Appointment tomorrow", message: `Your booking with ${businessName} is tomorrow (${when}).`, link: "/my-bookings/services" },
        { user_id: b.provider_id, type: "service_reminder_24h", title: "Appointment tomorrow", message: `You have a booking tomorrow at ${when}.`, link: "/services/provider/inbox" },
      ]);
      await admin.from("service_notification_log").insert({ booking_id: b.id, type: "reminder_24h" });
      sent.push(`24h:${b.id}`);
    }

    for (const b of bookings1 ?? []) {
      const already = await admin.from("service_notification_log").select("id").eq("booking_id", b.id).eq("type", "reminder_1h").maybeSingle();
      if (already.data) continue;
      const when = new Date(b.scheduled_at).toLocaleString();
      const businessName = (b.business as any)?.business_name ?? "Book & Glow";
      await admin.from("notifications").insert([
        { user_id: b.customer_id, type: "service_reminder_1h", title: "Appointment in 1 hour", message: `Your booking with ${businessName} is in about 1 hour (${when}).`, link: "/my-bookings/services" },
        { user_id: b.provider_id, type: "service_reminder_1h", title: "Appointment in 1 hour", message: `You have a booking in about 1 hour (${when}).`, link: "/services/provider/inbox" },
      ]);
      await admin.from("service_notification_log").insert({ booking_id: b.id, type: "reminder_1h" });
      sent.push(`1h:${b.id}`);
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("service-send-reminders error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
