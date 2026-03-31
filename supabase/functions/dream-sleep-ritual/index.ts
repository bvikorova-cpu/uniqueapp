import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { sleepGoal, challenges, duration } = await req.json();

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
            content: `You are a sleep scientist and meditation expert. Create personalized, evidence-based bedtime rituals that combine multiple modalities for optimal sleep and dream quality.

Structure the ritual as a minute-by-minute guide including:
1. **Ritual Overview** - Name, duration, and expected benefits
2. **Environment Setup** (lighting, temperature, scent recommendations)
3. **Step-by-Step Timeline** - Detailed minute-by-minute activities
4. **Breathing Exercises** - Specific patterns (4-7-8, box breathing, etc.)
5. **Body Scan Meditation** - Customized progressive relaxation script
6. **Visualization Exercise** - Dream incubation technique
7. **Sleep Affirmations** - 5-7 personalized affirmations
8. **Wake-Up Protocol** - How to capture dreams upon waking
9. **Weekly Progression** - How to evolve the ritual over 4 weeks
10. **Scientific References** - Brief citations for each technique

Make it practical, calming, and scientifically grounded.`
          },
          {
            role: "user",
            content: `Create a ${duration}-minute bedtime ritual for goal: "${sleepGoal}".${challenges ? ` Sleep challenges: "${challenges}"` : ""}`
          }
        ],
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return new Response(JSON.stringify({ ritual: data.choices[0].message.content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
