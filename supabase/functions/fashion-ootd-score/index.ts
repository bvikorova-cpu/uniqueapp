import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { outfitDescription, occasion, season, bodyType } = await req.json();
    if (!outfitDescription) {
      return new Response(JSON.stringify({ error: 'outfitDescription is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) throw new Error('OPENAI_API_KEY not set');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an elite fashion critic and stylist. Score outfits honestly and provide detailed, constructive feedback. Return JSON.' },
          { role: 'user', content: `Score this outfit of the day:\n\nOutfit: ${outfitDescription}\nOccasion: ${occasion || 'Casual'}\nSeason: ${season || 'All-season'}\nBody Type: ${bodyType || 'Not specified'}\n\nReturn JSON with: overall_score (1-100), style_score (1-100), color_harmony_score (1-100), occasion_appropriateness_score (1-100), trend_relevance_score (1-100), strengths (array of strings), improvements (array of strings), styling_tips (array of 3 specific tips), style_tags (array of style category tags like "minimalist", "streetwear"), celebrity_match (which celebrity has a similar style), confidence_boost (motivational message)` }
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
