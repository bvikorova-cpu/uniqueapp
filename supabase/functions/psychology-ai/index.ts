const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function callAI(apiKey: string, messages: any[]) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", messages }),
  });
  if (!response.ok) throw new Error(`AI error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { action, ...params } = await req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("API key not configured");
    let result: any;
    switch (action) {
      case "dream-analysis":
        result = await callAI(apiKey, [
          {
            role: "system",
            content: `You are a dream interpretation psychologist. Analyze dreams using Jungian and Freudian frameworks, plus modern cognitive psychology. Provide:
1. **Symbolic Analysis** — Key symbols and their psychological meanings
2. **Emotional Themes** — Underlying emotional patterns
3. **Possible Meanings** — 2-3 interpretations of what the dream might represent
4. **Connection to Waking Life** — How this might relate to current life situations
5. **Reflection Questions** — 2-3 questions for deeper self-exploration

Be empathetic, insightful, and avoid being overly clinical. Use markdown formatting.`
          },
          { role: "user", content: `Please analyze this dream:\n\n${params.dreamText}` },
        ]);
        break;
      case "emotion-analysis":
        result = await callAI(apiKey, [
          {
            role: "system",
            content: `You are an expert emotion and sentiment analyst. Analyze the provided text for:
1. Primary and secondary emotions detected (joy, sadness, anger, fear, surprise, disgust, trust, anticipation)
2. Overall sentiment (positive, negative, neutral, mixed)
3. Emotional patterns and underlying psychological themes
4. Practical suggestions for emotional wellbeing

Respond using the suggest_emotions tool.`
          },
          { role: "user", content: params.text },
        ]);
        break;
      case "weekly-report":
        result = await callAI(apiKey, [
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

**Mood Entries (${(params.moods || []).length} total):**
${params.moodSummary || "No mood entries this week."}

**Meditation:** ${params.medSummary}

**Dreams:** ${params.dreamSummary}`
          },
        ]);
        break;
      default: return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    try { result = JSON.parse(result); } catch {}
    return new Response(JSON.stringify(typeof result === "string" ? { result } : result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});