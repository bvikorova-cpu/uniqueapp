// Anonymous Date AI - 7 paid AI features via OpenAI
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Feature =
  | "icebreakers"      // 3 cr
  | "compatibility"    // 5 cr
  | "reply_coach"      // 2 cr
  | "personality_mirror" // 8 cr
  | "voice_preview"    // 10 cr
  | "date_ideas"       // 5 cr
  | "love_letter"      // 15 cr
  | "daily_question"   // 5 cr
  | "conversation_coach" // 10 cr
  | "vibe_decoder"
  | "chemistry_report"
  | "red_flag_scan"
  | "reveal_readiness"
  | "first_meet_plan"
  | "attachment_profile"
  | "chat_translator"
  | "breakup_recovery";

const PARITY_COST = 6;
const COSTS: Record<Feature, number> = {
  icebreakers: 3,
  compatibility: 5,
  reply_coach: 2,
  personality_mirror: 8,
  voice_preview: 10,
  date_ideas: 5,
  love_letter: 15,
  daily_question: 5,
  conversation_coach: 10,
  vibe_decoder: PARITY_COST,
  chemistry_report: PARITY_COST,
  red_flag_scan: PARITY_COST,
  reveal_readiness: PARITY_COST,
  first_meet_plan: PARITY_COST,
  attachment_profile: PARITY_COST,
  chat_translator: PARITY_COST,
  breakup_recovery: PARITY_COST,
};

const PARITY_TABLES: Record<string, string> = {
  vibe_decoder: "anon_date_vibe_decoder",
  chemistry_report: "anon_date_chemistry_reports",
  red_flag_scan: "anon_date_red_flag_scans",
  reveal_readiness: "anon_date_reveal_readiness",
  first_meet_plan: "anon_date_first_meet_plans",
  attachment_profile: "anon_date_attachment_profiles",
  chat_translator: "anon_date_chat_translator",
  breakup_recovery: "anon_date_breakup_recovery",
};

