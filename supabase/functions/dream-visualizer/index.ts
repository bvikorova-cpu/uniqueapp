import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { dreamDescription, artStyle } = await req.json();
    if (!dreamDescription) throw new Error("Dream description required");

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OpenAI API key not configured");

    const stylePrompts: Record<string, string> = {
      "surrealist": "in the style of Salvador Dalí surrealism, melting forms, impossible architecture",
      "watercolor": "ethereal watercolor painting, soft edges, translucent dreamy colors",
      "digital-fantasy": "high quality digital fantasy art, magical lighting, detailed scenery",
      "abstract": "abstract expressionism, bold colors, emotional brushstrokes",
      "anime": "anime style illustration, detailed backgrounds, Studio Ghibli inspired",
      "dark-gothic": "dark gothic art, dramatic shadows, moonlit atmosphere, mysterious",
    };

    const styleDesc = stylePrompts[artStyle] || stylePrompts["surrealist"];

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `Create a dreamlike artistic visualization: ${dreamDescription}. Style: ${styleDesc}. Make it surreal, atmospheric, and visually stunning.`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      }),
    });

    const result = await response.json();
    if (result.error) throw new Error(result.error.message);

    return new Response(JSON.stringify({ imageUrl: result.data[0].url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
