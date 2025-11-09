import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const LANGUAGE_VOICES: Record<string, string> = {
  'en-US': '9BWtsMINqrJLrRacOk9x', // Aria
  'sk-SK': 'EXAVITQu4vr4xnSDxMaL', // Sarah
  'fr-FR': 'FGY2WhTYpPnrIDTdsKH5', // Laura
  'es-ES': 'XB0fDUnXU5powFXDhCwa', // Charlotte
}

const LANGUAGE_NAMES: Record<string, string> = {
  'en-US': 'English',
  'sk-SK': 'Slovak',
  'fr-FR': 'French',
  'es-ES': 'Spanish',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, language } = await req.json()

    if (!text || !language) {
      throw new Error('Text and language are required')
    }

    console.log('Generating audio for language:', language)

    // Translate text if not English
    let translatedText = text
    if (language !== 'en-US') {
      console.log('Translating text to', LANGUAGE_NAMES[language])
      
      const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
      if (!lovableApiKey) {
        throw new Error('LOVABLE_API_KEY not configured')
      }

      const translationResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the given text to ${LANGUAGE_NAMES[language]}. Return ONLY the translated text, nothing else. Maintain the tone and style of a tour guide.`
            },
            {
              role: 'user',
              content: text
            }
          ],
        }),
      })

      if (!translationResponse.ok) {
        const errorText = await translationResponse.text()
        console.error('Translation API error:', translationResponse.status, errorText)
        throw new Error(`Translation failed: ${errorText}`)
      }

      const translationData = await translationResponse.json()
      translatedText = translationData.choices[0].message.content.trim()
      console.log('Translation completed')
    }

    // Generate audio using ElevenLabs
    const voiceId = LANGUAGE_VOICES[language] || LANGUAGE_VOICES['en-US']
    console.log('Generating audio with voice:', voiceId)

    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: translatedText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text()
      console.error('ElevenLabs TTS error:', elevenLabsResponse.status, errorText)
      throw new Error(`Failed to generate audio: ${errorText}`)
    }

    // Get audio as base64 - process byte by byte to avoid stack overflow
    const audioArrayBuffer = await elevenLabsResponse.arrayBuffer()
    const bytes = new Uint8Array(audioArrayBuffer)
    
    // Build binary string character by character to prevent stack overflow
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    
    const base64Audio = btoa(binary)

    console.log('Audio generated successfully, size:', audioArrayBuffer.byteLength)

    return new Response(
      JSON.stringify({ 
        success: true, 
        audioContent: base64Audio,
        translatedText 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in translate-and-generate-audio:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
