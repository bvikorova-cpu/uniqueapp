// Public postback endpoint for Monetag.
// Configure in Monetag dashboard with a URL like:
//   https://<project>.functions.supabase.co/monetag-postback
//     ?event_type={event_type}
//     &zone_id={zone_id}
//     &revenue={revenue}
//     &ymid={ymid}
//     &sub_id={sub_id_5}
//     &country={country_iso}
// We accept GET (query string) or POST (JSON / form).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const qp: Record<string, string> = {};
    url.searchParams.forEach((v, k) => (qp[k] = v));

    let body: Record<string, unknown> = {};
    if (req.method === "POST") {
      const ct = req.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        body = await req.json().catch(() => ({}));
      } else if (ct.includes("application/x-www-form-urlencoded")) {
        const fd = await req.formData();
        fd.forEach((v, k) => (body[k] = String(v)));
      }
    }

    const data = { ...qp, ...(body as Record<string, string>) };

    const eventType = String(data.event_type || data.type || "impression").toLowerCase();
    const zoneId = data.zone_id ? String(data.zone_id) : null;
    const revenueRaw = data.revenue ?? data.payout ?? data.cpm ?? 0;
    const revenue = Number(revenueRaw) || 0;
    const currency = String(data.currency || "USD");
    const ymid = data.ymid ? String(data.ymid) : null;
    const subId = data.sub_id ? String(data.sub_id) : null;
    const country = data.country ? String(data.country) : null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase.from("monetag_ad_events").insert({
      event_type: eventType,
      zone_id: zoneId,
      revenue,
      currency,
      ymid,
      sub_id: subId,
      country,
      raw: data,
    });

    if (error) {
      console.error("monetag-postback insert error", error);
      return new Response(JSON.stringify({ ok: false, error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (e) {
    console.error("monetag-postback fatal", e);
    return new Response("ERR", { status: 200, headers: corsHeaders });
  }
});
