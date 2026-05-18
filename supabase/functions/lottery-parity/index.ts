// Lottery Numbers parity pack router. 8 actions, fixed cost 5 credits each.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PARITY_COST = 5;

const ACTION_TABLE: Record<string, string> = {
  "wheel-builder": "lottery_parity_wheel_builders",
  "syndicate-strategy": "lottery_parity_syndicate_strategies",
  "tax-planner": "lottery_parity_tax_planners",
  "claim-checklist": "lottery_parity_claim_checklists",
  "budget-coach": "lottery_parity_budget_coaches",
  "lucky-charm": "lottery_parity_lucky_charms",
  "pattern-detector": "lottery_parity_pattern_detectors",
  "winner-mindset": "lottery_parity_winner_mindsets",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  "wheel-builder": `You are a lottery wheeling-system designer. Return ONLY JSON: {"system_name":"string","key_numbers":[int],"combinations":[[int]],"coverage":"plain language description","tickets_needed":number,"estimated_cost_eur":"approx range","strategy_notes":"2-3 sentences"}. Produce 6-10 combinations.`,
  "syndicate-strategy": `You are a lottery syndicate organizer. Return ONLY JSON: {"group_size":number,"weekly_contribution_eur":number,"play_pattern":"string","split_rules":"how winnings are split","legal_tips":["..."],"trust_setup":["..."],"sample_message":"recruiting message"}. Produce 4-6 legal tips and 4-6 trust setup steps.`,
  "tax-planner": `You are a winnings tax planner. Return ONLY JSON: {"jurisdiction":"string","gross_win_eur":number,"estimated_tax_eur":number,"net_after_tax_eur":number,"reporting_steps":["..."],"lump_vs_annuity":"comparison paragraph","red_flags":["..."]}. Produce 4-6 reporting steps and 3-5 red flags. ALWAYS remind user to consult a licensed tax advisor.`,
  "claim-checklist": `You are a prize claim safety coach. Return ONLY JSON: {"first_24_hours":["..."],"documents":["..."],"security_steps":["..."],"common_scams":["..."],"public_vs_anonymous":"2-3 sentences","timeline":"plain language"}. Produce 5-7 items per array.`,
  "budget-coach": `You are a responsible play budget coach. Return ONLY JSON: {"monthly_cap_eur":number,"weekly_cap_eur":number,"rules":["..."],"warning_signs":["..."],"alternatives":["..."],"helpline":"region-appropriate problem gambling helpline"}. Produce 5-7 rules, 4-6 warning signs, and 3-5 alternatives. Always promote responsible play.`,
  "lucky-charm": `You are a personalized lucky number designer. Use the user's name, birthdate, and meaningful dates. Return ONLY JSON: {"primary_numbers":[int],"backup_numbers":[int],"meaning":[{"number":int,"why":"string"}],"ritual":"2-3 sentence pre-play ritual","best_day":"string"}. Produce 6 primary and 4 backup numbers.`,
  "pattern-detector": `You are a lottery pattern analyst. Return ONLY JSON: {"hot_numbers":[int],"cold_numbers":[int],"overdue_numbers":[int],"detected_patterns":["..."],"avoid_combinations":["..."],"caveat":"randomness disclaimer"}. Produce 5-8 numbers per array and 4-6 patterns.`,
  "winner-mindset": `You are a winner psychology coach. Return ONLY JSON: {"pre_play_mindset":"paragraph","loss_resilience":["..."],"win_protocol":["..."],"family_communication":"paragraph","long_term_plan":["..."]}. Produce 5-7 items per array.`,
};

interface Body { action: string; payload?: Record<string, unknown>; }

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const token = authHeader.replace("Bearer ", "");
    const auth = createClient(supabaseUrl, anonKey);
    const { data: userData, error: userErr } = await auth.auth.getUser(token);
    if (userErr || !userData.user) return json({ error: "Not authenticated" }, 401);
    const user = userData.user;

    const body = (await req.json().catch(() => ({}))) as Partial<Body>;
    const action = body.action ?? "";
    const table = ACTION_TABLE[action];
    const systemPrompt = SYSTEM_PROMPTS[action];
    if (!table || !systemPrompt) return json({ error: "Unknown action" }, 400);
    if (!openaiKey) return json({ error: "OPENAI_API_KEY not configured" }, 500);

    const admin = createClient(supabaseUrl, serviceKey);

    await admin
      .from("lottery_parity_credits")
      .upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });

    const { data: creditsRow } = await admin
      .from("lottery_parity_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const balance = creditsRow?.credits_remaining ?? 0;
    if (balance < PARITY_COST) {
      return json({ requiresPayment: true, error: "Insufficient credits", needed: PARITY_COST, balance }, 402);
    }

    const payload = body.payload ?? {};
    const userPrompt = `Generate the requested output.\n\nUser context:\n${JSON.stringify(payload, null, 2)}`;

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI error", aiResp.status, errText);
      if (aiResp.status === 429) return json({ error: "Rate limited" }, 429);
      if (aiResp.status === 402) return json({ error: "AI credits exhausted" }, 402);
      return json({ error: "AI request failed" }, 500);
    }

    const aiData = await aiResp.json();
    const content = aiData.choices?.[0]?.message?.content ?? "{}";
    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(content); }
    catch { return json({ error: "AI returned malformed JSON" }, 500); }

    const { data: inserted, error: insertErr } = await admin
      .from(table)
      .insert({ user_id: user.id, credits_used: PARITY_COST, input: payload, result: parsed })
      .select()
      .single();

    if (insertErr) {
      console.error("Insert failed", insertErr);
      return json({ error: "Failed to save result" }, 500);
    }

    await admin
      .from("lottery_parity_credits")
      .update({ credits_remaining: balance - PARITY_COST, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return json({ success: true, result: inserted, creditsRemaining: balance - PARITY_COST }, 200);
  } catch (e) {
    console.error("Unhandled error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}
