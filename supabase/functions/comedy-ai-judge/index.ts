import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, target, content, style } = await req.json();
    const openaiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!openaiKey) throw new Error("LOVABLE_API_KEY not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "roast") {
      systemPrompt = `You are a professional comedy roast judge. Score the roast on creativity (1-10), delivery (1-10), and humor (1-10). Also provide brief feedback and bonus_coins (0-20 based on quality). Respond in JSON: { "creativity": number, "delivery": number, "humor": number, "feedback": "string", "bonus_coins": number }`;
      userPrompt = `Target: ${target}\nRoast: ${content}`;
    } else if (type === "workshop_feedback") {
      systemPrompt = `You are an AI comedy coach. Analyze the joke for timing (1-10) and originality (1-10). Provide analysis text and an improved version. Respond in JSON: { "timing": number, "originality": number, "analysis": "string", "improved_version": "string" }`;
      userPrompt = `Style: ${style}\nJoke: ${content}`;
    } else if (type === "generate_joke") {
      systemPrompt = `You are a professional comedy writer. Generate a funny, original joke in the specified style. Respond in JSON: { "joke": "string" }`;
      userPrompt = `Generate a joke in the "${style}" comedy style. Include setup and punchline.`;
    } else {
      throw new Error("Invalid type");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
