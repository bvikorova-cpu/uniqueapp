import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { encode as base64Encode } from 'https://deno.land/std@0.168.0/encoding/base64.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Language configurations
const LANGUAGE_CONFIG: Record<string, { name: string }> = {
  'en': { name: 'English' },
  'de': { name: 'German' },
  'fr': { name: 'French' },
  'es': { name: 'Spanish' },
  'sk': { name: 'Slovak' },
  'it': { name: 'Italian' },
  'pt': { name: 'Portuguese' },
  'zh': { name: 'Chinese (Mandarin)' },
}

// OpenAI TTS voice - using 'shimmer' for warm, storytelling female persona
// Consistent across all languages for unified experience
const OPENAI_VOICE = 'shimmer'

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

async function generateAudioWithOpenAI(text: string, apiKey: string): Promise<ArrayBuffer> {
  console.log('Generating audio with OpenAI TTS, voice:', OPENAI_VOICE)

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1-hd', // Higher quality for storytelling
      input: text,
      voice: OPENAI_VOICE,
      response_format: 'mp3',
      speed: 0.95, // Slightly slower for children's content
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

    // Generate audio with OpenAI TTS
    const audioArrayBuffer = await generateAudioWithOpenAI(translatedText, openaiApiKey)
    console.log('Audio generated with OpenAI TTS, size:', audioArrayBuffer.byteLength)

    // Convert to base64
    const base64Audio = base64Encode(audioArrayBuffer)

    return new Response(
      JSON.stringify({ 
        success: true, 
        audioContent: base64Audio,
        translatedText,
        language: langCode,
        provider: 'openai',
        voice: OPENAI_VOICE
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
