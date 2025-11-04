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

    console.log(`Generating paint-by-numbers template for: ${title}`);

    // Step 1: Generate black and white template with numbers
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
            content: `Create a simple black and white paint-by-numbers template: ${title}${description ? ` - ${description}` : ''}.

Requirements:
- BLACK OUTLINES on WHITE background
- 8 regions labeled with numbers 1-8
- Large, clear numbers in each region
- Simple shapes for children
- Thick borders between regions
- 800x600 pixels`
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!templateResponse.ok) {
      const errorText = await templateResponse.text();
      console.error("AI Gateway error:", templateResponse.status, errorText);
      throw new Error(`AI Gateway error: ${templateResponse.status}`);
    }

    const templateData = await templateResponse.json();
    const templateImageUrl = templateData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!templateImageUrl) {
      throw new Error("No template generated");
    }

    console.log("Step 1 done. Now coloring the same template...");

    // Step 2: Color THE SAME template - NO NUMBERS
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
            content: [
              {
                type: "text",
                text: `Color this image. Each numbered region should be filled with solid color:
Region 1 = sky blue
Region 2 = bright green  
Region 3 = sunny yellow
Region 4 = soft pink
Region 5 = brown
Region 6 = ocean blue
Region 7 = lavender purple
Region 8 = white

CRITICAL REQUIREMENTS:
- DELETE ALL NUMBERS from the image
- NO TEXT should remain visible
- Keep the exact same outlines and shapes
- Fill regions completely with solid colors
- Make it look like a finished colored picture WITHOUT any numbers`
              },
              {
                type: "image_url",
                image_url: {
                  url: templateImageUrl
                }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!coloredResponse.ok) {
      const errorText = await coloredResponse.text();
      console.error("AI Gateway error for coloring:", coloredResponse.status, errorText);
      throw new Error(`AI Gateway error: ${coloredResponse.status}`);
    }

    const coloredData = await coloredResponse.json();
    const coloredImageUrl = coloredData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!coloredImageUrl) {
      throw new Error("No colored image generated");
    }

    console.log("Success! Both images created from same template");

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
    console.error("Error in generate-paint-by-numbers:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
