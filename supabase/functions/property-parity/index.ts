import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PARITY_COST = 5;

const ACTIONS: Record<string, { table: string; system: string }> = {
  "listing-optimizer": { table: "property_parity_listing_optimizers", system: "You are an elite real-estate copywriter. Output JSON: { headline, hero_description, bullet_features[], seo_keywords[], hook_line }." },
  "pricing-strategy": { table: "property_parity_pricing_strategies", system: "You are a property pricing strategist. Output JSON: { suggested_price_eur, range_low_eur, range_high_eur, rationale, comparable_factors[], market_signals[] }." },
  "buyer-persona": { table: "property_parity_buyer_personas", system: "You are a real-estate marketing analyst. Output JSON: { primary_persona{name,age,income,lifestyle}, secondary_persona{...}, channels[], messaging_angles[] }." },
  "negotiation-coach": { table: "property_parity_negotiation_coaches", system: "You are a real-estate negotiation coach. Output JSON: { opening_script, counter_offers[], red_flags[], walk_away_price_eur, closing_lines[] }." },
  "staging-brief": { table: "property_parity_staging_briefs", system: "You are an interior staging director. Output JSON: { room_briefs[{room,changes[],budget_eur}], palette[], styling_themes[], photo_shot_list[] }." },
  "neighborhood-pitch": { table: "property_parity_neighborhood_pitches", system: "You are a neighborhood storyteller for buyers. Output JSON: { headline, lifestyle_pitch, amenities[], commute_notes, school_notes, hidden_gems[] }." },
  "rental-yield": { table: "property_parity_rental_yields", system: "You are a rental investment analyst. Output JSON: { monthly_rent_eur, gross_yield_pct, net_yield_pct, occupancy_assumption_pct, expenses_breakdown{}, payback_years, verdict }." },
  "legal-checklist": { table: "property_parity_legal_checklists", system: "You are a real-estate transaction lawyer. Output JSON: { documents[], steps[{name,who,timeline}], typical_fees_eur{}, common_pitfalls[] }. Generic guidance — not legal advice." },
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

    // Check credits
    const { data: credits } = await supabaseAdmin
      .from("property_parity_credits")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();
    const balance = credits?.balance ?? 0;
    if (balance < PARITY_COST) {
      return new Response(JSON.stringify({ requiresPayment: true, cost: PARITY_COST, balance }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Call AI
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
    if (!aiRes.ok) {
      const t = await aiRes.text();
      return new Response(JSON.stringify({ error: "AI failed", detail: t }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const aiJson = await aiRes.json();
    const content = aiJson?.choices?.[0]?.message?.content ?? "{}";
    let result: any = {};
    try { result = JSON.parse(content); } catch { result = { raw: content }; }

    // Persist + deduct
    await supabaseAdmin.from(cfg.table).insert({ user_id: user.id, input: payload ?? {}, result });
    await supabaseAdmin
      .from("property_parity_credits")
      .upsert({ user_id: user.id, balance: balance - PARITY_COST, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

    return new Response(JSON.stringify({ result, cost: PARITY_COST, balance: balance - PARITY_COST }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
