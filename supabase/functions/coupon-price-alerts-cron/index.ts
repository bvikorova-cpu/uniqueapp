import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Pull active alerts (not notified in last 12h)
    const cutoff = new Date(Date.now() - 12 * 3600 * 1000).toISOString();
    const { data: alerts } = await supabase
      .from("coupon_price_alerts")
      .select("id, user_id, store_name, max_price, min_discount_pct, last_notified_at")
      .eq("is_active", true);

    if (!alerts?.length) return new Response(JSON.stringify({ checked: 0, sent: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    let sent = 0;
    for (const a of alerts) {
      if (a.last_notified_at && a.last_notified_at > cutoff) continue;

      const { data: matches } = await supabase
        .from("coupon_listings")
        .select("id, title, store_name, original_value, selling_price")
        .eq("is_sold", false)
        .ilike("store_name", a.store_name)
        .lte("selling_price", a.max_price)
        .limit(3);

      const hits = (matches || []).filter((m: any) => {
        const disc = ((m.original_value - m.selling_price) / m.original_value) * 100;
        return disc >= (a.min_discount_pct || 0);
      });

      if (hits.length === 0) continue;

      await supabase.from("notifications").insert({
        user_id: a.user_id,
        type: "coupon_price_drop",
        title: `Price drop: ${a.store_name}`,
        message: `${hits.length} new listing(s) under €${a.max_price}. Lowest: €${Math.min(...hits.map((h: any) => h.selling_price)).toFixed(2)}.`,
        action_url: `/coupons/${a.store_name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        is_read: false,
      });

      await supabase.from("coupon_price_alerts").update({ last_notified_at: new Date().toISOString() }).eq("id", a.id);
      sent++;
    }

    return new Response(JSON.stringify({ checked: alerts.length, sent }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("price-alerts error", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
