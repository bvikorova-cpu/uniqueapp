import { requireAiCredits } from "../_shared/credit-check.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const __auth = await requireAiCredits(req, corsHeaders, { credits: 1, usageType: "ai_mood_therapist" });
    if (__auth.errorResponse) return __auth.errorResponse;
    const __deduct = __auth.deduct!;
    const { messages, systemPrompt } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const DEFAULT_PROMPT = `You are the AI Mood Therapist for the Emotion Economy Network. You analyze users' emotional portfolios and provide investment advice for emotional assets.

Your expertise includes:
- Analyzing emotional balance (joy, love, motivation, peace, excitement, sadness, anger, fear)
- Recommending optimal emotion trades (buy low, sell high)
- Suggesting mining strategies to earn commission
- Providing emotional wellness tips tied to portfolio management
- Predicting emotion market trends

Keep responses concise, engaging, and use emoji. Format advice with markdown. Be encouraging but realistic about emotional investments.`;

    const systemMessage = {
      role: 'system',
      content: typeof systemPrompt === "string" && systemPrompt.trim().length > 0
        ? systemPrompt
        : DEFAULT_PROMPT,
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [systemMessage, ...messages.slice(-10)],
        max_completion_tokens: 500,
      }),
    })

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || 'I apologize, I could not process that. Please try again.'

    await __deduct().catch((e) => console.error("deduct failed:", e));
    return new Response(JSON.stringify({
      reply,
      choices: [{ message: { role: 'assistant', content: reply } }],
    }), {
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
