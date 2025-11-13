import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, difficulty } = await req.json();
    
    if (!topic || !difficulty) {
      throw new Error("Missing required fields");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a friendly art teacher for kids aged 6-12. 
Your job is to create step-by-step drawing tutorials that are fun and easy to follow.
Always:
- Use simple, encouraging language
- Break down drawings into easy steps
- Make drawing accessible and fun
- Encourage creativity and experimentation

Format your response as JSON with this structure:
{
  "title": "How to Draw a [topic]",
  "steps": [
    {
      "stepNumber": 1,
      "instruction": "Clear, simple instruction for this step",
      "tip": "Optional helpful tip"
    }
  ]
}

Create 5-8 steps depending on the difficulty level.`;

    const userPrompt = `Create a ${difficulty} difficulty drawing tutorial for: ${topic}

Please create a step-by-step tutorial that's appropriate for the ${difficulty} level!`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Too many requests. Please try again in a moment.");
      }
      if (response.status === 402) {
        throw new Error("AI credits depleted. Please add more credits to continue.");
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    // Generate images for each step using AI
    console.log("Generating images for", result.steps.length, "steps...");
    const stepsWithImages = await Promise.all(
      result.steps.map(async (step: any, index: number) => {
        try {
          const imagePrompt = `Simple, kid-friendly line drawing showing step ${index + 1} of drawing a ${topic}. ${step.instruction}. Clean, clear lines on white background, suitable for children aged 6-12 to copy. Style: educational illustration, simple cartoon style.`;
          
          const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                  content: imagePrompt
                }
              ],
              modalities: ["image", "text"]
            }),
          });

          if (!imageResponse.ok) {
            console.error(`Failed to generate image for step ${index + 1}`);
            return {
              ...step,
              image: `https://placehold.co/400x300/5b21b6/white?text=Step+${index + 1}`
            };
          }

          const imageData = await imageResponse.json();
          const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

          return {
            ...step,
            image: imageUrl || `https://placehold.co/400x300/5b21b6/white?text=Step+${index + 1}`
          };
        } catch (error) {
          console.error(`Error generating image for step ${index + 1}:`, error);
          return {
            ...step,
            image: `https://placehold.co/400x300/5b21b6/white?text=Step+${index + 1}`
          };
        }
      })
    );

    const tutorialWithImages = {
      ...result,
      steps: stepsWithImages
    };

    return new Response(JSON.stringify(tutorialWithImages), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in kids-drawing-tutorial:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