const SYSTEM_PROMPTS: Record<Feature, string> = {
  icebreakers:
    "You are a witty, warm dating coach. Generate exactly 3 unique, personalised icebreaker questions/lines (max 22 words each) that fit BOTH users' interests and personality traits. Mix tones: playful, deep, flirty. Output ONLY a JSON array of 3 strings.",
  compatibility:
    "You are a relationship psychologist. Analyse two anonymous dating profiles and return a JSON object: { score: number 0-100, summary: 1-sentence verdict, strengths: [3 short bullets], watch_outs: [2 short bullets], best_topic: short string }. Be honest, not flattering.",
  reply_coach:
    "You are a dating chat coach. Given the last message from the match and context, suggest exactly 3 reply options. Output JSON array of 3 objects: { tone: 'flirty'|'playful'|'sincere', text: string max 30 words }.",
  personality_mirror:
    "You are a personality analyst. Based on the user's chat messages and profile, write a deep, warm 'personality mirror' (180-240 words) describing how they likely come across to their match — strengths, vibe, hidden depths. Use second person ('you'). Plain prose, no markdown headers.",
  voice_preview:
    "You write a 2-3 sentence (max 35 words) intimate, anonymous voice-note script in the user's vibe. Mysterious, warm, no name reveal. Output ONLY the script text.",
  date_ideas:
    "You are a creative date planner. Suggest 5 first-date ideas tailored to shared interests. Output JSON array of 5 objects: { title: string, vibe: string, why_it_works: 1 sentence, est_cost: '€'|'€€'|'€€€' }.",
  love_letter:
    "You write a heartfelt, anonymous love letter (200-280 words) from the user to their 7-day match — personality-based, never about looks. Poetic but genuine. Sign with the user's anonymous_name only. Plain prose.",
  daily_question:
    "You generate one thought-provoking daily question for an anonymous dating couple. The question must reveal personality without revealing identity. Mix categories: childhood, dreams, fears, weird preferences, hot takes, hypotheticals. Max 20 words. Output JSON: { question: string, category: string }.",
  conversation_coach:
    "You are a dating conversation coach. Analyse the chat history between two anonymous people and give actionable advice. Output JSON: { health_score: 0-100, vibe_summary: 1 sentence, what_is_working: [2 bullets], what_to_improve: [2 bullets], next_move: 1 concrete suggestion (max 25 words), red_flags: [] or [1-2 short strings] }.",
  vibe_decoder:
    "You decode the overall 'vibe' of a chat. Output JSON: { vibe_label: 2-3 word label, vibe_score: 0-100, energy: { warmth:0-100, curiosity:0-100, tension:0-100, playfulness:0-100 }, notes: 1-2 sentences }.",
  chemistry_report:
    "You are a relationship analyst. Score chemistry across four axes. Output JSON: { chemistry_score: 0-100, emotional:0-100, intellectual:0-100, playful:0-100, romantic:0-100, summary: 1 sentence, growth_areas: [2 short bullets] }.",
  red_flag_scan:
    "You scan a conversation for manipulative, controlling or unsafe patterns. Output JSON: { risk_level: 'low'|'medium'|'high', flags: [up to 4 short strings], green_flags: [up to 3 short strings], advice: 1-2 sentences }.",
  reveal_readiness:
    "You judge whether two anonymous matches are ready to reveal identities. Output JSON: { readiness_score: 0-100, signals: { trust:0-100, depth:0-100, consistency:0-100 }, recommendation: 1 sentence, recommended_reveal_day: integer 1-14 }.",
  first_meet_plan:
    "You craft a thoughtful first in-person meeting plan after a 7-day anonymous chat. Output JSON: { city: string, vibe: string, plan: { activity: string, time_of_day: string, duration_minutes: number, talking_points: [3 short strings] }, backup_plan: { activity: string, why: 1 sentence } }.",
  attachment_profile:
    "You infer attachment style from chat clues and self-report. Output JSON: { primary_style: 'secure'|'anxious'|'avoidant'|'disorganized', secondary_style: same enum or null, scores: { secure:0-100, anxious:0-100, avoidant:0-100, disorganized:0-100 }, insights: 2-3 sentences, partner_advice: 1-2 sentences }.",
  chat_translator:
    "You translate emotionally loaded chat messages. Output JSON: { literal_meaning: 1 sentence, hidden_meaning: 1 sentence, emotional_subtext: 1 sentence, suggested_response: 1-2 sentences under 35 words }.",
  breakup_recovery:
    "You are a compassionate coach for anonymous-match breakups. Output JSON: { stage: 'shock'|'grief'|'reflection'|'rebuild'|'growth', recovery_score: 0-100, daily_plan: [array of 7 short daily actions], affirmation: 1 sentence }.",
};

