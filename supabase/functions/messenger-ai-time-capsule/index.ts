import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CREDIT_COST = 5;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, deliveryDate, recipientId, generateImage } = await req.json();

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

    let futureImageUrl = null;

    // Generate AI "future you" image if requested
    if (generateImage) {
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      if (OPENAI_API_KEY) {
        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: `Generate a beautiful, hopeful artistic image representing a time capsule message being opened in the future. The image should show a warm, nostalgic scene with soft golden light, perhaps showing hands opening a glowing envelope or a magical time capsule. Style: dreamy, ethereal, warm colors, high quality digital art. Include subtle sparkles and light rays to convey the magic of receiving a message from the past.`,
            n: 1,
            size: '1024x1024'
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          futureImageUrl = imageData.data?.[0]?.url;
        }
      }
    }

    // Deduct credits
    await supabase
      .from('messenger_ai_credits')
      .update({ credits_remaining: credits.credits_remaining - CREDIT_COST })
      .eq('user_id', user.id);

    // Store time capsule in messages with scheduled delivery
    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: recipientId,
        content: message,
        is_time_capsule: true,
        scheduled_delivery: deliveryDate,
        time_capsule_image: futureImageUrl,
      });

    if (insertError) {
      console.error('Insert error:', insertError);
    }

    return new Response(JSON.stringify({ 
      success: true,
      deliveryDate,
      imageGenerated: !!futureImageUrl,
      creditsUsed: CREDIT_COST
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Time capsule error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
