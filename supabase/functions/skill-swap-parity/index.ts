// Global Skill Swap parity pack router.
// 8 actions, fixed cost 6 credits each, deducted from skill_swap_credits.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PARITY_COST = 6;

const ACTION_TABLE: Record<string, string> = {
  "swap-matcher": "skill_swap_swap_matchers",
  "learning-roadmap": "skill_swap_learning_roadmaps",
  "teaching-script": "skill_swap_teaching_scripts",
  "gap-analysis": "skill_swap_gap_analyses",
  "negotiation-helper": "skill_swap_negotiation_helpers",
  "portfolio-pitch": "skill_swap_portfolio_pitches",
  "cultural-tips": "skill_swap_cultural_tips",
  "certification-path": "skill_swap_certification_paths",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  "swap-matcher": `You are a global skill swap matcher. Return ONLY JSON: {"matches":[{"persona":"realistic stranger profile","offers":"skill they teach","wants":"skill they want","timezone":"string","fit_score":1-100,"opening_message":"2-3 sentence ice-breaker"}],"strategy":"2 paragraph overall match strategy"}. Produce 4-6 matches.`,
  "learning-roadmap": `You are a personalized learning architect. Return ONLY JSON: {"weeks":[{"week":1-4,"theme":"string","milestones":["..."],"daily_practice":"specific 20-30 min task","resource":"book/course/channel"}],"final_project":"capstone description"}. Produce exactly 4 weeks.`,
  "teaching-script": `You are a master teacher. Return ONLY JSON: {"lesson_title":"string","objectives":["..."],"sections":[{"title":"string","duration_minutes":number,"talking_points":["..."],"demo":"string"}],"homework":"actionable assignment","assessment":"how to evaluate progress"}. Produce 4-6 sections.`,
  "gap-analysis": `You are a candid skills auditor. Return ONLY JSON: {"current_level":"beginner|intermediate|advanced|expert","target_level":"string","gaps":[{"area":"string","severity":1-10,"fix":"specific action"}],"estimated_weeks":number,"priority_order":["..."]}. Produce 4-7 gaps.`,
  "negotiation-helper": `You are a fair-exchange negotiator. Return ONLY JSON: {"proposal":"3-4 sentence opening proposal","value_breakdown":[{"side":"you|partner","contribution":"string","hours_per_week":number}],"counter_offers":["...","..."],"red_flags":["..."]}. Produce 3 counter offers and 3 red flags.`,
  "portfolio-pitch": `You are a personal-brand copywriter. Return ONLY JSON: {"headline":"max 12 words","elevator_pitch":"60-80 word paragraph","proof_points":["..."],"call_to_action":"single sentence","hashtags":["#..."]}. Produce 4-6 proof points and 4-6 hashtags.`,
  "cultural-tips": `You are a cross-cultural etiquette coach. Return ONLY JSON: {"country":"string","greeting":"how to greet","do":["..."],"avoid":["..."],"communication_style":"2-3 sentences","scheduling_tip":"timezone or meeting-time advice"}. Produce 4-6 dos and 4-6 avoids.`,
  "certification-path": `You are a credentials curator. Return ONLY JSON: {"badges":[{"name":"real certification or badge","issuer":"string","level":"entry|intermediate|advanced","cost_eur":"approx range","time_weeks":number,"why_it_matters":"1 sentence"}],"sequence_advice":"2-3 sentences on order"}. Produce 4-6 badges.`,
};

interface Body {
  action: string;
  payload?: Record<string, unknown>;
}

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

    // ensure row exists
    await admin
      .from("skill_swap_credits")
      .upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });

    const { data: creditsRow } = await admin
      .from("skill_swap_credits")
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
    try {
      parsed = JSON.parse(content);
    } catch {
      return json({ error: "AI returned malformed JSON" }, 500);
    }

    const { data: inserted, error: insertErr } = await admin
      .from(table)
      .insert({
        user_id: user.id,
        credits_used: PARITY_COST,
        input: payload,
        result: parsed,
      })
      .select()
      .single();

    if (insertErr) {
      console.error("Insert failed", insertErr);
      return json({ error: "Failed to save result" }, 500);
    }

    await admin
      .from("skill_swap_credits")
      .update({ credits_remaining: balance - PARITY_COST, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return json({
      success: true,
      result: inserted,
      creditsRemaining: balance - PARITY_COST,
    }, 200);
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
