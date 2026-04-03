import { corsHeaders } from '@supabase/supabase-js/cors'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const systemMessage = {
      role: 'system',
      content: `You are the AI Mood Therapist for the Emotion Economy Network. You analyze users' emotional portfolios and provide investment advice for emotional assets.

Your expertise includes:
- Analyzing emotional balance (joy, love, motivation, peace, excitement, sadness, anger, fear)
- Recommending optimal emotion trades (buy low, sell high)
- Suggesting mining strategies to earn commission
- Providing emotional wellness tips tied to portfolio management
- Predicting emotion market trends

Keep responses concise, engaging, and use emoji. Format advice with markdown. Be encouraging but realistic about emotional investments.`,
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...messages.slice(-10)],
        max_tokens: 500,
        temperature: 0.8,
      }),
    })

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || 'I apologize, I could not process that. Please try again.'

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('AI Mood Therapist error:', error)
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
