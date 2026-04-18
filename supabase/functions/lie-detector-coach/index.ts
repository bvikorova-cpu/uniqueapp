// Live Lie Coach — analyzes a conversation and gives real-time manipulation/deception coaching tips
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const COST = 4;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: auth } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { conversation } = await req.json();
    if (!conversation || typeof conversation !== "string" || conversation.length < 5)
      return json({ error: "conversation required (min 5 chars)" }, 400);

    const { data: cr } = await supabase
      .from("lie_detector_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!cr || (cr.credits_remaining ?? 0) < COST)
      return json({ error: "Insufficient credits", required: COST, have: cr?.credits_remaining ?? 0 }, 402);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY not configured" }, 500);

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a real-time deception & manipulation coach. Analyze the live conversation and produce actionable JSON tips like Grammarly for honesty/manipulation." },
          { role: "user", content: `Conversation so far:\n"""${conversation}"""\n\nReturn JSON with: manipulation_score (0-100), tactics_detected (string[]), suggested_responses (string[3-5]), red_flag_phrases (string[]), follow_up_questions (string[3]), summary (string).` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) return json({ error: "AI failed", details: await resp.text() }, 500);
    const aj = await resp.json();
    const results = JSON.parse(aj.choices[0].message.content);

    await supabase.from("lie_detector_credits")
      .update({ credits_remaining: (cr.credits_remaining ?? 0) - COST })
      .eq("user_id", user.id);

    const { data: saved } = await supabase.from("lie_coach_sessions").insert({
      user_id: user.id,
      conversation_text: conversation,
      analysis: results,
      manipulation_score: results.manipulation_score ?? 0,
      suggestions: results.suggested_responses ?? [],
      credits_used: COST,
    }).select().single();

    return json({ session: saved, results });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
function json(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
