import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth");

    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { answers } = await req.json();
    if (!answers || typeof answers !== "object") throw new Error("answers required");

    const prompt = `You are a personality analyst. Based on these answers from a personality questionnaire, return ONLY valid JSON with this shape:
{
  "archetype": "string (one of: The Creator, The Explorer, The Sage, The Hero, The Caregiver, The Rebel, The Lover, The Jester, The Magician, The Ruler, The Innocent, The Everyman)",
  "summary": "1-2 sentence summary of personality",
  "traits": { "openness": 0-100, "conscientiousness": 0-100, "extraversion": 0-100, "agreeableness": 0-100, "creativity": 0-100 },
  "suggested_interests": ["6-10 short interest tags relevant to this person"],
  "suggested_tone": "one of: warm, professional, playful, bold, minimal"
}

Answers:
${JSON.stringify(answers, null, 2)}`;

    const ai = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You output ONLY raw JSON. No markdown, no commentary." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!ai.ok) {
      const t = await ai.text();
      if (ai.status === 429) throw new Error("Rate limit exceeded, try again shortly");
      if (ai.status === 402) throw new Error("AI credits exhausted");
      throw new Error(`AI error: ${t}`);
    }
    const aiData = await ai.json();
    let content: string = aiData.choices?.[0]?.message?.content ?? "";
    content = content.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(content);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    await admin.from("profile_personality").upsert({
      user_id: user.id,
      archetype: parsed.archetype,
      summary: parsed.summary,
      traits: parsed.traits,
      suggested_interests: parsed.suggested_interests,
      suggested_tone: parsed.suggested_tone,
      raw_answers: answers,
    }, { onConflict: "user_id" });

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[personality-test]", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
