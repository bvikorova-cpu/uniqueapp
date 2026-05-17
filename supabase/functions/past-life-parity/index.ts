// Past Life Explorer parity pack router.
// 8 actions, fixed cost 6 credits each, deducted from past_life_credits.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PARITY_COST = 6;

interface Body {
  action: string;
  payload?: Record<string, unknown>;
}

const ACTION_TABLE: Record<string, string> = {
  "soul-origin": "past_life_soul_origins",
  "karmic-debt": "past_life_karmic_debts",
  "reincarnation-timeline": "past_life_reincarnation_timelines",
  "soul-tribe": "past_life_soul_tribes",
  "lesson-workbook": "past_life_lesson_workbooks",
  "animal-elemental": "past_life_animal_elementals",
  "famous-match": "past_life_famous_matches",
  "death-reflection": "past_life_death_reflections",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  "soul-origin": `You are a mystical soul origin oracle. Return ONLY JSON: {"origin_dimension":"string","origin_era":"string","soul_archetype":"string","narrative":"3-4 sentence poetic description"}`,
  "karmic-debt": `You are a karmic accountant. Return ONLY JSON: {"debts":[{"area":"string","intensity":1-10,"description":"string"}],"resolution_plan":"2-3 paragraph guidance"}. Produce 3-5 debts.`,
  "reincarnation-timeline": `You are a soul chronicler. Return ONLY JSON: {"timeline":[{"era":"string","location":"string","role":"string","summary":"1-2 sentences"}],"overall_arc":"2 paragraph arc"}. Produce 5-7 chronological entries from oldest to newest.`,
  "soul-tribe": `You are a soul-family seer. Return ONLY JSON: {"members":[{"role":"string (mother/lover/mentor/etc)","bond":"string","past_life_context":"1-2 sentences"}],"tribe_mission":"2 paragraph collective mission"}. Produce 4-6 members.`,
  "lesson-workbook": `You are a soul-work coach. Return ONLY JSON: {"plan":[{"day":1-7,"theme":"string","practice":"specific exercise","reflection":"journal prompt"}],"affirmation":"single powerful sentence"}. Produce exactly 7 days.`,
  "animal-elemental": `You are an animistic regression guide. Return ONLY JSON: {"form":"specific animal or elemental being","habitat":"string","story":"3-5 sentence vivid narrative","gift_today":"trait this life gifts you now"}.`,
  "famous-match": `You are a historical resonance oracle. Return ONLY JSON: {"figure_name":"real historical figure","figure_era":"string","resonance_score":50-99,"reasoning":"3-4 sentences explaining shared traits / patterns"}. Match a real verified figure.`,
  "death-reflection": `You are a compassionate transition guide. Return ONLY JSON: {"cause":"how the past life ended","emotional_imprint":"feeling carried forward","unfinished_business":"what was left undone","healing_message":"2-3 paragraph healing guidance"}.`,
};

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

    const { data: creditsRow } = await admin
      .from("past_life_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const balance = creditsRow?.credits_remaining ?? 0;
    if (balance < PARITY_COST) {
      return json({ requiresPayment: true, error: "Insufficient credits", needed: PARITY_COST, balance }, 402);
    }

    const payload = body.payload ?? {};
    const userPrompt = `Generate the requested reading.\n\nUser context:\n${JSON.stringify(payload, null, 2)}`;

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

    const row: Record<string, unknown> = {
      user_id: user.id,
      credits_used: PARITY_COST,
      ...parsed,
      ...(payload.birthDate ? { birth_date: payload.birthDate } : {}),
      ...(payload.focusArea ? { focus_area: payload.focusArea } : {}),
    };

    const { data: inserted, error: insertErr } = await admin
      .from(table)
      .insert(row)
      .select()
      .single();

    if (insertErr) {
      console.error("Insert failed", insertErr);
      return json({ error: "Failed to save reading" }, 500);
    }

    await admin
      .from("past_life_credits")
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
