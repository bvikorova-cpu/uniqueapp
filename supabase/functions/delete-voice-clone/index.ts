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

    const { voiceCloneId } = await req.json()

    if (!voiceCloneId) {
      throw new Error('Voice clone ID is required')
    }

    console.log('Deleting voice clone:', voiceCloneId)

    // Get voice clone info first
    const { data: voiceClone, error: fetchError } = await supabaseClient
      .from('voice_clones')
      .select('*')
      .eq('id', voiceCloneId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !voiceClone) {
      throw new Error('Voice clone not found')
    }

    // Delete from ElevenLabs if voice_id exists
    if (voiceClone.voice_id) {
      const deleteResponse = await fetch(
        `https://api.elevenlabs.io/v1/voices/${voiceClone.voice_id}`,
        {
          method: 'DELETE',
          headers: {
            'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY') || '',
          },
        }
      )

      if (!deleteResponse.ok) {
        console.error('Failed to delete from ElevenLabs:', await deleteResponse.text())
        // Continue with database deletion even if ElevenLabs deletion fails
      } else {
        console.log('Successfully deleted from ElevenLabs')
      }
    }

    // Delete from database
    const { error: deleteError } = await supabaseClient
      .from('voice_clones')
      .delete()
      .eq('id', voiceCloneId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Database delete error:', deleteError)
      throw new Error('Failed to delete voice clone from database')
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Voice clone deleted successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in delete-voice-clone:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
