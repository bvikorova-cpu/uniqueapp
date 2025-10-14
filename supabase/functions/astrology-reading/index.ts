import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case 'daily_horoscope':
        systemPrompt = "You are a professional astrologer with deep knowledge of astrology. Provide insightful, personalized daily horoscopes.";
        userPrompt = `Generate a detailed daily horoscope for ${data.zodiacSign} for ${data.date}. 

Write a comprehensive daily forecast covering love, relationships, career, finances, health and wellness.
Also provide:
- Lucky numbers (5 numbers)
- Lucky colors (3 colors)
- Compatible signs for the day
- Mood score (1-10)
- Love score (1-10)
- Career score (1-10)
- Health score (1-10)

Format as JSON with these exact fields: content, luckyNumbers, luckyColors, compatibilitySigns, moodScore, loveScore, careerScore, healthScore`;
        break;

      case 'compatibility':
        systemPrompt = "You are an expert in astrological compatibility analysis. Provide detailed, nuanced relationship insights.";
        userPrompt = `Analyze the compatibility between ${data.sign1} and ${data.sign2}. Include:
- Overall compatibility score (1-100)
- Detailed analysis (150-200 words)
- Key strengths (3-5 points)
- Main challenges (3-5 points)
- Relationship advice

Format as JSON with fields: compatibilityScore, analysis, strengths, challenges, advice`;
        break;

      case 'tarot':
        systemPrompt = "You are a skilled tarot card reader with intuitive interpretation abilities.";
        userPrompt = `Perform a ${data.readingType} tarot reading${data.question ? ` for the question: "${data.question}"` : ''}. 
Cards drawn: ${JSON.stringify(data.cards)}

Provide a comprehensive interpretation that connects all cards and their positions. Be insightful and specific.
Format as JSON with field: interpretation`;
        break;

      case 'numerology':
        systemPrompt = "You are a numerology expert who understands the mystical significance of numbers.";
        userPrompt = `Perform a numerology reading for:
Name: ${data.fullName}
Birth Date: ${data.birthDate}

Calculate and interpret:
- Life Path Number: ${data.lifePathNumber}
- Destiny Number: ${data.destinyNumber}
- Soul Urge Number: ${data.soulUrgeNumber}
- Personality Number: ${data.personalityNumber}

Provide a comprehensive interpretation (200-300 words) covering personality traits, life purpose, strengths, and challenges.
Also provide 5 lucky numbers based on the calculation.
Format as JSON with fields: interpretation, luckyNumbers`;
        break;

      case 'birth_chart':
        systemPrompt = "You are a professional astrologer specializing in natal chart interpretation.";
        userPrompt = `Interpret the birth chart for:
Sun Sign: ${data.sunSign}
Moon Sign: ${data.moonSign}
Rising Sign: ${data.risingSign}
Birth Place: ${data.birthPlace}
Birth Date: ${data.birthDate}
${data.birthTime ? `Birth Time: ${data.birthTime}` : ''}

Provide a detailed interpretation (300-400 words) covering:
- Personality overview
- Emotional nature
- Life path and destiny
- Strengths and talents
- Challenges to overcome
- Career insights
- Relationship patterns

Format as JSON with field: interpretation`;
        break;

      default:
        throw new Error('Invalid reading type');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const result = aiData.choices[0].message.content;

    // Try to parse JSON from the response
    let parsedResult;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/) || result.match(/```\s*([\s\S]*?)\s*```/);
      parsedResult = JSON.parse(jsonMatch ? jsonMatch[1] : result);
    } catch (e) {
      console.error('Failed to parse JSON, returning raw result:', e);
      parsedResult = { interpretation: result };
    }

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in astrology-reading function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
