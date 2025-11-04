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
    const { title, description } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating paint-by-numbers for: ${title}`);

    // Generate template with numbers
    const templateResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: `Simple paint-by-numbers coloring page: ${title}. BLACK outlines on WHITE background. Numbers 1, 2, 3, 4, 5, 6, 7, 8 inside regions. Child-friendly. 800x600px.`
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!templateResponse.ok) {
      throw new Error(`Template error: ${templateResponse.status}`);
    }

    const templateData = await templateResponse.json();
    const templateImageUrl = templateData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!templateImageUrl) {
      throw new Error("No template generated");
    }

    console.log("Template done. Creating colored version...");

    // Generate colored version WITHOUT numbers
    const coloredResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: `Cute colorful illustration: ${title}. Bright colors. Simple shapes. Children's book style. NO numbers. NO text. Clean finished artwork. 800x600px.`
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!coloredResponse.ok) {
      throw new Error(`Colored error: ${coloredResponse.status}`);
    }

    const coloredData = await coloredResponse.json();
    const coloredImageUrl = coloredData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!coloredImageUrl) {
      throw new Error("No colored image generated");
    }

    console.log("Success!");

    return new Response(
      JSON.stringify({ 
        coloredImageUrl,
        templateImageUrl 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
