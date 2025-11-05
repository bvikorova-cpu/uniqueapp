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

    const { text, voiceId, memoryId } = await req.json()

    if (!text || !voiceId) {
      throw new Error('Text and voice ID are required')
    }

    console.log('Generating voice memory:', { voiceId, textLength: text.length, memoryId })

    // Generate audio using ElevenLabs text-to-speech with cloned voice
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs TTS error:', response.status, errorText)
      throw new Error(`Failed to generate audio: ${errorText}`)
    }

    // Get audio as base64
    const audioArrayBuffer = await response.arrayBuffer()
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioArrayBuffer))
    )

    console.log('Audio generated successfully, size:', audioArrayBuffer.byteLength)

    // If memoryId is provided, store the audio URL in the time_capsule_memories table
    if (memoryId) {
      // Upload audio to Supabase storage
      const fileName = `${user.id}/${memoryId}_${Date.now()}.mp3`
      
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('voice-memories')
        .upload(fileName, Buffer.from(audioArrayBuffer), {
          contentType: 'audio/mpeg',
          upsert: false,
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new Error('Failed to upload audio')
      }

      const { data: { publicUrl } } = supabaseClient.storage
        .from('voice-memories')
        .getPublicUrl(fileName)

      // Update memory with audio URL
      const { error: updateError } = await supabaseClient
        .from('time_capsule_memories')
        .update({ audio_url: publicUrl })
        .eq('id', memoryId)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Memory update error:', updateError)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          audioUrl: publicUrl
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        audioContent: base64Audio 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in generate-voice-memory:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
