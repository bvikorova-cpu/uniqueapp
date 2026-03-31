import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { outfitDescriptions, theme, mood } = await req.json();
    if (!outfitDescriptions || !Array.isArray(outfitDescriptions) || outfitDescriptions.length === 0) {
      return new Response(JSON.stringify({ error: 'outfitDescriptions array is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) throw new Error('OPENAI_API_KEY not set');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a world-class fashion show director and creative consultant. Generate detailed fashion show concepts with runway choreography, lighting design, music cues, and commentary scripts. Return JSON.' },
          { role: 'user', content: `Create a virtual fashion show concept for these outfits:\n${outfitDescriptions.map((d: string, i: number) => `Look ${i+1}: ${d}`).join('\n')}\n\nTheme: ${theme || 'Modern Elegance'}\nMood: ${mood || 'Sophisticated'}\n\nReturn JSON with: show_title, opening_statement, looks (array with: look_number, outfit_name, runway_description, music_cue, lighting_direction, commentary_script, styling_notes), finale_description, show_duration_minutes, audience_impact_score (1-100)` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return new Response(JSON.stringify({ showConcept: result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
