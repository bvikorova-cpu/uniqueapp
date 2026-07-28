import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

// Must stay in sync with the wheel rendered on the client (same order!)
const SEGMENTS = [
  { label: "5 Credits", value: 5, type: null, rarity: "common", weight: 25 },
  { label: "10 Credits", value: 10, type: null, rarity: "common", weight: 25 },
  { label: "25 Credits", value: 25, type: null, rarity: "uncommon", weight: 15 },
  { label: "50 Credits", value: 50, type: null, rarity: "rare", weight: 8 },
  { label: "2× Power-up", value: 0, type: "powerup", rarity: "uncommon", weight: 15 },
  { label: "15 Credits", value: 15, type: null, rarity: "common", weight: 25 },
  { label: "100 Credits", value: 100, type: null, rarity: "legendary", weight: 2 },
  { label: "+30s Power-up", value: 0, type: "time_powerup", rarity: "rare", weight: 8 },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) throw new Error("Unauthorized");

    const today = new Date().toISOString().split("T")[0];

    const { data: existing } = await supabase
      .from("brain_duel_daily_spins")
      .select("id")
      .eq("user_id", user.id)
      .eq("spin_date", today)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: "already_spun" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Server-side weighted pick — the client cannot influence the outcome.
    const total = SEGMENTS.reduce((a, s) => a + s.weight, 0);
    let r = Math.random() * total;
    let index = 0;
    for (let i = 0; i < SEGMENTS.length; i++) {
      r -= SEGMENTS[i].weight;
      if (r <= 0) { index = i; break; }
    }
    const selected = SEGMENTS[index];

    const { error: insertErr } = await supabase.from("brain_duel_daily_spins").insert({
      user_id: user.id,
      spin_date: today,
      reward_type: selected.type || "credits",
      reward_value: selected.value,
      reward_label: selected.label });
    if (insertErr) {
      return new Response(JSON.stringify({ error: "already_spun" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let newBalance: number | null = null;
    if (!selected.type && selected.value > 0) {
      const { data: credits } = await supabase
        .from("brain_duel_credits")
        .select("credits")
        .eq("user_id", user.id)
        .maybeSingle();

      if (credits) {
        newBalance = credits.credits + selected.value;
        await supabase.from("brain_duel_credits").update({ credits: newBalance }).eq("user_id", user.id);
      } else {
        newBalance = 100 + selected.value;
        await supabase.from("brain_duel_credits").insert({ user_id: user.id, credits: newBalance });
      }
    }

    return new Response(JSON.stringify({ index, reward: selected, balance: newBalance }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("brain-duel-daily-spin error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
