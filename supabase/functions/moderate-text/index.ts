import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface ModResult {
  allowed: boolean;
  severity: 'none' | 'low' | 'medium' | 'high';
  categories: string[];
  reason?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { text } = await req.json();
    if (typeof text !== 'string' || text.length === 0) {
      return new Response(JSON.stringify({ error: 'text required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (text.length > 8000) {
      return new Response(JSON.stringify({ error: 'text too long' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!OPENAI_API_KEY) {
      // Fail-open with deny-list fallback if AI gateway unconfigured.
      const denylist = /\b(kill yourself|kys|n[i1]gg[ae3]r|f[a4]gg[o0]t|child porn|csam)\b/i;
      const allowed = !denylist.test(text);
      const result: ModResult = {
        allowed,
        severity: allowed ? 'none' : 'high',
        categories: allowed ? [] : ['hate_or_harassment'],
      };
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
              'You are a content moderator. Classify the user message. Return ONLY compact JSON like {"allowed":true|false,"severity":"none|low|medium|high","categories":[...],"reason":"..."}. Categories: hate, harassment, sexual_minors, sexual_explicit, violence, self_harm, illegal, spam. Block (allowed=false) only on severity medium+ for harassment/hate/violence/self_harm, or any severity for sexual_minors/illegal. Be tolerant of profanity and adult flirty content.',
          },
          { role: 'user', content: text },
        ],
        temperature: 0,
      }),
    });
    if (resp.status === 429) {
      return new Response(JSON.stringify({ allowed: true, severity: 'none', categories: [], reason: 'rate_limited' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content ?? '{}';
    let parsed: ModResult;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      parsed = { allowed: true, severity: 'none', categories: [], reason: 'parse_fail' };
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
