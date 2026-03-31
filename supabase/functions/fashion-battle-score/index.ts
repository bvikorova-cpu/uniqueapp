import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { outfitDescription, battleTheme } = await req.json();
    if (!outfitDescription || !battleTheme) {
      return new Response(JSON.stringify({ error: 'outfitDescription and battleTheme are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) throw new Error('OPENAI_API_KEY not set');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional fashion competition judge. Score outfits based on theme adherence, creativity, style, and overall impact. Return JSON.' },
          { role: 'user', content: `Score this outfit for a style battle:\n\nBattle Theme: ${battleTheme}\nOutfit: ${outfitDescription}\n\nReturn JSON with: theme_score (1-100), creativity_score (1-100), style_score (1-100), impact_score (1-100), overall_score (1-100), judge_commentary (detailed feedback string), standout_elements (array of strings), areas_to_improve (array of strings)` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return new Response(JSON.stringify({ score: result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
