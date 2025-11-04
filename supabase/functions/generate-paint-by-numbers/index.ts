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
            content: `Create a black and white paint-by-numbers coloring template for children: ${title}${description ? ` - ${description}` : ''}.

CRITICAL Requirements:
- BLACK OUTLINES on WHITE background ONLY
- NO colors at all, completely black and white
- 8 distinct regions with numbers 1-8
- Numbers LARGE and clearly visible inside each region
- Simple, child-friendly shapes
- Clear thick borders between all regions
- Each number appears multiple times
- Coloring book style
- 800x600 pixels`
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!templateResponse.ok) {
      const errorText = await templateResponse.text();
      console.error("AI Gateway error for template:", templateResponse.status, errorText);
      throw new Error(`AI Gateway error: ${templateResponse.status}`);
    }

    const templateData = await templateResponse.json();
    const templateImageUrl = templateData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!templateImageUrl) {
      throw new Error("No template generated");
    }

    console.log("Template generated, now creating colored version...");

    // Step 2: Create colored version by editing the template
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
                text: `Color this paint-by-numbers template perfectly. Fill each numbered region with these colors:
1 = Sky Blue (#87CEEB)
2 = Grass Green (#90EE90)
3 = Sunny Yellow (#FFD700)
4 = Rose Pink (#FFB6C1)
5 = Earth Brown (#D2691E)
6 = Ocean Blue (#4682B4)
7 = Lavender Purple (#E6E6FA)
8 = Bright White (#FFFFFF)

IMPORTANT: 
- Keep the EXACT same outlines and structure
- Remove all numbers after coloring
- Fill regions completely with solid colors
- Make it look like a finished coloring page`
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
      console.error("AI Gateway error for colored version:", coloredResponse.status, errorText);
      throw new Error(`AI Gateway error: ${coloredResponse.status}`);
    }

    const coloredData = await coloredResponse.json();
    const coloredImageUrl = coloredData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!coloredImageUrl) {
      throw new Error("No colored version generated");
    }

    console.log("Successfully generated both images");

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
