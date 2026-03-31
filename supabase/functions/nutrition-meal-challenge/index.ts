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

    const { goal, duration_days, max_participants } = await req.json();

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) throw new Error('OpenAI API key not configured');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a gamification expert for healthy eating challenges. Create engaging competitive meal challenges. Return JSON: { "challenge_name": "string", "tagline": "string", "xp_reward": number, "daily_tasks": [{"day": number, "task": "string", "points": number}], "rules": ["string"], "rewards": [{"place": "1st/2nd/3rd", "reward": "string"}] }' },
          { role: 'user', content: `Goal: ${goal}\nDuration: ${duration_days} days\nMax participants: ${max_participants}\n\nCreate an engaging meal challenge.` }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" }
      })
    });

    const aiData = await response.json();
    const challenge = JSON.parse(aiData.choices[0].message.content);

    return new Response(JSON.stringify({ challenge }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
