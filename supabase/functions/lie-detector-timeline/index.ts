// Conversation Timeline — analyzes message sequence to detect deception spikes per message
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COST = 10;

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

    const { messages, title } = await req.json();
    if (!Array.isArray(messages) || messages.length < 2) return json({ error: "Provide at least 2 messages" }, 400);

    const { data: cr } = await supabase
      .from("lie_detector_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!cr || (cr.credits_remaining ?? 0) < COST) {
      return json({ error: "Insufficient credits", required: COST, have: cr?.credits_remaining ?? 0 }, 402);
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY not configured" }, 500);

    const formatted = messages.map((m: any, i: number) => `[${i + 1}] ${typeof m === "string" ? m : m.text}`).join("\n");

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a forensic linguistics expert. Score deception likelihood per message and find patterns over time.",
          },
          {
            role: "user",
            content: `Analyze this conversation timeline:\n${formatted}\n\nReturn strict JSON with: overall_score (0-100 truthfulness), spikes (array of {index, score 0-100 deception, reason}), patterns (string[] e.g. "increasing hedging", "topic avoidance"), sentiment_trend (string), trustworthiness_curve (number[] one per message 0-100), summary (string), recommended_questions (string[]).`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      return json({ error: "OpenAI failed", details: t }, 500);
    }
    const aj = await resp.json();
    const results = JSON.parse(aj.choices[0].message.content);

    await supabase
      .from("lie_detector_credits")
      .update({ credits_remaining: (cr.credits_remaining ?? 0) - COST })
      .eq("user_id", user.id);

    const { data: saved } = await supabase
      .from("lie_detector_timelines")
      .insert({
        user_id: user.id,
        title: title || `Timeline ${new Date().toISOString().slice(0, 10)}`,
        message_count: messages.length,
        overall_score: results.overall_score,
        spikes: results.spikes || [],
        patterns: results.patterns || [],
        results,
        credits_used: COST,
      })
      .select()
      .single();

    return json({ analysis: saved, results });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
