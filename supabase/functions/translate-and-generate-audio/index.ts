import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { encode as base64Encode } from 'https://deno.land/std@0.168.0/encoding/base64.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Language configurations with ElevenLabs voice IDs
// Using warm, storyteller-style voices for children aged 6-12
const LANGUAGE_CONFIG: Record<string, { name: string; voiceId: string }> = {
  'en': { name: 'English', voiceId: 'EXAVITQu4vr4xnSDxMaL' }, // Sarah - warm, storyteller
  'de': { name: 'German', voiceId: 'onwK4e9ZLuTAKqWW03F9' }, // Daniel - warm male
  'fr': { name: 'French', voiceId: 'XrExE9yKIg1WjnnlVkGX' }, // Matilda - warm female
  'es': { name: 'Spanish', voiceId: 'cgSgspJ2msm6clMCkdW9' }, // Jessica - engaging
  'sk': { name: 'Slovak', voiceId: 'EXAVITQu4vr4xnSDxMaL' }, // Sarah (multilingual)
  'it': { name: 'Italian', voiceId: 'XrExE9yKIg1WjnnlVkGX' }, // Matilda (multilingual)
  'pt': { name: 'Portuguese', voiceId: 'cgSgspJ2msm6clMCkdW9' }, // Jessica (multilingual)
  'zh': { name: 'Chinese', voiceId: 'EXAVITQu4vr4xnSDxMaL' }, // Sarah (multilingual)
}

// Fallback to OpenAI voices if ElevenLabs not available
const OPENAI_VOICES: Record<string, string> = {
  'en': 'nova',
  'de': 'alloy',
  'fr': 'shimmer',
  'es': 'nova',
  'sk': 'alloy',
  'it': 'shimmer',
  'pt': 'nova',
  'zh': 'alloy',
}

async function translateText(text: string, targetLanguage: string, openaiApiKey: string): Promise<string> {
  const languageName = LANGUAGE_CONFIG[targetLanguage]?.name || 'English'
  
  console.log('Translating text to', languageName)

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
          content: `You are a professional translator specializing in content for children. Translate the given text to ${languageName}. 
          
IMPORTANT GUIDELINES:
- Use a warm, magical, and engaging tone perfect for children aged 6-12
- Make the narration sound like a friendly storyteller sharing exciting facts
- Keep sentences clear and not too complex
- Preserve the wonder and magic of the original content
- Return ONLY the translated text, nothing else.`
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
  return translationData.choices[0].message.content.trim()
}

async function generateAudioWithElevenLabs(text: string, language: string, apiKey: string): Promise<ArrayBuffer> {
  const config = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG['en']
  
  console.log('Generating audio with ElevenLabs, voice:', config.voiceId)

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.6, // Balanced for storytelling
          similarity_boost: 0.75,
          style: 0.4, // Slight expressiveness for engagement
          use_speaker_boost: true,
          speed: 0.95, // Slightly slower for children
        },
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error('ElevenLabs TTS error:', response.status, errorText)
    throw new Error(`ElevenLabs TTS failed: ${errorText}`)
  }

  return response.arrayBuffer()
}

async function generateAudioWithOpenAI(text: string, language: string, apiKey: string): Promise<ArrayBuffer> {
  const voice = OPENAI_VOICES[language] || 'nova'
  
  console.log('Generating audio with OpenAI TTS, voice:', voice)

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1-hd', // Higher quality for storytelling
      input: text,
      voice: voice,
      response_format: 'mp3',
      speed: 0.95, // Slightly slower for children
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('OpenAI TTS error:', response.status, errorText)
    throw new Error(`OpenAI TTS failed: ${errorText}`)
  }

  return response.arrayBuffer()
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

    // Normalize language code (support both 'en' and 'en-US' formats)
    const langCode = language.split('-')[0].toLowerCase()

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')

    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    console.log('Processing audio generation for language:', langCode)

    // Translate text if not English
    let translatedText = text
    if (langCode !== 'en') {
      translatedText = await translateText(text, langCode, openaiApiKey)
      console.log('Translation completed')
    }

    // Generate audio - prefer ElevenLabs for better quality
    let audioArrayBuffer: ArrayBuffer

    if (elevenLabsApiKey) {
      try {
        audioArrayBuffer = await generateAudioWithElevenLabs(translatedText, langCode, elevenLabsApiKey)
        console.log('Audio generated with ElevenLabs, size:', audioArrayBuffer.byteLength)
      } catch (elevenLabsError) {
        console.warn('ElevenLabs failed, falling back to OpenAI:', elevenLabsError)
        audioArrayBuffer = await generateAudioWithOpenAI(translatedText, langCode, openaiApiKey)
        console.log('Audio generated with OpenAI (fallback), size:', audioArrayBuffer.byteLength)
      }
    } else {
      console.log('ElevenLabs API key not found, using OpenAI')
      audioArrayBuffer = await generateAudioWithOpenAI(translatedText, langCode, openaiApiKey)
      console.log('Audio generated with OpenAI, size:', audioArrayBuffer.byteLength)
    }

    // Convert to base64
    const base64Audio = base64Encode(audioArrayBuffer)

    return new Response(
      JSON.stringify({ 
        success: true, 
        audioContent: base64Audio,
        translatedText,
        language: langCode,
        provider: elevenLabsApiKey ? 'elevenlabs' : 'openai'
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
