import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Use Lovable AI to analyze the pet sound
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
        temperature: 0.8,
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
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Fallback response
      analysis = {
        emotion: 'Curious',
        message: "I'm trying to tell you something!",
        confidence: 0.5
      };
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing pet sound:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
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
