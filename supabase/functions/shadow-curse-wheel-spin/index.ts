import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRIZES = [
  { type: "credits", value: 5, label: "+5 Cursed Credits", weight: 30 },
  { type: "credits", value: 10, label: "+10 Cursed Credits", weight: 20 },
  { type: "credits", value: 20, label: "+20 Cursed Credits", weight: 10 },
  { type: "credits", value: 50, label: "+50 Cursed Credits — JACKPOT!", weight: 2 },
  { type: "multiplier", value: 2, label: "2x Vote Multiplier (24h)", weight: 15 },
  { type: "badge", value: 1, label: "Lucky Spirit Badge", weight: 8 },
  { type: "nothing", value: 0, label: "The shadows took your luck...", weight: 15 },
];

function pickPrize() {
  const total = PRIZES.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of PRIZES) {
    if ((r -= p.weight) <= 0) return p;
  }
  return PRIZES[0];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const auth = req.headers.get("Authorization");
    if (!auth) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: { user } } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // One free spin per day
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    const { data: existing } = await admin
      .from("shadow_curse_wheel_spins")
      .select("id")
      .eq("user_id", user.id)
      .gte("spun_at", today.toISOString())
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ error: "Already spun today. Come back tomorrow." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prize = pickPrize();
    await admin.from("shadow_curse_wheel_spins").insert({
      user_id: user.id,
      prize_type: prize.type,
      prize_value: prize.value,
      prize_label: prize.label,
    });

    // Award credits if won
    if (prize.type === "credits" && prize.value > 0) {
      const { data: cur } = await admin.from("shadow_arena_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
      const newBalance = (cur?.credits_remaining || 0) + prize.value;
      await admin.from("shadow_arena_credits").upsert({ user_id: user.id, credits_remaining: newBalance });
    }

    if (prize.type === "badge") {
      await admin.from("shadow_cursed_achievements").insert({
        user_id: user.id,
        achievement_code: "lucky_spirit",
        achievement_name: "Lucky Spirit",
        rarity: "rare",
      }).then(() => {}, () => {});
    }

    return new Response(JSON.stringify({ prize }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
