import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userProfile } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages array is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) throw new Error('OPENAI_API_KEY not set');

    const systemPrompt = `You are Luna, an elite AI Personal Shopper and Fashion Consultant. You have encyclopedic knowledge of fashion brands, trends, styling techniques, and personal shopping strategies.

Your personality: warm, enthusiastic, highly knowledgeable, and encouraging. You use fashion terminology naturally and make clients feel confident.

${userProfile ? `Client profile: ${JSON.stringify(userProfile)}` : ''}

Guidelines:
- Suggest specific brands, items, and price ranges when relevant
- Consider body type, skin tone, lifestyle, and budget
- Reference current trends and timeless classics
- Provide outfit combinations, not just individual pieces
- Be specific with colors (e.g., "dusty rose" not just "pink")
- Include care and maintenance tips when relevant
- Always end with a follow-up question to keep helping`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;
    return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
