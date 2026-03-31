import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { dreams, moods } = await req.json();

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OpenAI API key not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a data analyst specializing in dream psychology and mood correlation research. Analyze the user's dream journal entries alongside their mood tracking data to find meaningful patterns and connections.

Provide:
1. **Correlation Overview** - Summary of key dream-mood connections found
2. **Mood → Dream Mapping** - Which moods tend to produce which dream themes
3. **Stress Impact Analysis** - How stress levels affect dream content
4. **Positive Mood Patterns** - Dreams associated with positive emotional states
5. **Negative Mood Patterns** - Dreams associated with negative emotional states
6. **Temporal Patterns** - Time-based correlations (day of week, seasonal)
7. **Recurring Theme Analysis** - Symbols that appear during specific emotional states
8. **Predictive Insights** - Based on current mood trends, what dreams to expect
9. **Actionable Recommendations** - How to use mood management for better dreams
10. **Wellness Score** - Overall dream-mood harmony rating

Use markdown formatting with clear sections.`
          },
          {
            role: "user",
            content: `Analyze these dream entries and mood records for correlations:\n\nDREAM ENTRIES:\n${JSON.stringify(dreams, null, 2)}\n\nMOOD RECORDS:\n${JSON.stringify(moods, null, 2)}`
          }
        ],
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return new Response(JSON.stringify({ analysis: data.choices[0].message.content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
