// Past-life analysis: deducts 1 past_life_credit, calls Lovable AI, inserts past_life_readings.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const COST = 1;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const auth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await auth.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Not authenticated" }, 401);
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    const body = await req.json().catch(() => ({}));
    const {
      birthDate,
      dreamsDejavu = "",
      talentsPhobias = "",
      readingType = "general",
      partnerBirthDate,
      partnerInfo,
    } = body || {};
    if (!birthDate) return json({ error: "birthDate required" }, 400);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: credits } = await admin
      .from("past_life_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const balance = credits?.credits_remaining ?? 0;
    if (balance < COST) {
      return json({ requiresPayment: true, error: "Insufficient credits", needed: COST, balance }, 402);
    }

    const systemPrompt =
      `You are a mystical past-life reader (entertainment, not factual). Return ONLY valid JSON of the form:
{"past_lives":[{"era":"string","location":"string","role":"string","summary":"2-3 sentences","emotional_themes":["..."]}],"karmic_lessons":"2-3 paragraphs","soulmate_analysis":"2 paragraphs or null"}.
Produce 2-4 vivid past lives. Tailor depth to readingType.`;

    const userPrompt = `Birth date: ${birthDate}
Reading type: ${readingType}
Dreams / déjà vu: ${dreamsDejavu || "(none)"}
Talents / phobias: ${talentsPhobias || "(none)"}
Partner birth date: ${partnerBirthDate || "(none)"}
Partner info: ${partnerInfo || "(none)"}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    if (aiResp.status === 429) return json({ error: "Rate limited" }, 429);
    if (aiResp.status === 402) return json({ error: "AI credits exhausted" }, 402);
    if (!aiResp.ok) {
      console.error("AI error", aiResp.status, await aiResp.text());
      return json({ error: "AI request failed" }, 500);
    }
    const aiData = await aiResp.json();
    const content = aiData.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = {}; }

    // Deduct credit
    await admin
      .from("past_life_credits")
      .update({ credits_remaining: balance - COST, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    // Insert reading
    const { data: inserted } = await admin
      .from("past_life_readings")
      .insert({
        user_id: user.id,
        birth_date: birthDate,
        reading_type: readingType,
        dreams_dejavu: dreamsDejavu,
        talents_phobias: talentsPhobias,
        partner_birth_date: partnerBirthDate ?? null,
        partner_info: partnerInfo ?? null,
        past_lives: parsed.past_lives ?? [],
        karmic_lessons: parsed.karmic_lessons ?? null,
        soulmate_analysis: parsed.soulmate_analysis ?? null,
        credits_used: COST,
      })
      .select()
      .single();

    return json({ reading: inserted, result: parsed, cost: COST });
  } catch (e) {
    console.error(e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
