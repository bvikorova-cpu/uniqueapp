import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { dreamTheme, mood } = await req.json();
    if (!dreamTheme) throw new Error("Dream theme required");

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
            content: `You are an expert sound designer and sleep scientist specializing in dream-inspired ambient soundscapes. Create detailed, personalized soundscape recipes that users can recreate using free tools or apps.

For each soundscape, provide:
1. **Soundscape Name** - A poetic title
2. **Core Layers** (3-5 ambient layers with specific descriptions, volume ratios, and recommended apps/tools)
3. **Binaural Beat Prescription** - Specific frequencies for the desired state (theta 4-8Hz for dreaming, delta 0.5-4Hz for deep sleep)
4. **Guided Visualization Script** - A 5-minute script to accompany the soundscape
5. **Recommended Listening Schedule** - When and how to listen
6. **Science Behind It** - Brief explanation of how each element affects sleep/dreams
7. **DIY Recreation Tips** - How to create similar sounds at home

Format with clear markdown headers and make it actionable.`
          },
          {
            role: "user",
            content: `Create a dream soundscape for this dream theme: "${dreamTheme}". Desired mood: ${mood}. Make it deeply immersive and scientifically grounded.`
          }
        ],
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return new Response(JSON.stringify({ soundscape: data.choices[0].message.content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
