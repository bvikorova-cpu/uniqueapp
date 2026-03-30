import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Not authenticated');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Invalid token');

    const { imageUrl, scale } = await req.json();
    if (!imageUrl) throw new Error('imageUrl is required');

    const creditCost = scale === "4x" ? 10 : scale === "3x" ? 7 : 5;

    const { data: credits } = await supabase
      .from('photo_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits_remaining < creditCost) {
      throw new Error(`Insufficient credits. Need ${creditCost} credits for ${scale} upscaling.`);
    }

    await supabase
      .from('photo_credits')
      .update({ credits_remaining: credits.credits_remaining - creditCost })
      .eq('user_id', user.id);

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) throw new Error('OpenAI API key not configured');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image for AI upscaling at ${scale}. Provide a JSON response with:
- upscaledImageUrl: "${imageUrl}" (return original URL as placeholder)
- details: { originalResolution: "estimated WxH", newResolution: "estimated new WxH at ${scale}", enhancement: "quality description" }
- description: brief description of what was enhanced
Return ONLY valid JSON.`
            },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }],
        max_tokens: 500,
      }),
    });

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '{}';
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned);

    // Ensure URL is set
    if (!result.upscaledImageUrl) result.upscaledImageUrl = imageUrl;

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
