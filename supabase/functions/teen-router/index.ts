// Teen Hub unified AI router — handles all 6 Teen modules with credit deduction.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Module → credit cost matrix (must match src/hooks/useTeenCredits.ts)
const COSTS: Record<string, number> = {
  homework_pro: 4,
  essay_coach: 5,
  mental_wellness: 3,
  study_planner: 3,
  skill_builder: 4,
  social_coach: 3,
};

// System prompts per module (age-appropriate, safe, no medical claims)
const SYSTEM_PROMPTS: Record<string, string> = {
  homework_pro:
    "You are a high-school tutor for ages 13-17. Explain concepts step-by-step, show working, give one worked example then a similar practice problem. Keep answers concise.",
  essay_coach:
    "You are an essay coach for teens. Review structure, thesis, evidence, transitions, and grammar. Return feedback as: Strengths, Improvements, Revised Opening, Score (1-10).",
  mental_wellness:
    "You are a supportive peer-style wellness coach for teens (13-17). Provide journaling prompts, breathing exercises, and reframing techniques. NEVER give medical, psychiatric, or diagnostic advice. ALWAYS end with: 'If you're in crisis, contact a trusted adult or local helpline.' Refuse to discuss self-harm details and redirect to emergency contacts.",
  study_planner:
    "You are a study planner for teens. Build a realistic weekly study plan with subjects, time blocks, breaks (Pomodoro), and revision checkpoints. Output as a markdown table.",
  skill_builder:
    "You are a skill-acquisition mentor for teens. Break down any skill into a 4-week roadmap with weekly milestones, daily 30-min tasks, and free resources.",
  social_coach:
    "You are a social-skills coach for teens. Give practical scripts and role-play examples for the situation (friendship, conflict, public speaking, dating boundaries). Emphasize consent, respect, and safety.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes } = await supabaseUser.auth.getUser();
    const user = userRes?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const module = String(body.module || "");
    const prompt = String(body.prompt || "").slice(0, 4000);

    if (!COSTS[module]) return json({ error: "Invalid module" }, 400);
    if (!prompt.trim()) return json({ error: "Prompt required" }, 400);
    if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const cost = COSTS[module];

    // Pre-check balance
    const { data: credits } = await admin
      .from("teen_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const balance = credits?.credits_remaining ?? 0;
    if (balance < cost) {
      return json({ error: "Insufficient credits", balance, cost }, 402);
    }

    // Call Lovable AI Gateway
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPTS[module] },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (aiRes.status === 429) return json({ error: "Rate limit, try again soon" }, 429);
    if (aiRes.status === 402) return json({ error: "AI credits exhausted" }, 402);
    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return json({ error: "AI request failed", detail: txt }, 500);
    }

    const aiJson = await aiRes.json();
    const reply = aiJson?.choices?.[0]?.message?.content ?? "";

    // Deduct credits AFTER successful AI response
    await admin
      .from("teen_credits")
      .update({ credits_remaining: balance - cost })
      .eq("user_id", user.id);

    // Log usage
    await admin.from("teen_module_usage").insert({
      user_id: user.id,
      module,
      action: "ai_generate",
      credits_used: cost,
      metadata: { prompt_length: prompt.length },
    });

    return json({ reply, credits_remaining: balance - cost, cost });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
