import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PARITY_COST = 5;

const ACTIONS: Record<string, { table: string; system: string }> = {
  "ancestral-storyteller": { table: "dna_parity_ancestral_stories", system: "You are a heritage storyteller reconstructing ancestral narratives from genetic and historical context. Output JSON: { ancestor_name, era, region, life_story, key_moments[{year,event}], emotional_themes[], dna_threads[] }." },
  "heritage-map": { table: "dna_parity_heritage_maps", system: "You are a population geneticist mapping ancestral migrations. Output JSON: { haplogroup_overview, migrations:[{from,to,approx_year,notes}], modern_regions[], cultural_legacies[] }." },
  "genetic-compatibility": { table: "dna_parity_compatibility_reports", system: "You are a genetic compatibility analyst. Output JSON: { compatibility_score, strengths[], risk_flags[], lifestyle_alignment, recommendations[], disclaimer }." },
  "offspring-predictor": { table: "dna_parity_offspring_predictions", system: "You are a trait-inheritance simulator. Output JSON: { likely_traits:[{trait,probability,parent_source}], personality_blend, health_considerations[], creative_potential, disclaimer }." },
  "health-blueprint": { table: "dna_parity_health_blueprints", system: "You are a precision-wellness coach (non-medical). Output JSON: { nutrition_focus[], movement_plan[], sleep_protocol, stress_resilience[], screening_suggestions[], disclaimer }." },
  "dna-art-prompt": { table: "dna_parity_art_prompts", system: "You are a generative art director translating genetic profiles into visual prompts. Output JSON: { title, palette[], composition, motifs[], style_keywords[], prompt_text }." },
  "ancestor-voice-script": { table: "dna_parity_voice_scripts", system: "You are a dramaturg writing first-person monologues for an ancestor voice synth. Output JSON: { ancestor_persona, language_hint, monologue, pacing_notes, emotional_arc[], pronunciation_tips[] }." },
  "family-tree-narrative": { table: "dna_parity_tree_narratives", system: "You are a genealogist writing rich biographies for family tree nodes. Output JSON: { person_summary, birth_context, life_highlights[], relationships[], legacy, sources_hint[] }." },
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
    await supabaseAdmin.from("dna_parity_credits").insert({ user_id: user.id, action, credits_spent: PARITY_COST });

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
