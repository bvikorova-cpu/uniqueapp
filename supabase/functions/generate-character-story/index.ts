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
    const __auth = await requireAiCredits(req, corsHeaders, { credits: 1, usageType: "character_story" });
    if (__auth.errorResponse) return __auth.errorResponse;
    const __deduct = __auth.deduct!;
    const { characterName, hairColor, superpower, eyeColor, costumeColor, ageGroup, personality } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const prompt = `Write a creative and engaging short story (150-200 words) for a child's character with these attributes:
    - Name: ${characterName}
    - Hair Color: ${hairColor}
    - Eye Color: ${eyeColor}
    - Superpower: ${superpower}
    - Costume Color: ${costumeColor}
    - Age Group: ${ageGroup}
    - Personality: ${personality}
    
    Make the story fun, adventurous, and age-appropriate. Include how they discovered their superpower and one heroic deed they performed. Write in a warm, storytelling style that children would love.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-5",
        messages: [
          {
            role: 'system',
            content: 'You are a creative children\'s story writer who creates engaging, fun, and age-appropriate stories for kids.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to generate story');
    }

    const data = await response.json();
    const story = data.choices?.[0]?.message?.content;

    if (!story) {
      throw new Error('No story in response');
    }

    await __deduct().catch((e) => console.error("deduct failed:", e));
    return new Response(
      JSON.stringify({ story }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating character story:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate story' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
