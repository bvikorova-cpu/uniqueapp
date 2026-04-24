// Updates brand stock prices based on votes activity. Public read; called by cron or on vote.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: prices } = await admin.from("brand_stock_prices").select("*, brand:brand_sponsors(total_votes)");
    if (!prices) throw new Error("No prices");

    const updates: any[] = [];
    const history: any[] = [];

    for (const p of prices as any[]) {
      const totalVotes = p.brand?.total_votes ?? 0;
      // Simulate movement: trend toward votes-derived value with noise
      const target = 100 + totalVotes * 0.5;
      const drift = (target - p.current_price) * 0.05;
      const noise = (Math.random() - 0.5) * 8;
      const newPrice = Math.max(10, p.current_price + drift + noise);
      const change = ((newPrice - p.open_price) / p.open_price) * 100;

      updates.push({
        id: p.id,
        current_price: Number(newPrice.toFixed(2)),
        high_24h: Math.max(p.high_24h, newPrice),
        low_24h: Math.min(p.low_24h, newPrice),
        change_24h: Number(change.toFixed(4)),
        volume_24h: p.volume_24h + Math.floor(Math.random() * 50),
        updated_at: new Date().toISOString(),
      });
      history.push({ brand_id: p.brand_id, price: Number(newPrice.toFixed(2)) });
    }

    for (const u of updates) {
      await admin.from("brand_stock_prices").update({
        current_price: u.current_price,
        high_24h: u.high_24h,
        low_24h: u.low_24h,
        change_24h: u.change_24h,
        volume_24h: u.volume_24h,
        updated_at: u.updated_at,
      }).eq("id", u.id);
    }
    if (history.length) await admin.from("brand_stock_history").insert(history);

    return new Response(JSON.stringify({ success: true, ticked: updates.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("stock-tick error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
