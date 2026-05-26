import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const __auth = await requireAiCredits(req, corsHeaders, { credits: 5, usageType: "character_image" });
    if (__auth.errorResponse) return __auth.errorResponse;
    const __deduct = __auth.deduct!;
    const { characterName, hairColor, eyeColor, costumeColor, superpower, ageGroup, personality, gender, skinColor, characterType } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Build a detailed prompt from all attributes
    const genderDesc = gender === "Heroine" ? "female" : gender === "Hero" ? "male" : "gender-neutral";
    const ageDesc = ageGroup || "kid";
    const skinDesc = skinColor ? `${skinColor} skin tone` : "";
    const hairDesc = hairColor ? `${hairColor} hair` : "";
    const eyeDesc = eyeColor ? `clearly visible ${eyeColor} colored eyes (IMPORTANT: the eyes MUST be ${eyeColor})` : "";
    const costumeDesc = costumeColor ? `wearing a ${costumeColor} colored costume/outfit (IMPORTANT: the costume MUST be ${costumeColor} colored, NOT any other color)` : "";
    const powerDesc = superpower || "superhero";
    const personalityDesc = personality ? `with a ${personality} personality` : "";

    const prompt = `Create an adorable, highly expressive cartoon character image of a ${genderDesc} ${ageDesc} superhero named "${characterName}". 
The character MUST have these EXACT features - follow them precisely:
- ${skinDesc}
- ${hairDesc}
- ${eyeDesc}
- ${costumeDesc}
- Superpower theme: ${powerDesc}
- ${personalityDesc}

Style: Disney/Pixar 3D animated character with big expressive eyes, exaggerated proportions for cuteness, smooth rounded shapes, vibrant saturated colors, and a joyful friendly smile. The character should have a dynamic playful pose with personality, glossy cartoon shading, and be placed on a simple colorful gradient background. Make it look like a professional animated movie character - cheerful, energetic, and irresistibly cute! Ultra high resolution.

CRITICAL: Pay very close attention to the eye color (${eyeColor || "blue"}), costume/outfit color (${costumeColor || "blue"}), hair color (${hairColor || "brown"}), and skin tone (${skinColor || "medium"}). These must match EXACTLY as specified.`;

    console.log('Generating character image with OpenAI:', characterName, 'hair:', hairColor, 'eyes:', eyeColor, 'costume:', costumeColor, 'skin:', skinColor);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: "gpt-image-1", prompt: prompt, n: 1, size: "1024x1024" }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Failed to generate image: ${errorText}`);
    }

    const data = await response.json();
    console.log('AI response received');
    
    const imageUrl = (data.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : null);

    if (!imageUrl) {
      console.error('No image in response:', data);
      throw new Error('No image generated');
    }

    console.log('Character image generated successfully');

    await __deduct().catch((e) => console.error("deduct failed:", e));
    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating character image:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate image' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