async function callAI(system: string, userMsg: string, jsonMode = false): Promise<string> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const body: any = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: userMsg },
    ],
  };
  if (jsonMode) body.response_format = { type: "json_object" };

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (r.status === 429) throw new Error("RATE_LIMITED");
  if (r.status === 402) throw new Error("AI_CREDITS_EXHAUSTED");
  if (!r.ok) {
    const t = await r.text();
    console.error("OpenAI error", r.status, t);
    throw new Error("AI_ERROR");
  }
  const json = await r.json();
  return json.choices?.[0]?.message?.content ?? "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseService = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, supabaseService);

    const { feature, payload, matchId } = await req.json() as {
      feature: Feature; payload: any; matchId?: string;
    };

    if (!SYSTEM_PROMPTS[feature]) {
      return new Response(JSON.stringify({ error: "Invalid feature" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cost = COSTS[feature];

    // ── Atomic deduction (prevents double-spend on parallel requests) ──
    const { error: deductErr } = await admin.rpc(
      "deduct_anonymous_dating_credits",
      { p_user_id: user.id, p_amount: cost },
    );
    if (deductErr) {
      const msg = deductErr.message || "";
      if (msg.includes("INSUFFICIENT_CREDITS")) {
        return new Response(JSON.stringify({
          error: "INSUFFICIENT_CREDITS",
          message: `You need ${cost} credits for this feature.`,
        }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "CREDIT_DEDUCTION_FAILED", message: msg }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build user message from payload
    const userMsg = JSON.stringify(payload ?? {});
    const jsonMode = [
      "icebreakers","compatibility","reply_coach","date_ideas","daily_question","conversation_coach",
      "vibe_decoder","chemistry_report","red_flag_scan","reveal_readiness","first_meet_plan","attachment_profile","chat_translator","breakup_recovery",
    ].includes(feature);

    let aiText: string;
    try {
      aiText = await callAI(SYSTEM_PROMPTS[feature], userMsg, jsonMode);
    } catch (e: any) {
      // Refund credits on AI failure
      await admin.rpc("grant_anonymous_dating_credits", { p_user_id: user.id, p_amount: cost });
      const msg = e?.message ?? "AI_ERROR";
      const status = msg === "RATE_LIMITED" ? 429 : msg === "AI_CREDITS_EXHAUSTED" ? 402 : 500;
      return new Response(JSON.stringify({ error: msg }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse if JSON
    let output: any = aiText;
    if (jsonMode) {
      try {
        const parsed = JSON.parse(aiText);
        output = parsed;
      } catch {
        output = aiText;
      }
    }

    // Log usage
    await admin.from("anonymous_date_ai_usage").insert({
      user_id: user.id,
      match_id: matchId ?? null,
      feature_type: feature,
      credits_used: cost,
      input_data: payload ?? {},
      output_data: typeof output === "string" ? { text: output } : output,
    });

    // Optionally persist parity outputs in their dedicated tables
    const parityTable = PARITY_TABLES[feature];
    if (parityTable && typeof output === "object" && output) {
      const base: any = { user_id: user.id, match_id: matchId ?? null };
      const row: any = { ...base };
      const o: any = output;
      switch (feature) {
        case "vibe_decoder":
          Object.assign(row, { vibe_label: o.vibe_label ?? "Unknown", vibe_score: o.vibe_score ?? 0, energy: o.energy ?? {}, notes: o.notes ?? null });
          break;
        case "chemistry_report":
          Object.assign(row, { chemistry_score: o.chemistry_score ?? 0, emotional: o.emotional ?? null, intellectual: o.intellectual ?? null, playful: o.playful ?? null, romantic: o.romantic ?? null, summary: o.summary ?? null, growth_areas: o.growth_areas ?? [] });
          break;
        case "red_flag_scan":
          Object.assign(row, { risk_level: o.risk_level ?? "low", flags: o.flags ?? [], green_flags: o.green_flags ?? [], advice: o.advice ?? null });
          break;
        case "reveal_readiness":
          Object.assign(row, { readiness_score: o.readiness_score ?? 0, signals: o.signals ?? {}, recommendation: o.recommendation ?? null, recommended_reveal_day: o.recommended_reveal_day ?? null });
          break;
        case "first_meet_plan":
          Object.assign(row, { city: payload?.city ?? o.city ?? null, vibe: o.vibe ?? null, plan: o.plan ?? {}, backup_plan: o.backup_plan ?? {} });
          break;
        case "attachment_profile":
          Object.assign(row, { primary_style: o.primary_style ?? "secure", secondary_style: o.secondary_style ?? null, scores: o.scores ?? {}, insights: o.insights ?? null, partner_advice: o.partner_advice ?? null });
          break;
        case "chat_translator":
          Object.assign(row, { original_message: payload?.message ?? "", literal_meaning: o.literal_meaning ?? null, hidden_meaning: o.hidden_meaning ?? null, emotional_subtext: o.emotional_subtext ?? null, suggested_response: o.suggested_response ?? null });
          break;
        case "breakup_recovery":
          Object.assign(row, { stage: o.stage ?? null, recovery_score: o.recovery_score ?? 0, daily_plan: o.daily_plan ?? [], affirmation: o.affirmation ?? null });
          break;
      }
      await admin.from(parityTable).insert(row);
    }

    return new Response(JSON.stringify({
      success: true,
      feature,
      output,
      credits_remaining: credits.credits_remaining - cost,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("anonymous-date-ai error", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
