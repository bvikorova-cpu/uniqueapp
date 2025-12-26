import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio, withVoice } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Use OpenAI to analyze the pet sound
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are an expert pet psychologist and animal behaviorist. Analyze pet sounds and determine their emotional state and what they're trying to communicate. 

Your response must be a JSON object with exactly these fields:
{
  "emotion": "string (one word describing the primary emotion: Happy, Playful, Anxious, Hungry, Attention-seeking, Scared, Excited, Tired, etc.)",
  "message": "string (a friendly, conversational translation of what the pet is saying in first person, as if the pet is speaking. Keep it under 100 characters.)",
  "confidence": number (between 0 and 1, representing your confidence in this analysis)
}

Examples:
{"emotion":"Happy","message":"I'm so happy to see you! Let's play together!","confidence":0.85}
{"emotion":"Hungry","message":"Hey! I think it's dinner time, don't you?","confidence":0.92}
{"emotion":"Anxious","message":"I'm feeling a bit nervous, can you stay with me?","confidence":0.78}`
          },
          {
            role: 'user',
            content: 'Analyze this pet sound and provide the emotion, message, and confidence level.'
          }
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${await response.text()}`);
    }

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;
    
    // Parse the JSON response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      analysis = {
        emotion: 'Curious',
        message: "I'm trying to tell you something!",
        confidence: 0.5
      };
    }

    // Generate voice audio if requested (Premium Voice feature)
    if (withVoice && analysis.message) {
      console.log('Generating TTS for message:', analysis.message);
      
      const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: analysis.message,
          voice: 'nova', // Friendly, warm voice
          response_format: 'mp3',
        }),
      });

      if (ttsResponse.ok) {
        const audioBuffer = await ttsResponse.arrayBuffer();
        const base64Audio = base64Encode(audioBuffer);
        analysis.audioContent = base64Audio;
        console.log('TTS audio generated successfully');
      } else {
        console.error('TTS generation failed:', await ttsResponse.text());
      }
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing pet sound:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        emotion: 'Unknown',
        message: 'Could not analyze the sound',
        confidence: 0
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
