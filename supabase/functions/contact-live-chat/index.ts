import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface Msg { role: 'system' | 'user' | 'assistant'; content: string }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const messages = Array.isArray(body?.messages) ? body.messages.slice(-20) : [];
    if (!messages.length) {
      return new Response(JSON.stringify({ error: 'messages required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const system: Msg = {
      role: 'system',
      content:
        'You are the Unique support assistant — friendly, concise, multilingual (auto-detect user language: Slovak, English, Czech, Hungarian, etc.). ' +
        'Unique is a creator platform with paid AI tools (3–5 credits each), EUR currency, age 16+ (Kids Channel 6–12). ' +
        'Help with: account, subscriptions, AI credits, payouts, profile, technical issues. ' +
        'If a question requires a human (refunds, KYC disputes, legal), tell the user to submit a ticket via the form below. ' +
        'Never invent prices or policies. Keep replies under 4 short sentences when possible. Use markdown.',
    };

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [system, ...messages],
        temperature: 0.4,
        max_tokens: 500,
      }),
    });

    if (!upstream.ok) {
      const t = await upstream.text();
      console.error('openai error', upstream.status, t);
      return new Response(JSON.stringify({ error: 'AI service error', status: upstream.status }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await upstream.json();
    const reply = data?.choices?.[0]?.message?.content ?? '';
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('contact-live-chat error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
