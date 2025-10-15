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
    const { title, characters, theme } = await req.json();
    
    if (!title || !characters || !theme) {
      throw new Error("Missing required fields");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Generate story text
    const storyPrompt = `Create a magical children's story with these details:
Title: ${title}
Characters: ${characters}
Theme/Setting: ${theme}

Write an engaging, age-appropriate story (300-500 words) that is fun, educational, and has a positive message. Make it creative and imaginative!

Format your response as JSON:
{
  "story": "The complete story text here"
}`;

    const storyResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a creative children's story writer. Create engaging, fun, and age-appropriate stories." },
          { role: "user", content: storyPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!storyResponse.ok) {
      if (storyResponse.status === 429) {
        throw new Error("Too many requests. Please try again in a moment.");
      }
      if (storyResponse.status === 402) {
        throw new Error("AI credits depleted. Please add more credits to continue.");
      }
      const errorText = await storyResponse.text();
      console.error("AI gateway error:", storyResponse.status, errorText);
      throw new Error("Failed to get AI response");
    }

    const storyData = await storyResponse.json();
    const storyContent = JSON.parse(storyData.choices[0].message.content);

    // Generate illustration
    const illustrationPrompt = `Create a colorful, child-friendly illustration for this story: ${title}. Theme: ${theme}. Characters: ${characters}. Make it magical, vibrant, and fun for kids aged 6-12.`;

    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          { role: "user", content: illustrationPrompt }
        ]
      }),
    });

    let illustrationUrl = null;
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      illustrationUrl = imageData.choices[0]?.message?.content;
    }

    return new Response(JSON.stringify({
      title,
      story: storyContent.story,
      illustration: illustrationUrl
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in kids-story-creator:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
