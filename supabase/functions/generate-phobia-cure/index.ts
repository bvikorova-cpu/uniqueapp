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

    const { phobiaId } = await req.json()

    if (!phobiaId) {
      throw new Error('Phobia ID is required')
    }

    const { data: phobia, error: phobiaError } = await supabaseClient
      .from('user_phobias')
      .select('*')
      .eq('id', phobiaId)
      .eq('user_id', user.id)
      .single()

    if (phobiaError || !phobia) throw new Error('Phobia not found')

    console.log('Generating cure plan for phobia:', phobia.phobia_name)

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a licensed clinical psychologist specialized in phobia treatment. Create a comprehensive 8-session treatment plan using evidence-based CBT and exposure therapy techniques. Return ONLY a JSON object with: {title: string, overview: string, sessions: [{session_number: number, title: string, goals: string[], activities: string[], homework: string[], duration_minutes: number}], expected_outcomes: string[], success_metrics: string[]}'
          },
          {
            role: 'user',
            content: `Create a personalized treatment plan for: ${phobia.phobia_name} (Type: ${phobia.phobia_type}, Severity: ${phobia.severity}/10). Description: ${phobia.description}. Current analysis: ${JSON.stringify(phobia.ai_analysis)}`
          }
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI API error:', response.status, errorText)
      throw new Error('AI cure generation failed')
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    let treatmentPlan
    try {
      treatmentPlan = JSON.parse(aiResponse)
    } catch (e) {
      throw new Error('Invalid AI response format')
    }

    const { error: insertError } = await supabaseClient
      .from('phobia_treatments')
      .insert({
        user_id: user.id,
        phobia_id: phobiaId,
        treatment_plan: treatmentPlan,
        sessions_completed: 0,
        total_sessions: 8,
        status: 'active',
      })

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({ 
        success: true, 
        treatmentPlan 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in generate-phobia-cure:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
