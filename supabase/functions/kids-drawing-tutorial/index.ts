// Kids Drawing Tutorial — generates step-by-step drawing instructions for kids.
// Costs 4 kids_drawing credits per tutorial. Uses OpenAI for text steps.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const COST = 4;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization header" }, 401);

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Invalid bearer token" }, 401);
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const topic = String(body.topic || "").trim().slice(0, 100);
    const difficulty = String(body.difficulty || "easy").toLowerCase();
    if (!topic) return json({ error: "topic required" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Ensure credit row exists
    const { data: credRow } = await admin
      .from("kids_drawing_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!credRow) {
      await admin.from("kids_drawing_credits").insert({
        user_id: user.id, credits_remaining: 0, total_credits_purchased: 0,
      });
      return json({ error: "Insufficient credits", credits_remaining: 0, cost: COST }, 402);
    }
    const balance = credRow.credits_remaining ?? 0;
    if (balance < COST) {
      return json({ error: "Insufficient credits", credits_remaining: balance, cost: COST }, 402);
    }

    const stepCount = difficulty === "hard" ? 6 : difficulty === "medium" ? 5 : 4;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You create kid-friendly step-by-step drawing tutorials for children ages 4-12. Return STRICT JSON: {"title": string, "steps": [{"instruction": string}]}. Each instruction must be short (under 20 words), encouraging, and refer to simple shapes (circle, oval, line, curve, triangle). No scary content.`,
          },
          {
            role: "user",
            content: `Create a ${difficulty} ${stepCount}-step drawing tutorial for: ${topic}.`,
          },
        ],
        max_completion_tokens: 800,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenAI error:", errText);
      return json({ error: "AI tutorial generation failed" }, 502);
    }

    const aiData = await res.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = {}; }

    const title = String(parsed.title || `How to draw ${topic}`).slice(0, 80);
    const steps = Array.isArray(parsed.steps) && parsed.steps.length > 0
      ? parsed.steps.map((s: any) => ({ instruction: String(s?.instruction || "").slice(0, 200) })).filter((s: any) => s.instruction)
      : [{ instruction: `Start by drawing the outline of a ${topic}.` }];

    // Deduct credits
    await admin
      .from("kids_drawing_credits")
      .update({ credits_remaining: balance - COST })
      .eq("user_id", user.id);

    return json({ title, steps, topic, difficulty });
  } catch (e: any) {
    console.error("kids-drawing-tutorial error:", e);
    return json({ error: e.message || "Internal error" }, 500);
  }
});
