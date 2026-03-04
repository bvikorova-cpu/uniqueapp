import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error('Not authenticated');

    const { 
      name, 
      category, 
      description, 
      isPremium = false 
    } = await req.json();

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Check and deduct credits
    const creditsNeeded = isPremium ? 15 : 5;
    
    const { data: creditsData, error: creditsError } = await supabaseClient
      .from('character_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creditsError) throw creditsError;

    if (!creditsData) {
      // Initialize credits for new user
      await supabaseClient
        .from('character_credits')
        .insert({ user_id: user.id, credits_remaining: 0 });
      throw new Error('Insufficient credits');
    }

    if (creditsData.credits_remaining < creditsNeeded) {
      throw new Error('Insufficient credits');
    }

    // Generate backstory using AI
    const backstoryPrompt = `Create a compelling backstory for a ${category} character named "${name}". Description: ${description}. 
    Write 2-3 paragraphs that cover their origin, motivation, and what makes them unique. Be creative and engaging.`;

    const backstoryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: backstoryPrompt }
        ],
      }),
    });

    if (!backstoryResponse.ok) {
      throw new Error('Failed to generate backstory');
    }

    const backstoryData = await backstoryResponse.json();
    const backstory = backstoryData.choices[0].message.content;

    // Generate character image
    const imagePrompt = `A highly detailed ${isPremium ? 'premium quality' : 'high quality'} ${category} character named ${name}. ${description}. Full body, dynamic pose, professional character design, vibrant colors, detailed costume and features.`;

    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: imagePrompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json'
      }),
    });

    if (!imageResponse.ok) {
      throw new Error('Failed to generate character image');
    }

    const imageData = await imageResponse.json();
    const imageBase64 = `data:image/png;base64,${imageData.data[0].b64_json}`;

    // Generate random stats
    const generateStat = () => Math.floor(Math.random() * (isPremium ? 100 : 80)) + (isPremium ? 50 : 20);
    
    const stats = {
      hp: Math.floor(Math.random() * 100) + 100,
      attack: generateStat(),
      defense: generateStat(),
      speed: generateStat(),
    };

    // Deduct credits
    await supabaseClient
      .from('character_credits')
      .update({ 
        credits_remaining: creditsData.credits_remaining - creditsNeeded 
      })
      .eq('user_id', user.id);

    return new Response(
      JSON.stringify({
        backstory,
        imageUrl: imageBase64,
        stats,
        creditsUsed: creditsNeeded
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in create-character function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
