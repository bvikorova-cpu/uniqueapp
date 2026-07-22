import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = { 'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version' }

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)
    
    if (!user) throw new Error('Not authenticated')

    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as string // 'clip' or 'show'
    const priceCoins = formData.get('priceCoins') as string

    if (!file) throw new Error('No file provided')

    // Verify user is a comedian
    const { data: comedian, error: comedianError } = await supabaseClient
      .from('comedian_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (comedianError || !comedian) {
      throw new Error('User is not a comedian')
    }

    // Upload to storage
    const fileName = `${user.id}/${Date.now()}_${file.name}`
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('comedy-videos')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('comedy-videos')
      .getPublicUrl(fileName)

    // Create record in database
    if (type === 'clip') {
      const { data: clip, error: clipError } = await supabaseClient
        .from('comedy_clips')
        .insert({
          comedian_id: comedian.id,
          title,
          description,
          video_url: publicUrl,
          price_coins: parseInt(priceCoins) || 50
        })
        .select()
        .single()

      if (clipError) throw clipError

      return new Response(
        JSON.stringify({ success: true, clip, videoUrl: publicUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, videoUrl: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error uploading video:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
