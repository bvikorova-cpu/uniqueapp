import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PARITY_COST = 5;

const ACTIONS: Record<string, { table: string; system: string }> = {
  "tier-designer": { table: "membership_parity_tier_designers", system: "You are a creator-economy strategist. Design 3 membership tiers. Output JSON: { tiers:[{name,price_eur,tagline,perks[],ideal_for}], upsell_path, pricing_rationale }." },
  "post-planner": { table: "membership_parity_post_planners", system: "You are an exclusive content planner. Output JSON: { weekly_calendar:[{day,format,topic,hook,cta}], pillars[], cadence_notes }." },
  "fan-persona": { table: "membership_parity_fan_personas", system: "You are an audience analyst. Output JSON: { superfan{name,age,motivation,objections[]}, casual_fan{...}, channels[], conversion_triggers[] }." },
  "welcome-dm": { table: "membership_parity_welcome_dms", system: "You are an onboarding copywriter. Output JSON: { dm_sequence:[{day,subject,message}], voice_notes, perk_reminders[] }." },
  "retention-booster": { table: "membership_parity_retention_boosters", system: "You are a churn-prevention coach. Output JSON: { at_risk_signals[], save_offers[{trigger,offer,script}], win_back_plays[], loyalty_rewards[] }." },
  "perk-ideas": { table: "membership_parity_perk_ideas", system: "You are a benefits designer. Output JSON: { perks:[{name,description,cost_to_creator,perceived_value}], digital_perks[], irl_perks[], surprise_drops[] }." },
  "livestream-brief": { table: "membership_parity_livestream_briefs", system: "You are a livestream producer. Output JSON: { title, hook, run_of_show:[{minute,segment}], chat_prompts[], cta_moments[], replay_repurpose[] }." },
  "growth-funnel": { table: "membership_parity_growth_funnels", system: "You are a fan acquisition strategist. Output JSON: { awareness_plays[], free_to_paid_funnel:[{step,asset,goal}], content_magnets[], referral_loop }." },
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

    const aiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!aiKey) throw new Error("Missing LOVABLE_API_KEY");
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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
    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
    await supabaseAdmin.from("membership_parity_credits").insert({ user_id: user.id, action, credits_spent: PARITY_COST });

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
