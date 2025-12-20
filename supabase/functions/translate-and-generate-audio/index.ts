import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { encode as base64Encode } from 'https://deno.land/std@0.168.0/encoding/base64.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// OpenAI TTS voices - using alloy as default multilingual voice
const LANGUAGE_VOICES: Record<string, string> = {
  'en-US': 'nova',
  'sk-SK': 'alloy',
  'fr-FR': 'shimmer',
  'es-ES': 'nova',
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

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    console.log('Generating audio for language:', language)

    // Translate text if not English
    let translatedText = text
    if (language !== 'en-US') {
      console.log('Translating text to', LANGUAGE_NAMES[language])

      const translationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
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

    // Generate audio using OpenAI TTS
    const voice = LANGUAGE_VOICES[language] || LANGUAGE_VOICES['en-US']
    console.log('Generating audio with OpenAI TTS, voice:', voice)

    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: translatedText,
        voice: voice,
        response_format: 'mp3',
      }),
    })

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text()
      console.error('OpenAI TTS error:', ttsResponse.status, errorText)
      throw new Error(`Failed to generate audio: ${errorText}`)
    }

    // Get audio as base64
    const audioArrayBuffer = await ttsResponse.arrayBuffer()
    const base64Audio = base64Encode(audioArrayBuffer)

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
