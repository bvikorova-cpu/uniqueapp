import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CREDIT_COST = 1;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error("Not authenticated");
    }
    
    const userId = userData.user.id;

    const { messages, deductCredit } = await req.json();
    
    // Check and deduct credits if requested
    if (deductCredit) {
      // Get current credits
      const { data: creditsData, error: creditsError } = await supabaseClient
        .from("astrology_credits")
        .select("credits_remaining")
        .eq("user_id", userId)
        .single();
      
      if (creditsError || !creditsData) {
        throw new Error("Could not fetch credits. Please purchase credits first.");
      }
      
      if (creditsData.credits_remaining < CREDIT_COST) {
        throw new Error(`Insufficient credits. You need ${CREDIT_COST} credit per message.`);
      }
      
      // Deduct credit
      const { error: updateError } = await supabaseClient
        .from("astrology_credits")
        .update({ 
          credits_remaining: creditsData.credits_remaining - CREDIT_COST,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);
      
      if (updateError) {
        console.error("Error deducting credits:", updateError);
        throw new Error("Failed to deduct credits");
      }
      
      console.log(`[ASTROLOGY-CHAT] Deducted ${CREDIT_COST} credit from user ${userId}`);
    }
    
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const systemPrompt = `You are a mystical AI advisor specializing in astrology, tarot, numerology, and spiritual guidance. 
You are wise, compassionate, and insightful. Provide helpful, meaningful responses that blend ancient wisdom with modern understanding.
Keep responses concise (2-4 paragraphs) but meaningful. Use emojis occasionally to add warmth. 🔮✨`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const assistantResponse = aiData.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in astrology-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
