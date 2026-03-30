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

    const { imageUrl } = await req.json();
    if (!imageUrl) throw new Error('imageUrl is required');

    // Deduct credits
    const { data: credits } = await supabase
      .from('photo_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits_remaining < 4) {
      throw new Error('Insufficient credits. Need 4 credits for damage detection.');
    }

    await supabase
      .from('photo_credits')
      .update({ credits_remaining: credits.credits_remaining - 4 })
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
              text: `Analyze this photo for damage and deterioration. Return a JSON object with:
- overallScore (0-100, where 100 is perfect condition)
- damages: array of objects with { type, severity (low/medium/high/severe), location, repairDifficulty (easy/moderate/hard) }
- recommendation: string with advice
- estimatedRepairCredits: number

Look for: scratches, tears, water damage, fading, discoloration, mold, creases, missing areas, foxing spots. Return ONLY valid JSON.`
            },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }],
        max_tokens: 1000,
      }),
    });

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '{}';
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const report = JSON.parse(cleaned);

    return new Response(JSON.stringify(report), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
