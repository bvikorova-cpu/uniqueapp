import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (userError || !user) throw new Error('Unauthorized')

    const { description } = await req.json()

    if (!description) {
      throw new Error('Description is required')
    }

    console.log('Detecting phobia for user:', user.id)

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional psychologist specialized in phobia detection. Analyze the description and identify specific phobias. Return ONLY a JSON object with: {phobia_name: string, phobia_type: string, severity: number (1-10), analysis: string, triggers: string[], coping_strategies: string[]}. Be precise and clinical.'
          },
          {
            role: 'user',
            content: description
          }
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI API error:', response.status, errorText)
      throw new Error('AI detection failed')
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    let phobiaData
    try {
      phobiaData = JSON.parse(aiResponse)
    } catch (e) {
      throw new Error('Invalid AI response format')
    }

    const { error: insertError } = await supabaseClient
      .from('user_phobias')
      .insert({
        user_id: user.id,
        phobia_name: phobiaData.phobia_name,
        phobia_type: phobiaData.phobia_type,
        severity: phobiaData.severity,
        description: description,
        ai_analysis: {
          analysis: phobiaData.analysis,
          triggers: phobiaData.triggers,
          coping_strategies: phobiaData.coping_strategies
        },
        source: 'detected',
        status: 'active',
      })

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({ 
        success: true, 
        phobia: phobiaData 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in detect-phobia:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
