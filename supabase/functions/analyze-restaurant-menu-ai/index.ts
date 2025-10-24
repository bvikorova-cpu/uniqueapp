import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check credits (2 credits for restaurant analysis)
    const { data: credits } = await supabase
      .from('cooking_credits')
      .select('credits, subscription_tier')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits < 2) {
      return new Response(JSON.stringify({ error: 'Nedostatok kreditov (potrebné 2)' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { restaurant_name, menu_image_base64 } = await req.json();
    console.log('Analyzing restaurant menu:', restaurant_name);

    let menuImageUrl = null;
    if (menu_image_base64) {
      // Upload image to storage
      const timestamp = Date.now();
      const filename = `${user.id}/menu_${timestamp}.jpg`;
      
      const imageData = menu_image_base64.split(',')[1];
      const bytes = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filename, bytes, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filename);
      
      menuImageUrl = publicUrl;
    }

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const prompt = `Analyzuj menu reštaurácie "${restaurant_name}" a vráť JSON:
{
  "menu_items": [
    {
      "name": "názov jedla",
      "estimated_calories": 650,
      "healthiness_score": 7,
      "pros": ["výhoda 1"],
      "cons": ["nevýhoda 1"]
    }
  ],
  "top_recommendations": [
    {
      "name": "najzdravšie jedlo",
      "reason": "prečo je dobré",
      "calories": 450
    }
  ],
  "items_to_avoid": [
    {
      "name": "menej zdravé jedlo",
      "reason": "prečo sa vyhnúť"
    }
  ]
}`;

    const messages = menuImageUrl 
      ? [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: menuImageUrl } }
          ]
        }]
      : [{ role: 'user', content: prompt }];

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    let analysisData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysisData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      analysisData = {};
    }

    // Save to database
    const { data: savedAnalysis } = await supabase
      .from('restaurant_analyses')
      .insert({
        user_id: user.id,
        restaurant_name,
        menu_image_url: menuImageUrl,
        analysis: analysisData.menu_items || [],
        recommendations: {
          top: analysisData.top_recommendations || [],
          avoid: analysisData.items_to_avoid || []
        },
        credits_used: 2
      })
      .select()
      .single();

    // Deduct credits
    await supabase
      .from('cooking_credits')
      .update({ credits: credits.credits - 2 })
      .eq('user_id', user.id);

    console.log('Restaurant menu analyzed successfully');

    return new Response(JSON.stringify({ 
      analysis: analysisData,
      analysis_id: savedAnalysis.id,
      credits_remaining: credits.credits - 2
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-restaurant-menu-ai:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});