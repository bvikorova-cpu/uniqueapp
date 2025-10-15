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

    // Generate a simple placeholder image URL for each step
    const tutorialWithImages = {
      ...result,
      steps: result.steps.map((step: any, index: number) => ({
        ...step,
        image: `https://placehold.co/400x300/5b21b6/white?text=Step+${index + 1}`
      }))
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
