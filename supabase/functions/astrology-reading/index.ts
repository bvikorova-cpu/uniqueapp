import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error('Not authenticated');

    // Rate limit check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.ai_generation, corsHeaders, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { type, data } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Check and deduct credits
    const creditCosts: Record<string, number> = {
      tarot_3: 3, tarot_5: 5, tarot_10: 10, tarot_premium: 15,
      daily_horoscope: 1, weekly_horoscope: 3, monthly_horoscope: 8, yearly_horoscope: 25,
      dream: 5, numerology_basic: 5, numerology_compatibility: 8, numerology_full: 15,
      palmistry: 10, love_compatibility: 7, yes_no: 2, birth_chart: 20, rune: 1
    };

    const creditsNeeded = creditCosts[type] || 1;

    const { data: creditsData, error: creditsError } = await supabaseClient
      .from('astrology_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (creditsError || !creditsData) {
      throw new Error('Credits not found');
    }

    if (creditsData.credits_remaining < creditsNeeded) {
      throw new Error('Insufficient credits');
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case 'daily_horoscope':
      case 'weekly_horoscope':
      case 'monthly_horoscope':
      case 'yearly_horoscope':
        const period = type.replace('_horoscope', '');
        systemPrompt = "You are a professional astrologer with deep knowledge of astrology. Provide insightful, personalized horoscopes.";
        userPrompt = `Generate a detailed ${period} horoscope for ${data.zodiacSign} for ${data.date || 'current period'}. 

Write a comprehensive forecast covering love, relationships, career, finances, health and wellness.
Also provide:
- Lucky numbers (5 numbers)
- Lucky colors (3 colors)
- Compatible signs
- Mood score (1-10)
- Love score (1-10)
- Career score (1-10)
- Health score (1-10)

Format as JSON with these exact fields: content, luckyNumbers, luckyColors, compatibilitySigns, moodScore, loveScore, careerScore, healthScore`;
        break;

      case 'dream':
        systemPrompt = "You are an expert dream interpreter with knowledge of psychology and symbolism.";
        userPrompt = `Interpret this dream: "${data.dreamDescription}"

Provide a comprehensive interpretation covering:
- Psychological meaning
- Symbolic elements
- Emotional significance
- Potential messages or insights

Format as JSON with field: interpretation`;
        break;

      case 'palmistry':
        systemPrompt = "You are a skilled palmistry reader with expertise in chiromancy.";
        userPrompt = `Analyze this palm image and provide a detailed reading covering:
- Life line interpretation
- Heart line analysis
- Head line insights
- Fate line (if visible)
- Major mounts and their meanings
- Overall personality traits
- Future predictions

Format as JSON with field: reading`;
        break;

      case 'yes_no':
        systemPrompt = "You are a mystical oracle providing guidance through yes/no answers.";
        userPrompt = `Answer this question: "${data.question}"

Provide:
- A clear YES or NO answer
- Brief explanation (2-3 sentences)
- Guidance for moving forward

Format as JSON with fields: answer, explanation`;
        break;

      case 'rune':
        systemPrompt = "You are a rune master with deep knowledge of Norse divination.";
        userPrompt = `Draw a single rune for today's guidance.

Select one meaningful rune and provide:
- Rune name
- Traditional meaning
- Guidance for today
- How to apply this wisdom

Format as JSON with fields: runeName, runeMeaning, guidance`;
        break;

      case 'tarot_3':
      case 'tarot_5':
      case 'tarot_10':
      case 'tarot_premium':
        systemPrompt = "You are a skilled tarot card reader with intuitive interpretation abilities.";
        userPrompt = `Perform a tarot reading${data.question ? ` for the question: "${data.question}"` : ''}. 
Cards drawn: ${JSON.stringify(data.cards)}

Provide a comprehensive interpretation that connects all cards and their positions. Be insightful and specific.
Format as JSON with field: interpretation`;
        break;

      case 'love_compatibility':
      case 'numerology_compatibility':
        systemPrompt = "You are an expert in compatibility analysis. Provide detailed, nuanced relationship insights.";
        userPrompt = `Analyze the compatibility between ${data.sign1 || data.name1} and ${data.sign2 || data.name2}. Include:
- Overall compatibility score (1-100)
- Detailed analysis (150-200 words)
- Key strengths (3-5 points)
- Main challenges (3-5 points)
- Relationship advice

Format as JSON with fields: compatibilityScore, analysis, strengths, challenges, advice`;
        break;

      case 'numerology_basic':
      case 'numerology_full':
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
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

    // Deduct credits
    await supabaseClient
      .from('astrology_credits')
      .update({ 
        credits_remaining: creditsData.credits_remaining - creditsNeeded 
      })
      .eq('user_id', user.id);

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
