import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { action, mentorArea, moods, message } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    if (action === "generate-action-plan") {
      // Fetch recent check-ins and moods for context
      const [{ data: checkins }, { data: moods }, { data: goals }] = await Promise.all([
        supabase.from("mentor_checkins").select("*").eq("user_id", user.id).eq("mentor_area", mentorArea).order("created_at", { ascending: false }).limit(7),
        supabase.from("mentor_moods").select("*").eq("user_id", user.id).eq("mentor_area", mentorArea).order("created_at", { ascending: false }).limit(14),
        supabase.from("mentor_goals").select("*").eq("user_id", user.id).eq("mentor_area", mentorArea).limit(5),
      ]);

      const contextParts = [];
      if (checkins?.length) contextParts.push(`Recent check-ins: ${JSON.stringify(checkins.map(c => ({ date: c.created_at, mood: c.mood_score, energy: c.energy_level, notes: c.notes })))}`);
      if (moods?.length) contextParts.push(`Mood history: ${JSON.stringify(moods.map(m => ({ date: m.created_at, mood: m.mood_score, energy: m.energy_score, stress: m.stress_score })))}`);
      if (goals?.length) contextParts.push(`Active goals: ${JSON.stringify(goals.map(g => ({ title: g.title, progress: g.progress, status: g.status })))}`);

      const systemPrompt = `You are an elite ${mentorArea} coach creating a personalized weekly action plan. Based on the user's data, create a structured, actionable plan with:
1. Weekly Theme & Focus
2. 5-7 Daily Action Items (specific, measurable)
3. Key Habits to Build
4. Challenges to Watch For
5. Motivation & Mindset Tips
Format with clear markdown headers and bullet points. Be specific and personalized based on the data provided.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-5",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: contextParts.length > 0 ? `Here's my recent data:\n${contextParts.join("\n")}\n\nGenerate my personalized weekly action plan for ${mentorArea}.` : `Generate a starter weekly action plan for ${mentorArea} coaching. I'm just getting started.` },
          ],
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted. Please top up." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("AI gateway error");
      }

      const aiData = await response.json();
      const planContent = aiData.choices?.[0]?.message?.content || "Could not generate plan.";
      const title = `Week of ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${mentorArea.charAt(0).toUpperCase() + mentorArea.slice(1)}`;

      await supabase.from("mentor_action_plans").insert({
        user_id: user.id,
        mentor_area: mentorArea,
        title,
        plan_content: planContent,
        credits_used: 5,
      });

      // Award XP
      await awardXP(supabase, user.id, 25, "action_plan");

      return new Response(JSON.stringify({ plan: planContent, title }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "voice-coaching") {
      const systemPrompt = `You are a warm, encouraging ${mentorArea} coach speaking directly to your client. Give brief, motivational spoken-style advice (2-3 paragraphs max). Sound natural, empathetic, and actionable. Use "you" language. Don't use markdown formatting — write as if speaking aloud.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-5",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limited." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("AI gateway error");
      }

      const aiData = await response.json();
      const reply = aiData.choices?.[0]?.message?.content || "I'm here for you. Let's talk.";

      await awardXP(supabase, user.id, 10, "voice_session");

      return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "mood-insight") {
      // Generate AI insights from mood history
      const { data: moodData } = await supabase.from("mentor_moods").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30);

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-5",
          messages: [
            { role: "system", content: "You are a wellness coach analyzing mood patterns. Give brief, actionable insights about trends, patterns, and recommendations. Be encouraging. Keep it under 200 words." },
            { role: "user", content: `Analyze my mood data (last 30 entries): ${JSON.stringify(moodData?.map(m => ({ date: m.created_at, mood: m.mood_score, energy: m.energy_score, stress: m.stress_score })))}` },
          ],
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limited." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("AI error");
      }

      const aiData = await response.json();
      return new Response(JSON.stringify({ insight: aiData.choices?.[0]?.message?.content || "Not enough data yet." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("mentor-ai-tools error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

async function awardXP(supabase: any, userId: string, amount: number, action: string) {
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

      await supabase.from("mentor_xp").update({ xp_total: newXP, level: newLevel, badges, updated_at: new Date().toISOString() }).eq("user_id", userId);
    } else {
      await supabase.from("mentor_xp").insert({ user_id: userId, xp_total: amount, level: 1 });
    }
  } catch (e) {
    console.error("XP award error:", e);
  }
}
