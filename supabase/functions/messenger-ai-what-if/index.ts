import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CREDIT_COST = 15;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scenario, userDetails } = await req.json();

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check credits
    const { data: credits, error: creditsError } = await supabase
      .from('messenger_ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (creditsError || !credits || credits.credits_remaining < CREDIT_COST) {
      return new Response(JSON.stringify({ error: 'Insufficient credits', required: CREDIT_COST }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Generate story
    const storyResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a creative "What If" life story generator. Create an engaging, detailed alternative life story based on a different life decision.
            
            The story should:
            - Be 300-400 words
            - Include specific details and scenes
            - Show both positive outcomes and challenges
            - Feel personal and relatable
            - End with a thoughtful reflection
            
            Return a JSON object with:
            {
              "title": "catchy title for this alternative life",
              "story": "the full story text",
              "keyMoments": ["moment1", "moment2", "moment3"],
              "alternativeYou": "brief description of who you became",
              "lifeLesson": "wisdom from this alternative path",
              "imagePrompt": "detailed prompt for generating an image representing this life"
            }`
          },
          {
            role: 'user',
            content: `Create a "What If" story for this scenario: "${scenario}". ${userDetails ? `Additional details: ${userDetails}` : ''}`
          }
        ],
      }),
    });

    if (!storyResponse.ok) {
      if (storyResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI service error: ${storyResponse.status}`);
    }

    const storyData = await storyResponse.json();
    let story;
    
    try {
      const content = storyData.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      story = jsonMatch ? JSON.parse(jsonMatch[0]) : { story: content };
    } catch {
      story = { story: storyData.choices[0].message.content };
    }

    // Generate accompanying image
    let imageUrl = null;
    const imagePrompt = story.imagePrompt || `A dreamlike artistic representation of an alternative life path: ${scenario}. Style: surreal, hopeful, cinematic lighting, warm colors, high quality digital art with a person in the scene.`;
    
    const imageResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Describe this scene for an image: ${imagePrompt}`
        }]
      }),
    });

    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    }

    // Deduct credits
    await supabase
      .from('messenger_ai_credits')
      .update({ credits_remaining: credits.credits_remaining - CREDIT_COST })
      .eq('user_id', user.id);

    return new Response(JSON.stringify({ 
      ...story,
      imageUrl,
      creditsUsed: CREDIT_COST
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('What If error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
