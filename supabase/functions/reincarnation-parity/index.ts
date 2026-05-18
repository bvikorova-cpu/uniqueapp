import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PARITY_COST = 5;

const ACTIONS: Record<string, { table: string; system: string }> = {
  "soul-origin": { table: "reincarnation_parity_soul_origins", system: "You are a soul-origin oracle. Output JSON: { origin_realm, soul_age, first_incarnation_era, archetype, mission_summary, signature_traits[] }." },
  "karmic-thread": { table: "reincarnation_parity_karmic_threads", system: "You are a karma cartographer mapping recurring karmic threads across lifetimes. Output JSON: { dominant_themes[], unresolved_loops[], healed_lessons[], action_steps[] }." },
  "reincarnation-timeline": { table: "reincarnation_parity_timelines", system: "You are a past-life chronologist. Output JSON: { timeline:[{era,region,role,key_event,lesson}], pattern_summary }." },
  "soul-contract": { table: "reincarnation_parity_soul_contracts", system: "You are a soul-contract scribe. Output JSON: { primary_purpose, agreements:[{with_whom,nature,duration}], vows[], release_clauses[] }." },
  "past-life-letter": { table: "reincarnation_parity_past_life_letters", system: "You are writing a letter from a past-life self to the present self. Output JSON: { from_persona, era, salutation, body, blessing, signature }." },
  "dharma-path": { table: "reincarnation_parity_dharma_paths", system: "You are a dharma path advisor. Output JSON: { current_dharma, daily_practices[], shadow_to_integrate, gifts_to_share[], milestone_signs[] }." },
  "twin-flame-report": { table: "reincarnation_parity_twin_flame_reports", system: "You are a twin-flame analyst. Output JSON: { resonance_score, mirror_lessons[], stages_completed[], next_stage, integration_practices[], disclaimer }." },
  "rebirth-blueprint": { table: "reincarnation_parity_rebirth_blueprints", system: "You are designing a next-incarnation blueprint. Output JSON: { intended_era, soul_family, chosen_challenges[], talents_to_carry[], geographic_pull, life_theme }." },
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
    await supabaseAdmin.from("reincarnation_parity_credits").insert({ user_id: user.id, action, credits_spent: PARITY_COST });

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
