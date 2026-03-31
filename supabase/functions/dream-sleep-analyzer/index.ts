import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { sleepHours, quality, wakeUps, notes } = await req.json();

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert sleep scientist and wellness coach. Analyze sleep data and provide personalized recommendations. Include:
1. **Sleep Score** — Rate 1-100 based on the data
2. **Analysis** — What the sleep metrics indicate
3. **Sleep Architecture** — Likely sleep stage distribution
4. **Issues Identified** — Problems affecting sleep quality
5. **Improvement Plan** — 5 specific, actionable tips
6. **Optimal Schedule** — Suggested bedtime and wake time
7. **Dream Enhancement** — How to improve dream recall and vividness
Use markdown formatting. Be scientific but accessible.`
          },
          {
            role: "user",
            content: `Sleep Data:\n- Hours: ${sleepHours}\n- Quality: ${quality}\n- Night wake-ups: ${wakeUps}\n- Notes: ${notes || "None"}`,
          },
        ],
        max_tokens: 1000,
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
