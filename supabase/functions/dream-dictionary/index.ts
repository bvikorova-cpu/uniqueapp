import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { symbol, context } = await req.json();
    if (!symbol) throw new Error("Dream symbol required");

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
            content: `You are a world-class dream analyst combining Jungian psychology, Freudian analysis, cultural mythology, and modern neuroscience. Provide comprehensive, personalized dream symbol interpretations.

For each symbol, provide:
1. **Universal Meaning** - Cross-cultural significance
2. **Psychological Analysis** (Jungian & Freudian perspectives)
3. **Cultural Variations** - How different cultures interpret this symbol
4. **Emotional Significance** - What emotions this symbol typically represents
5. **Personal Context Analysis** - Based on the user's provided context
6. **Common Dream Scenarios** with this symbol and their meanings
7. **Shadow Aspect** - What this symbol might reveal about suppressed aspects
8. **Action Guidance** - What this dream symbol might be telling you to do in waking life
9. **Related Symbols** - Other symbols often appearing alongside this one

Be insightful, empathetic, and avoid generic interpretations. Use markdown formatting.`
          },
          {
            role: "user",
            content: `Interpret this dream symbol: "${symbol}"${context ? `. Personal context: "${context}"` : ""}`
          }
        ],
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return new Response(JSON.stringify({ interpretation: data.choices[0].message.content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
