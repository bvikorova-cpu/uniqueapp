import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { product, targetAudience, keyMessage, tone, duration, platform } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `Create a professional video advertisement script with the following specifications:

Product/Service: ${product}
Target Audience: ${targetAudience}
Key Message: ${keyMessage}
Tone: ${tone}
Duration: ${duration} seconds
Platform: ${platform}

Generate a detailed video ad plan including:
1. A catchy title
2. Complete script with timing
3. Scene-by-scene breakdown (each scene should have: duration, description, voiceover text, and visual suggestions)
4. Call to action
5. Music/sound suggestions
6. Target emotions to evoke

Format the response as JSON with this structure:
{
  "title": "catchy title",
  "script": "full script with natural flow",
  "scenes": [
    {
      "duration": "0-5s",
      "description": "scene description",
      "voiceover": "what is said",
      "visuals": "what is shown"
    }
  ],
  "callToAction": "strong CTA",
  "musicSuggestion": "music style/mood",
  "targetEmotions": ["emotion1", "emotion2"]
}

Make it compelling, engaging, and optimized for ${platform}. The script should be ${tone} in tone.`;

    console.log('Calling Lovable AI for video ad generation...');

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
            content: 'You are a professional video advertising expert. Create engaging, persuasive video ad scripts optimized for different platforms. Always respond with valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('Payment required. Please add credits to your Lovable AI workspace.');
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    let result = data.choices[0].message.content;
    
    // Try to extract JSON from the response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
    } else {
      // Fallback if no JSON found - create structured response
      result = {
        title: `${product} - ${platform} Ad`,
        script: result,
        scenes: [
          {
            duration: `0-${duration}s`,
            description: "Main scene",
            voiceover: result.substring(0, 200),
            visuals: `Show ${product} in action`
          }
        ],
        callToAction: `Get ${product} now!`,
        musicSuggestion: `${tone} background music`,
        targetEmotions: ["excitement", "trust"]
      };
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error generating video ad:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
