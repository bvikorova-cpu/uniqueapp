import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface ModResult {
  allowed: boolean;
  nsfw: boolean;
  csam_suspected: boolean;
  severity: 'none' | 'low' | 'medium' | 'high';
  categories: string[];
  reason?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { image_url } = await req.json();
    if (typeof image_url !== 'string' || !image_url.startsWith('http')) {
      return new Response(JSON.stringify({ error: 'image_url required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!OPENAI_API_KEY) {
      const result: ModResult = { allowed: true, nsfw: false, csam_suspected: false, severity: 'none', categories: [], reason: 'no_ai_key' };
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a strict image moderator. Output ONLY compact JSON: {"allowed":bool,"nsfw":bool,"csam_suspected":bool,"severity":"none|low|medium|high","categories":[...],"reason":"..."}. Categories: nudity, sexual_explicit, sexual_minors, violence_gore, hate_symbol, illegal. ZERO TOLERANCE for sexual_minors (csam_suspected=true, allowed=false). Block nudity/sexual_explicit (allowed=false). Allow swimwear, art nudity classified as low severity but allowed.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Moderate this image.' },
              { type: 'image_url', image_url: { url: image_url } },
            ],
          },
        ],
        temperature: 0,
      }),
    });
    if (resp.status === 429) {
      return new Response(JSON.stringify({ allowed: true, nsfw: false, csam_suspected: false, severity: 'none', categories: [], reason: 'rate_limited' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content ?? '{}';
    let parsed: ModResult;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      parsed = { allowed: true, nsfw: false, csam_suspected: false, severity: 'none', categories: [], reason: 'parse_fail' };
    }
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
