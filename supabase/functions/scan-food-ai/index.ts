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

    // Check credits
    const { data: credits } = await supabase
      .from('cooking_credits')
      .select('credits, subscription_tier')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits < 1) {
      return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { image_base64 } = await req.json();
    console.log('Analyzing food image');

    // Upload image to storage
    const timestamp = Date.now();
    const filename = `${user.id}/${timestamp}.jpg`;
    
    const imageData = image_base64.split(',')[1];
    const bytes = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(filename, bytes, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filename);

    // Call Lovable AI with vision
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const prompt = `Analyze this food and return JSON:
{
  "recognized_items": [
    { "name": "food name", "portion": "portion size" }
  ],
  "nutritional_info": {
    "total_calories": 450,
    "protein_g": 25,
    "carbs_g": 45,
    "fats_g": 15,
    "fiber_g": 5
  },
  "healthier_alternatives": [
    { "original": "original food", "alternative": "healthier option", "benefits": "health benefits" }
  ]
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: publicUrl } }
          ]
        }],
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
    const { data: savedScan } = await supabase
      .from('food_scans_ai')
      .insert({
        user_id: user.id,
        image_url: publicUrl,
        recognized_items: analysisData.recognized_items || [],
        nutritional_info: analysisData.nutritional_info || {},
        healthier_alternatives: analysisData.healthier_alternatives || [],
        credits_used: 1
      })
      .select()
      .single();

    // Deduct credits
    await supabase
      .from('cooking_credits')
      .update({ credits: credits.credits - 1 })
      .eq('user_id', user.id);

    console.log('Food scan completed successfully');

    return new Response(JSON.stringify({ 
      analysis: analysisData,
      scan_id: savedScan.id,
      image_url: publicUrl,
      credits_remaining: credits.credits - 1
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scan-food-ai:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});