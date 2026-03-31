import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { experience, goal } = await req.json();
    if (!goal) throw new Error("Goal is required");

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
            content: `You are an expert lucid dreaming coach with knowledge of neuroscience, sleep psychology, and meditation techniques. Provide personalized, actionable coaching plans for lucid dreaming based on the user's experience level. Include:
1. **Reality Check Techniques** — 3 specific reality checks to practice daily
2. **MILD/WILD Techniques** — Step-by-step technique based on experience level
3. **Dream Journal Tips** — How to improve dream recall
4. **Sleep Hygiene** — Optimal conditions for lucid dreaming
5. **Tonight's Exercise** — A specific exercise to try tonight
6. **Weekly Plan** — 7-day progressive training schedule
Use markdown formatting. Be encouraging and practical.`
          },
          { role: "user", content: `Experience level: ${experience}\nGoal/Dream: ${goal}` },
        ],
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI error:", err);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const coaching = data.choices[0].message.content;

    return new Response(JSON.stringify({ coaching }), {
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
