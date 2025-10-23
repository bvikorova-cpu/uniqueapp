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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { restaurantName, menuImageBase64 } = await req.json();

    console.log('Analyzing restaurant menu for user:', user.id);

    // Check credits
    const creditsNeeded = 25;
    const { data: credits } = await supabaseClient
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits_remaining < creditsNeeded) {
      return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check monthly limit for free users
    const { data: subscription } = await supabaseClient
      .from('nutrition_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subscription?.subscription_type === 'free') {
      const firstDay = new Date(new Date().setDate(1)).toISOString();
      const { count } = await supabaseClient
        .from('restaurant_menus')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', firstDay);

      if (count && count >= 3) {
        return new Response(JSON.stringify({ error: 'Monthly limit reached' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Upload menu image
    let menuImageUrl = null;
    if (menuImageBase64) {
      const fileName = `menus/${user.id}/${Date.now()}.png`;
      const imageBuffer = Uint8Array.from(atob(menuImageBase64.split(',')[1]), c => c.charCodeAt(0));
      
      const { error: uploadError } = await supabaseClient.storage
        .from('media')
        .upload(fileName, imageBuffer, {
          contentType: 'image/png',
          upsert: false
        });

      if (!uploadError) {
        const { data: { publicUrl } } = supabaseClient.storage
          .from('media')
          .getPublicUrl(fileName);
        menuImageUrl = publicUrl;
      }
    }

    // Analyze with Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const messages: any[] = [
      {
        role: 'user',
        content: menuImageBase64 ? [
          {
            type: 'text',
            text: `Analyze this restaurant menu for ${restaurantName}. For each dish, estimate calories and macros. Then recommend the 3 healthiest options and why. Return ONLY valid JSON with this structure:
{
  "dishes": [
    {
      "name": "dish name",
      "category": "appetizer/main/dessert/etc",
      "estimatedCalories": number,
      "protein": number,
      "carbs": number,
      "fats": number,
      "healthScore": number (1-10)
    }
  ],
  "recommendations": [
    {
      "dishName": "name",
      "reason": "why it's healthy",
      "calories": number
    }
  ]
}`
          },
          {
            type: 'image_url',
            image_url: {
              url: menuImageBase64
            }
          }
        ] : `Analyze typical menu items at ${restaurantName}. Provide estimated calories and macros for common dishes. Return JSON with dishes and recommendations arrays.`
      }
    ];

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a nutritionist analyzing restaurant menus. Always respond with valid JSON.' },
          ...messages
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'AI analysis failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content;
    
    // Parse JSON
    let analysisData;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      analysisData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(analysisText);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      analysisData = { dishes: [], recommendations: [] };
    }

    // Save analysis
    const { data: menuAnalysis, error: analysisError } = await supabaseClient
      .from('restaurant_menus')
      .insert({
        user_id: user.id,
        restaurant_name: restaurantName,
        menu_image_url: menuImageUrl,
        analysis_data: analysisData.dishes || [],
        recommendations: analysisData.recommendations || [],
        scan_count: 1
      })
      .select()
      .single();

    if (analysisError) {
      console.error('Error saving analysis:', analysisError);
      throw analysisError;
    }

    // Deduct credits
    await supabaseClient
      .from('ai_credits')
      .update({ 
        credits_remaining: credits.credits_remaining - creditsNeeded,
        last_used_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    // Log usage
    await supabaseClient
      .from('ai_usage_logs')
      .insert({
        user_id: user.id,
        feature_type: 'restaurant_analysis',
        credits_used: creditsNeeded
      });

    console.log('Restaurant menu analyzed:', menuAnalysis.id);

    return new Response(JSON.stringify({ analysis: menuAnalysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-restaurant-menu function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
