import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const { type } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

    const CREDIT_COSTS: Record<string, number> = {
      rarity_prediction: 10,
      box_strategy: 8,
    };

    const cost = CREDIT_COSTS[type] || 10;

    // Check and deduct credits
    const { data: credits } = await supabaseClient
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits_remaining < cost) {
      return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    await supabaseClient.from('ai_credits').update({
      credits_remaining: credits.credits_remaining - cost
    }).eq('user_id', user.id);

    await supabaseClient.from('ai_usage_history').insert({
      user_id: user.id,
      usage_type: `mystery_box_${type}`,
      credits_used: cost,
      description: `Mystery Box AI: ${type}`
    });

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'rarity_prediction') {
      // Get user's opening history
      const { data: history } = await supabaseClient
        .from('user_collectibles')
        .select('*, collectibles(*, collectible_rarities(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      const historyText = history?.map(h => 
        `${h.collectibles?.name} (${h.collectibles?.collectible_rarities?.name || 'unknown'}) - ${new Date(h.created_at).toLocaleDateString()}`
      ).join('\n') || 'No history available';

      systemPrompt = `You are an expert AI analyst for a mystery box gacha system. Analyze the user's collection history and provide strategic predictions and recommendations. Be engaging, data-driven, and specific. Use emojis sparingly for visual appeal. Format with clear sections using headers.`;
      
      userPrompt = `Analyze my mystery box history and provide a comprehensive prediction report:

My Recent Collection History:
${historyText}

Available Box Tiers: Basic (50 credits), Silver (100), Gold (200), Platinum (350), Diamond (500), Cosmic (750), Supreme (1000), Celestial (1500), Universe (2500)

Provide:
1. 📊 **Drop Rate Analysis** - Patterns in my rarity distribution
2. 🎯 **Best Box Recommendation** - Which box tier offers best value-for-money right now
3. 🔮 **Lucky Streak Prediction** - Based on patterns, when is the best time to open
4. 💡 **Strategy Tips** - How to maximize legendary drop chances
5. 📈 **Collection Score** - Rate my collection diversity (1-100)
6. 🏆 **Next Target** - What rarity/item should I aim for next`;
    } else if (type === 'box_strategy') {
      systemPrompt = `You are a mystery box strategy expert. Provide concise, actionable advice.`;
      userPrompt = `Give me a quick strategy guide for the mystery box system with tiers from 50 to 2500 credits. Focus on budget optimization and when to go for expensive boxes.`;
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.8,
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error('OpenAI error:', errText);
      throw new Error('AI service error');
    }

    const aiData = await openaiRes.json();
    const prediction = aiData.choices[0]?.message?.content || 'Unable to generate prediction';

    return new Response(JSON.stringify({ prediction }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
