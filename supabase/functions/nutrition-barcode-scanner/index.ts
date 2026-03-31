import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) throw new Error('Unauthorized');

    const { barcode, product_name } = await req.json();
    if (!barcode && !product_name) throw new Error('Barcode or product name required');

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) throw new Error('OpenAI API key not configured');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a food product nutrition database expert. Given a barcode or product name, provide detailed nutrition data. Return JSON: { "product_name": "string", "brand": "string", "calories": number, "serving_size": "string", "macros": {"protein": number, "carbs": number, "fat": number, "fiber": number, "sugar": number}, "health_score": number(1-10), "ingredients_analysis": "string", "healthier_alternatives": ["string"] }' },
          { role: 'user', content: `${barcode ? `Barcode: ${barcode}` : `Product: ${product_name}`}\n\nProvide full nutrition data.` }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    const aiData = await response.json();
    const product = JSON.parse(aiData.choices[0].message.content);

    return new Response(JSON.stringify({ product }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
