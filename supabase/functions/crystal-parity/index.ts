import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PARITY_COST = 5;

const ACTIONS: Record<string, { table: string; system: string }> = {
  "birth-chart-crystals": { table: "crystal_parity_birth_chart_crystals", system: "You are an astro-crystal guide. Output JSON: { sun_sign_crystal, moon_sign_crystal, rising_crystal, daily_carry[], ritual_use, warnings[] }." },
  "ritual-designer": { table: "crystal_parity_ritual_designers", system: "You are a sacred ritual designer. Output JSON: { ritual_name, intention, crystals[], steps:[{order,action,duration_min}], closing, best_moon_phase }." },
  "grid-layout": { table: "crystal_parity_grid_layouts", system: "You are a crystal grid master. Output JSON: { grid_name, sacred_geometry, center_stone, surrounding_stones[], activation_script, duration_days, charging_tips[] }." },
  "dream-decoder": { table: "crystal_parity_dream_decoders", system: "You are a dream interpreter using crystal symbolism. Output JSON: { symbols:[{symbol,meaning}], emotional_themes[], guidance, recommended_crystals[], journal_prompts[] }." },
  "affirmation-pack": { table: "crystal_parity_affirmation_packs", system: "You are an affirmation copywriter. Output JSON: { crystal, theme, morning_affirmations[], evening_affirmations[], shadow_release[], 7_day_plan[{day,focus,affirmation}] }." },
  "intention-setter": { table: "crystal_parity_intention_setters", system: "You are a manifestation coach. Output JSON: { core_intention, supporting_crystals[], ritual_steps[], integration_practices[], release_phrase, review_date_days }." },
  "aura-color-coach": { table: "crystal_parity_aura_color_coaches", system: "You are an aura color expert. Output JSON: { dominant_color, color_meaning, balance_assessment, cleansing_crystals[], strengthening_crystals[], daily_practice }." },
  "space-clearing": { table: "crystal_parity_space_clearings", system: "You are a space-clearing practitioner. Output JSON: { room_assessments[{room,energy,fix}], crystal_placement[{location,crystal,purpose}], cleansing_sequence[], maintenance_cadence }." },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: userData } = await supabaseAnon.auth.getUser();
    const user = userData?.user;
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { action, payload } = await req.json();
    const cfg = ACTIONS[action];
    if (!cfg) return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("Missing OPENAI_API_KEY");

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: cfg.system + " Reply ONLY with valid JSON." },
          { role: "user", content: JSON.stringify(payload ?? {}) },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!aiRes.ok) {
      const t = await aiRes.text();
      return new Response(JSON.stringify({ error: "AI failed", detail: t }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const aiJson = await aiRes.json();
    const content = aiJson?.choices?.[0]?.message?.content ?? "{}";
    let result: any = {};
    try { result = JSON.parse(content); } catch { result = { raw: content }; }

    await supabaseAdmin.from(cfg.table).insert({ user_id: user.id, input: payload ?? {}, result });
    await supabaseAdmin.from("crystal_parity_credits").insert({ user_id: user.id, action, credits_spent: PARITY_COST });

    return new Response(JSON.stringify({ result, cost: PARITY_COST }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
