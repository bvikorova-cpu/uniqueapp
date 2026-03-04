import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
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

    // Generate tutorial text
    const textResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!textResponse.ok) {
      const errorText = await textResponse.text();
      console.error("OpenAI text API error:", textResponse.status, errorText);
      
      if (textResponse.status === 429) {
        throw new Error("Too many requests. Please try again in a moment.");
      }
      throw new Error("Failed to get AI response");
    }

    const textData = await textResponse.json();
    const content = textData.choices[0].message.content;
    const result = JSON.parse(content);

    // Generate images for each step using OpenAI
    console.log("Generating images for", result.steps.length, "steps...");
    const stepsWithImages = await Promise.all(
      result.steps.map(async (step: any, index: number) => {
        try {
          const imagePrompt = `Simple, kid-friendly line drawing showing step ${index + 1} of drawing a ${topic}. ${step.instruction}. Clean, clear lines on white background, suitable for children aged 6-12 to copy. Style: educational illustration, simple cartoon style.`;
          
          const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-image-1",
              prompt: imagePrompt,
              n: 1,
              size: "1024x1024",
              quality: "medium",
              output_format: "webp",
              output_compression: 85,
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
          const base64Image = imageData.data?.[0]?.b64_json;

          if (!base64Image) {
            return {
              ...step,
              image: `https://placehold.co/400x300/5b21b6/white?text=Step+${index + 1}`
            };
          }

          return {
            ...step,
            image: `data:image/webp;base64,${base64Image}`
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
