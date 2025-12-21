import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { imageBase64 } = await req.json();

    console.log('Scanning food for user:', user.id);

    // Check AI credits
    const creditsNeeded = 10;
    const { data: credits } = await supabaseClient
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits_remaining < creditsNeeded) {
      return new Response(JSON.stringify({ error: 'Insufficient AI credits. You need 10 credits to scan food.' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Upload image to storage
    const fileName = `${user.id}/${Date.now()}.png`;
    const imageBuffer = Uint8Array.from(atob(imageBase64.split(',')[1]), c => c.charCodeAt(0));
    
    const { error: uploadError } = await supabaseClient.storage
      .from('media')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabaseClient.storage
      .from('media')
      .getPublicUrl(fileName);

    // Analyze with OpenAI GPT-4o (vision model)
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this food image and provide detailed nutritional information. Return ONLY valid JSON with this exact structure:
{
  "foodName": "name of the food/dish",
  "calories": estimated calories (number),
  "protein": grams of protein (number),
  "carbs": grams of carbohydrates (number),
  "fats": grams of fats (number),
  "vitamins": {
    "vitaminA": "amount or N/A",
    "vitaminC": "amount or N/A",
    "calcium": "amount or N/A",
    "iron": "amount or N/A"
  },
  "healthierAlternatives": [
    {"name": "alternative 1", "reason": "why it's healthier"},
    {"name": "alternative 2", "reason": "why it's healthier"}
  ]
}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await aiResponse.text();
      console.error('OpenAI API error:', aiResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'AI analysis failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content;
    
    // Parse JSON from AI response
    let foodData;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      foodData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(analysisText);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      foodData = {
        foodName: 'Unknown Food',
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        vitamins: {},
        healthierAlternatives: []
      };
    }

    // Save scan
    const { data: foodScan, error: scanError } = await supabaseClient
      .from('food_scans')
      .insert({
        user_id: user.id,
        image_url: publicUrl,
        food_name: foodData.foodName,
        calories: foodData.calories,
        protein: foodData.protein,
        carbs: foodData.carbs,
        fats: foodData.fats,
        vitamins: foodData.vitamins,
        healthier_alternatives: foodData.healthierAlternatives
      })
      .select()
      .single();

    if (scanError) {
      console.error('Error saving scan:', scanError);
      throw scanError;
    }

    // Deduct AI credits
    await supabaseClient
      .from('ai_credits')
      .update({ 
        credits_remaining: credits.credits_remaining - creditsNeeded,
        last_used_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    // Log AI usage
    await supabaseClient
      .from('ai_usage_history')
      .insert({
        user_id: user.id,
        usage_type: 'food_scan',
        credits_used: creditsNeeded,
        description: `Scanned ${foodData.foodName}`
      });

    console.log('Food scan completed:', foodScan.id);

    return new Response(JSON.stringify({ scan: foodScan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in scan-food function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
