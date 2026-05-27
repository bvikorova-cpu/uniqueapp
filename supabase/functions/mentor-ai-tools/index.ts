import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ACTION_COSTS: Record<string, number> = {
  "generate-action-plan": 5,
  "voice-coaching": 4,
  "mood-insight": 3,
};

const ACTION_USAGE_TYPES: Record<string, string> = {
  "generate-action-plan": "mentor_action_plan",
  "voice-coaching": "mentor_voice_coaching",
  "mood-insight": "mentor_mood_insight",
};

async function callOpenAI(systemPrompt: string, userPrompt: string, maxTokens = 1000) {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt.slice(0, 6000) },
      ],
      max_tokens: maxTokens,
    }),
  });

  return response;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let action: string | undefined;
  let auth: any = null;

  try {
    const body = await req.json();
    action = body.action;
    const { mentorArea, message } = body;

    if (!action || !ACTION_COSTS[action]) {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const credits = ACTION_COSTS[action];
    auth = await requireAiCredits(req, corsHeaders, {
      credits,
      usageType: ACTION_USAGE_TYPES[action] || "mentor_ai",
    });
    if (auth.errorResponse) return auth.errorResponse;

    const supabase = auth.supabase!;
    const user = auth.user!;
    const deduct = auth.deduct!;

    if (action === "generate-action-plan") {
      const area = (mentorArea || "career").toLowerCase();
      const [{ data: checkins }, { data: moods }, { data: goals }] = await Promise.all([
        supabase.from("mentor_checkins").select("*").eq("user_id", user.id).eq("mentor_area", area).order("created_at", { ascending: false }).limit(7),
        supabase.from("mentor_moods").select("*").eq("user_id", user.id).eq("mentor_area", area).order("created_at", { ascending: false }).limit(14),
        supabase.from("mentor_goals").select("*").eq("user_id", user.id).eq("mentor_area", area).limit(5),
      ]);

      const contextParts: string[] = [];
      if (checkins?.length) contextParts.push(`Recent check-ins: ${JSON.stringify(checkins.map((c: any) => ({ date: c.created_at, mood: c.mood_score, energy: c.energy_level, notes: c.notes })))}`);
      if (moods?.length) contextParts.push(`Mood history: ${JSON.stringify(moods.map((m: any) => ({ date: m.created_at, mood: m.mood_score, energy: m.energy_score, stress: m.stress_score })))}`);
      if (goals?.length) contextParts.push(`Active goals: ${JSON.stringify(goals.map((g: any) => ({ title: g.title, progress: g.progress, status: g.status })))}`);

      const systemPrompt = `You are an elite ${area} coach creating a personalized weekly action plan. Based on the user's data, create a structured, actionable plan with:
1. Weekly Theme & Focus
2. 5-7 Daily Action Items (specific, measurable)
3. Key Habits to Build
4. Challenges to Watch For
5. Motivation & Mindset Tips
Format with clear markdown headers and bullet points. Be specific and personalized based on the data provided.`;

      const userPrompt = contextParts.length
        ? `Here's my recent data:\n${contextParts.join("\n")}\n\nGenerate my personalized weekly action plan for ${area}.`
        : `Generate a starter weekly action plan for ${area} coaching. I'm just getting started.`;

      const response = await callOpenAI(systemPrompt, userPrompt, 1500);
      if (!response.ok) {
        if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Top up at Settings → Workspace → Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("OpenAI API error");
      }

      const aiData = await response.json();
      const planContent = aiData.choices?.[0]?.message?.content || "Could not generate plan.";
      const title = `Week of ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${area.charAt(0).toUpperCase() + area.slice(1)}`;

      await supabase.from("mentor_action_plans").insert({
        user_id: user.id,
        mentor_area: area,
        title,
        plan_content: planContent,
        credits_used: credits,
      });

      await deduct();
      await awardXP(supabase, user.id, 25, "action_plan");

      return new Response(JSON.stringify({ plan: planContent, title }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "voice-coaching") {
      if (!message || typeof message !== "string" || !message.trim()) {
        return new Response(JSON.stringify({ error: "Message is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const area = (mentorArea || "career").toLowerCase();
      const systemPrompt = `You are a warm, encouraging ${area} coach speaking directly to your client. Give brief, motivational spoken-style advice (2-3 paragraphs max). Sound natural, empathetic, and actionable. Use "you" language. Don't use markdown formatting — write as if speaking aloud.`;

      const response = await callOpenAI(systemPrompt, message.slice(0, 2000), 600);
      if (!response.ok) {
        if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("OpenAI API error");
      }

      const aiData = await response.json();
      const reply = aiData.choices?.[0]?.message?.content || "I'm here for you. Let's talk.";

      await deduct();
      await awardXP(supabase, user.id, 10, "voice_session");

      return new Response(JSON.stringify({ reply }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "mood-insight") {
      const { data: moodData } = await supabase
        .from("mentor_moods")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (!moodData || moodData.length < 3) {
        return new Response(JSON.stringify({ error: "Need at least 3 mood entries for insights." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const systemPrompt = "You are a wellness coach analyzing mood patterns. Give brief, actionable insights about trends, patterns, and recommendations. Be encouraging. Keep it under 200 words.";
      const userPrompt = `Analyze my mood data (last ${moodData.length} entries): ${JSON.stringify(moodData.map((m: any) => ({ date: m.created_at, mood: m.mood_score, energy: m.energy_score, stress: m.stress_score })))}`;

      const response = await callOpenAI(systemPrompt, userPrompt, 500);
      if (!response.ok) {
        if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("OpenAI API error");
      }

      const aiData = await response.json();
      await deduct();
      return new Response(
        JSON.stringify({ insight: aiData.choices?.[0]?.message?.content || "Not enough data yet." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("mentor-ai-tools error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function awardXP(supabase: any, userId: string, amount: number, _action: string) {
  try {
    const { data: existing } = await supabase.from("mentor_xp").select("*").eq("user_id", userId).maybeSingle();
    if (existing) {
      const newXP = existing.xp_total + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      const badges = [...(existing.badges || [])];
      if (newLevel >= 5 && !badges.includes("level_5")) badges.push("level_5");
      if (newLevel >= 10 && !badges.includes("level_10")) badges.push("level_10");
      if (newXP >= 500 && !badges.includes("xp_500")) badges.push("xp_500");
      if (newXP >= 1000 && !badges.includes("xp_1000")) badges.push("xp_1000");

      await supabase
        .from("mentor_xp")
        .update({ xp_total: newXP, level: newLevel, badges, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
    } else {
      await supabase.from("mentor_xp").insert({ user_id: userId, xp_total: amount, level: 1 });
    }
  } catch (e) {
    console.error("XP award error:", e);
  }
}
