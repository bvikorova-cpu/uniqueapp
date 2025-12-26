import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Content is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[ANALYZE-EMOTION] User ${user.id} requesting emotion analysis`);

    // Rate limit check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.ai_generation, corsHeaders, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    // Check user credits using service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let { data: credits, error: creditsError } = await supabaseAdmin
      .from('emotion_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Create credits record if doesn't exist (with 10 free credits)
    if (!credits) {
      const { data: newCredits, error: insertError } = await supabaseAdmin
        .from('emotion_credits')
        .insert({ user_id: user.id, credits_remaining: 10, total_credits_purchased: 0 })
        .select()
        .single();
      
      if (insertError) {
        console.error('[ANALYZE-EMOTION] Error creating credits:', insertError);
        return new Response(JSON.stringify({ error: 'Failed to initialize credits' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      credits = newCredits;
    }

    // Check if user has credits
    if (credits.credits_remaining < 1) {
      console.log(`[ANALYZE-EMOTION] User ${user.id} has no credits remaining`);
      return new Response(JSON.stringify({ 
        error: 'No credits remaining',
        credits_remaining: 0,
        needs_purchase: true
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[ANALYZE-EMOTION] User has ${credits.credits_remaining} credits, proceeding with analysis`);

    // Call OpenAI to analyze emotions
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are an expert emotion analyst. Analyze the emotional content of text and return ONLY a JSON object with emotion scores from 0-100.

Return exactly this JSON structure:
{
  "joy": <number 0-100>,
  "motivation": <number 0-100>,
  "love": <number 0-100>,
  "sadness": <number 0-100>,
  "anger": <number 0-100>,
  "fear": <number 0-100>,
  "excitement": <number 0-100>,
  "peace": <number 0-100>,
  "dominant_emotion": "<string: the strongest emotion>",
  "emotional_summary": "<string: 1-2 sentence summary of the emotional content>"
}

Analyze the text thoroughly and provide accurate scores based on emotional intensity and frequency.`
          },
          { role: 'user', content: `Analyze this text for emotions:\n\n"${content}"` }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ANALYZE-EMOTION] OpenAI error:', errorText);
      return new Response(JSON.stringify({ error: 'AI analysis failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    console.log('[ANALYZE-EMOTION] Raw AI response:', analysisText);

    // Parse the JSON response
    let emotions;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        emotions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('[ANALYZE-EMOTION] Parse error:', parseError);
      // Fallback emotions
      emotions = {
        joy: 50,
        motivation: 50,
        love: 30,
        sadness: 10,
        anger: 5,
        fear: 5,
        excitement: 40,
        peace: 30,
        dominant_emotion: 'neutral',
        emotional_summary: 'Mixed emotional content detected.'
      };
    }

    // Deduct credit
    const { error: updateError } = await supabaseAdmin
      .from('emotion_credits')
      .update({ 
        credits_remaining: credits.credits_remaining - 1,
        total_credits_used: (credits.total_credits_used || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('[ANALYZE-EMOTION] Error updating credits:', updateError);
    }

    // Calculate emotion rewards (based on positive emotions)
    const emotionReward = {
      joy: Math.floor(emotions.joy / 20),
      motivation: Math.floor(emotions.motivation / 20),
      love: Math.floor(emotions.love / 20),
      excitement: Math.floor(emotions.excitement / 20),
      peace: Math.floor(emotions.peace / 20)
    };

    console.log(`[ANALYZE-EMOTION] Analysis complete for user ${user.id}, credit deducted`);

    return new Response(JSON.stringify({ 
      emotions,
      emotion_reward: emotionReward,
      credits_remaining: credits.credits_remaining - 1,
      credits_used: 1
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[ANALYZE-EMOTION] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
