import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const { role, interview_type = 'behavioral', difficulty = 'medium', transcript = [], action } = await req.json()
    if (!role) return json({ error: 'role required' }, 400)

    const sys = `You are an expert interviewer for a ${role} role. Type: ${interview_type}. Difficulty: ${difficulty}.
- If action="next_question": ask ONE concise interview question.
- If action="evaluate": rate the candidate 0-100 and give 3 strengths + 3 improvements in markdown.
Reply in plain text/markdown.`

    const messages = [
      { role: 'system', content: sys },
      ...transcript.map((t: any) => ({ role: t.role, content: t.content })),
      { role: 'user', content: action === 'evaluate' ? 'Evaluate the entire conversation now.' : 'Ask the next question.' },
    ]

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages }),
    })
    if (!r.ok) return json({ error: 'AI error', detail: await r.text() }, r.status)
    const data = await r.json()
    return json({ result: data.choices?.[0]?.message?.content ?? '' })
  } catch (e: any) {
    return json({ error: e.message }, 500)
  }
})

function json(o: any, s = 200) {
  return new Response(JSON.stringify(o), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}
