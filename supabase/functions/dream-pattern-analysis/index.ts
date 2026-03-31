import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { dreams } = await req.json();
    if (!dreams || dreams.length < 3) throw new Error("At least 3 dreams required");

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

    const dreamSummary = dreams.map((d: any) =>
      `Date: ${d.date} | Title: ${d.title} | Themes: ${(d.themes || []).join(", ")} | Emotions: ${(d.emotions || []).join(", ")} | Content: ${d.content}`
    ).join("\n\n");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert dream analyst specializing in pattern recognition across dream series. Analyze the collection of dreams and provide:
1. **Recurring Themes** — Patterns that appear across multiple dreams
2. **Emotional Arc** — How the emotional landscape evolves over time
3. **Symbol Dictionary** — Key recurring symbols and their evolving meanings
4. **Dream Connections** — How dreams relate to and reference each other
5. **Psychological Insights** — What these patterns reveal about the dreamer's inner world
6. **Predictive Patterns** — What themes might appear in future dreams
7. **Recommendations** — Actions based on the patterns discovered
Use markdown formatting with clear sections.`
          },
          { role: "user", content: `Analyze these ${dreams.length} dreams for patterns:\n\n${dreamSummary}` },
        ],
        max_tokens: 1500,
      }),
    });

    if (!response.ok) throw new Error("AI service error");

    const data = await response.json();
    return new Response(JSON.stringify({ analysis: data.choices[0].message.content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
