import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    // Check credits (10 for weekly report)
    const { data: credits } = await supabase.from("ai_credits").select("*").eq("user_id", user.id).single();
    if (!credits || credits.credits_remaining < 10) {
      throw new Error("Insufficient credits. You need 10 credits for a weekly report.");
    }

    // Gather last 7 days of data
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: moods } = await supabase.from("psychology_mood_entries" as any)
      .select("*").eq("user_id", user.id).gte("created_at", weekAgo).order("created_at");

    const { data: meditations } = await supabase.from("psychology_meditation_sessions" as any)
      .select("*").eq("user_id", user.id).gte("created_at", weekAgo);

    const { data: dreams } = await supabase.from("psychology_dream_entries" as any)
      .select("*").eq("user_id", user.id).gte("created_at", weekAgo);

    // Build context
    const moodSummary = (moods || []).map((m: any) =>
      `${new Date(m.created_at).toLocaleDateString()}: Score ${m.mood_score}/10 (${m.mood_label}), Tags: ${(m.tags || []).join(", ")}, Journal: ${m.journal_entry || "none"}`
    ).join("\n");

    const medSummary = `${(meditations || []).length} sessions, ${Math.floor((meditations || []).reduce((s: number, e: any) => s + (e.duration_seconds || 0), 0) / 60)} total minutes`;

    const dreamSummary = (dreams || []).map((d: any) =>
      `${d.title || "Untitled"} (${d.dream_type}, vividness: ${d.vividness_score}/10)`
    ).join("; ") || "No dreams logged";

    // Call OpenAI
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OpenAI API key not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a compassionate wellness psychologist creating a weekly mental health report. Based on the user's mood data, meditation activity, and dream logs, provide:

1. **Weekly Overview** — Summary of emotional patterns
2. **Mood Trend Analysis** — Identify highs, lows, and patterns
3. **Key Insights** — What the data reveals about their mental state
4. **Strengths This Week** — Positive patterns to reinforce
5. **Areas for Growth** — Gentle suggestions for improvement
6. **Personalized Recommendations** — 3-5 specific, actionable wellness tips for next week
7. **Affirmation** — An encouraging closing message

Be warm, empathetic, and constructive. Use markdown formatting with headers and bullet points.`
          },
          {
            role: "user",
            content: `Here is my wellness data for the past week:

**Mood Entries (${(moods || []).length} total):**
${moodSummary || "No mood entries this week."}

**Meditation:** ${medSummary}

**Dreams:** ${dreamSummary}`
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    const aiData = await response.json();
    const report = aiData.choices?.[0]?.message?.content || "Unable to generate report.";

    // Deduct credits
    await supabase.from("ai_credits").update({
      credits_remaining: credits.credits_remaining - 10,
    }).eq("user_id", user.id);

    // Save report
    await supabase.from("psychology_wellness_reports" as any).insert({
      user_id: user.id,
      report_content: report,
      mood_entries_count: (moods || []).length,
      meditation_count: (meditations || []).length,
      credits_used: 10,
      week_start: weekAgo,
      week_end: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ report, mood_entries_count: (moods || []).length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
