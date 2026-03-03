import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { occasion, season, preferences } = await req.json();

    // Check AI credits
    const { data: credits } = await supabaseClient
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits_remaining < 5) {
      return new Response(
        JSON.stringify({ error: 'Insufficient AI credits. Need 5 credits for outfit recommendation.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
      );
    }

    // Get user's wardrobe
    const { data: wardrobeItems } = await supabaseClient
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user.id);

    if (!wardrobeItems || wardrobeItems.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No wardrobe items found. Please add some items first.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Build wardrobe context for AI
    const wardrobeContext = wardrobeItems.map(item => 
      `${item.category}: ${item.name} (${item.color}, ${item.brand || 'no brand'}, ${item.season} season)`
    ).join('\n');

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional fashion stylist. Create outfit recommendations based on the user's wardrobe items. 
            Provide specific styling tips and suggest which items to combine.
            Return a JSON object with: 
            - description: overall outfit description
            - items: array of item names to combine
            - styling_tips: practical tips for wearing this outfit
            - accessories_suggestions: what accessories would complete the look`
          },
          {
            role: 'user',
            content: `Create an outfit for ${occasion} occasion in ${season} season.
            User preferences: ${JSON.stringify(preferences)}
            
            Available wardrobe items:
            ${wardrobeContext}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Try to parse JSON from AI response
    let outfitData;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        outfitData = JSON.parse(jsonMatch[0]);
      } else {
        outfitData = {
          description: aiResponse,
          items: [],
          styling_tips: aiResponse,
          accessories_suggestions: ''
        };
      }
    } catch (e) {
      outfitData = {
        description: aiResponse,
        items: [],
        styling_tips: aiResponse,
        accessories_suggestions: ''
      };
    }

    // Find item IDs mentioned in the outfit
    const mentionedItemIds = wardrobeItems
      .filter(item => 
        outfitData.items.some((name: string) => 
          item.name.toLowerCase().includes(name.toLowerCase()) || 
          name.toLowerCase().includes(item.name.toLowerCase())
        )
      )
      .map(item => item.id);

    // Save recommendation
    const { data: recommendation, error: saveError } = await supabaseClient
      .from('outfit_recommendations')
      .insert({
        user_id: user.id,
        occasion,
        season,
        ai_description: outfitData.description,
        item_ids: mentionedItemIds,
        styling_tips: outfitData.styling_tips + '\n\n' + (outfitData.accessories_suggestions || '')
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving recommendation:', saveError);
    }

    // Deduct credits
    await supabaseClient
      .from('ai_credits')
      .update({ credits_remaining: credits.credits_remaining - 5 })
      .eq('user_id', user.id);

    // Log usage
    await supabaseClient
      .from('ai_usage_history')
      .insert({
        user_id: user.id,
        usage_type: 'outfit_recommendation',
        credits_used: 5,
        description: `Outfit for ${occasion} in ${season}`
      });

    return new Response(
      JSON.stringify({
        recommendation,
        creditsRemaining: credits.credits_remaining - 5
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in outfit-recommender:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});