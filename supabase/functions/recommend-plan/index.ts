import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIER_PRICE: Record<string, number> = { basic: 999, premium: 1999, business: 4999 };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );
    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("Unauthorized");
    const { data: u } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (!u.user) throw new Error("Unauthorized");
    const userId = u.user.id;

    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const [aiUsage, listings, currentSub] = await Promise.all([
      supabase.from("ai_usage_history").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", since),
      supabase.from("bazaar_items").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", since),
      supabase.from("subscriptions").select("tier").eq("user_id", userId).eq("status", "active").maybeSingle(),
    ]);

    const aiCount = aiUsage.count ?? 0;
    const listCount = listings.count ?? 0;
    const tier = currentSub.data?.tier ?? "basic";

    let recommended = tier;
    let rationale = "Your current plan fits your usage.";
    let savings = 0;

    if (tier === "basic" && (aiCount > 15 || listCount > 4)) {
      recommended = "premium";
      rationale = `You used ${aiCount} AI generations and ${listCount} listings — Premium removes limits and saves overage costs.`;
      savings = 0;
    } else if (tier === "premium" && aiCount < 5 && listCount < 3) {
      recommended = "basic";
      rationale = `Light usage (${aiCount} AI, ${listCount} listings) — Basic covers you and saves €10/mo.`;
      savings = TIER_PRICE.premium - TIER_PRICE.basic;
    } else if (tier === "premium" && aiCount > 40) {
      recommended = "business";
      rationale = `Heavy usage (${aiCount} AI generations) — Business unlocks unlimited generations and team seats.`;
    }

    await supabase.from("plan_recommendations").upsert({
      user_id: userId,
      recommended_tier: recommended,
      rationale,
      monthly_savings_cents: savings,
      computed_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    return Response.json({ recommended_tier: recommended, current_tier: tier, rationale, monthly_savings_cents: savings, ai_usage_30d: aiCount, listings_30d: listCount }, { headers: corsHeaders });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 400, headers: corsHeaders });
  }
});
