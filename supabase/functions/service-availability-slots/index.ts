// Public endpoint: available time slots for a service provider.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { provider_id, from, to } = await req.json();
    if (!provider_id || !from || !to) {
      return new Response(JSON.stringify({ error: "provider_id, from, to required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(+fromDate) || isNaN(+toDate) || toDate <= fromDate) {
      return new Response(JSON.stringify({ error: "invalid date range" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (+toDate - +fromDate > 60 * 24 * 3600 * 1000) {
      return new Response(JSON.stringify({ error: "range too large (max 60 days)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const [profileRes, rulesRes, blocksRes, bookingsRes] = await Promise.all([
      supabase
        .from("service_providers")
        .select("owner_id, duration_min, price_cents, is_accepting_bookings")
        .eq("owner_id", provider_id)
        .maybeSingle(),
      supabase
        .from("service_availability_rules")
        .select("weekday, start_time, end_time, is_active")
        .eq("provider_id", provider_id)
        .eq("is_active", true),
      supabase
        .from("service_availability_blocks")
        .select("starts_at, ends_at")
        .eq("provider_id", provider_id)
        .gte("ends_at", fromDate.toISOString())
        .lte("starts_at", toDate.toISOString()),
      supabase
        .from("service_bookings")
        .select("scheduled_at, duration_minutes, status")
        .eq("provider_id", provider_id)
        .gte("scheduled_at", fromDate.toISOString())
        .lte("scheduled_at", toDate.toISOString())
        .in("status", ["pending_payment", "confirmed"]),
    ]);

    const profile = profileRes.data;
    if (!profile || !profile.is_accepting_bookings) {
      return new Response(JSON.stringify({ slots: [], reason: "not_accepting" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const slotMin = profile.duration_min || 60;
    const rules = rulesRes.data ?? [];
    const blocks = (blocksRes.data ?? []).map((b: any) => ({
      start: new Date(b.starts_at).getTime(),
      end: new Date(b.ends_at).getTime(),
    }));
    const booked = (bookingsRes.data ?? []).map((a: any) => {
      const start = new Date(a.scheduled_at).getTime();
      return { start, end: start + (a.duration_minutes || slotMin) * 60000 };
    });

    const slots: string[] = [];
    const nowMs = Date.now();
    const dayMs = 24 * 3600 * 1000;
    const startDay = new Date(Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate()));
    for (let d = startDay.getTime(); d <= toDate.getTime(); d += dayMs) {
      const day = new Date(d);
      const weekday = day.getUTCDay();
      const dayRules = rules.filter((r: any) => r.weekday === weekday);
      for (const r of dayRules) {
        const [sh, sm] = String(r.start_time).split(":").map(Number);
        const [eh, em] = String(r.end_time).split(":").map(Number);
        const dayStart = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), sh, sm);
        const dayEnd = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), eh, em);
        for (let t = dayStart; t + slotMin * 60000 <= dayEnd; t += slotMin * 60000) {
          if (t < nowMs) continue;
          if (t < fromDate.getTime() || t > toDate.getTime()) continue;
          const slotEnd = t + slotMin * 60000;
          const conflict =
            blocks.some((b) => t < b.end && slotEnd > b.start) ||
            booked.some((b) => t < b.end && slotEnd > b.start);
          if (!conflict) slots.push(new Date(t).toISOString());
        }
      }
    }

    return new Response(
      JSON.stringify({ slots, duration_min: slotMin, price_cents: profile.price_cents }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("service-availability-slots error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
