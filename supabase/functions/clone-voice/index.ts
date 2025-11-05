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

    const formData = await req.formData()
    const name = formData.get('name') as string
    const description = formData.get('description') as string || ''
    const audioFile = formData.get('audio') as File

    if (!name || !audioFile) {
      throw new Error('Name and audio file are required')
    }

    console.log('Creating voice clone:', { name, description, fileSize: audioFile.size })

    // Create voice clone using ElevenLabs API
    const elevenLabsFormData = new FormData()
    elevenLabsFormData.append('name', name)
    elevenLabsFormData.append('description', description)
    elevenLabsFormData.append('files', audioFile)

    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY') || '',
      },
      body: elevenLabsFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs API error:', response.status, errorText)
      throw new Error(`Failed to clone voice: ${errorText}`)
    }

    const result = await response.json()
    console.log('Voice cloned successfully:', result)

    // Store voice clone info in database
    const { data: voiceClone, error: dbError } = await supabaseClient
      .from('voice_clones')
      .insert({
        user_id: user.id,
        voice_id: result.voice_id,
        name: name,
        description: description,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save voice clone')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        voiceId: result.voice_id,
        voiceClone 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in clone-voice:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
