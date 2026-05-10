// Coupon digest cron — runs daily, creates in-app notifications for users with active price alerts or wishlist matches.
// No external email yet (uses existing notifications system to avoid email-infra dependency).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Top hot deals today
    const { data: hot } = await supabase.rpc("coupon_top_hot" as any, { p_limit: 5 });
    const hotIds = ((hot as any) || []).map((r: any) => r.id);
    if (hotIds.length === 0) return new Response(JSON.stringify({ sent: 0, reason: "no hot deals" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: hotCoupons } = await supabase.from("coupon_listings")
      .select("id, title, store_name, selling_price, original_value")
      .in("id", hotIds);

    // Active price-alert users
    const { data: alerts } = await supabase.from("coupon_price_alerts")
      .select("user_id, store_name, max_price").eq("is_active", true);

    const notifsToInsert: any[] = [];
    const sentSet = new Set<string>();

    for (const a of (alerts as any[]) || []) {
      const matches = ((hotCoupons as any[]) || []).filter(c =>
        c.store_name?.toLowerCase().includes(String(a.store_name).toLowerCase()) &&
        Number(c.selling_price) <= Number(a.max_price)
      );
      if (matches.length === 0) continue;
      const key = `${a.user_id}-digest-${new Date().toISOString().slice(0, 10)}`;
      if (sentSet.has(key)) continue;
      sentSet.add(key);
      notifsToInsert.push({
        user_id: a.user_id,
        type: "coupon_digest",
        title: `🔥 ${matches.length} new deal(s) match your alerts`,
        message: matches.slice(0, 3).map(m => `${m.store_name} — €${Number(m.selling_price).toFixed(2)}`).join(" · "),
        link: "/coupon-marketplace",
        is_read: false,
      });
    }

    if (notifsToInsert.length > 0) {
      await supabase.from("notifications").insert(notifsToInsert);
    }

    return new Response(JSON.stringify({ sent: notifsToInsert.length, hot_count: hotCoupons?.length ?? 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
