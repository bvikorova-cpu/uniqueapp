import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error("User not authenticated");

    const { birthDate, dreamsDejavu, talentsPhobias, readingType, partnerBirthDate, partnerInfo } = await req.json();

    // Check credits
    let { data: credits, error: creditsError } = await supabaseClient
      .from("past_life_credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (creditsError && creditsError.code === "PGRST116") {
      const { data: newCredits, error: insertError } = await supabaseClient
        .from("past_life_credits")
        .insert({ user_id: user.id })
        .select()
        .single();
      if (insertError) throw insertError;
      credits = newCredits;
    }

    const creditCosts = { basic: 5, full: 15, soulmate: 20 };
    const cost = creditCosts[readingType as keyof typeof creditCosts];

    if (credits.credits_remaining < cost) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits", requiresPayment: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) throw new Error('OPENAI_API_KEY not configured');

    // Generate past life reading
    const numberOfLives = readingType === 'basic' ? 1 : 3;
    const systemPrompt = `You are a mystical past life reader with deep knowledge of history, reincarnation, and karma. Generate detailed and engaging past life readings based on the user's information. Be creative, specific, and insightful. Include historical accuracy where appropriate.`;

    const userPrompt = `Generate a past life reading for someone born on ${birthDate}.
${dreamsDejavu ? `Dreams/Déjà vu experiences: ${dreamsDejavu}` : ''}
${talentsPhobias ? `Talents/Phobias: ${talentsPhobias}` : ''}
${readingType === 'soulmate' && partnerBirthDate ? `Partner's birth date: ${partnerBirthDate}. Partner info: ${partnerInfo || 'Not provided'}` : ''}

Create ${numberOfLives} past life ${numberOfLives === 1 ? 'story' : 'stories'} in JSON format:
{
  "pastLives": [
    {
      "period": "Historical period (e.g., Ancient Egypt 2500 BC, Medieval Europe 1200 AD)",
      "location": "Specific location",
      "profession": "Their role/occupation",
      "name": "Their name in that life",
      "story": "Detailed 3-4 paragraph story of their life, key events, relationships, challenges, and death",
      "karmicLesson": "Lesson from this life that affects current life"
    }
  ],
  "overallKarmicTheme": "Main karmic pattern across all lives"
  ${readingType === 'soulmate' ? ', "soulmateConnection": "Detailed analysis of past life connections with partner, including which lives you were together and your relationship dynamics"' : ''}
}`;

    const textResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 3000,
      }),
    });

    if (!textResponse.ok) {
      const errorText = await textResponse.text();
      console.error('AI text error:', textResponse.status, errorText);
      throw new Error('Failed to generate past life reading');
    }

    const textData = await textResponse.json();
    let reading = textData.choices[0].message.content;
    
    // Extract JSON from markdown code blocks if present
    if (reading.includes('```json')) {
      reading = reading.split('```json')[1].split('```')[0].trim();
    } else if (reading.includes('```')) {
      reading = reading.split('```')[1].split('```')[0].trim();
    }
    
    const parsedReading = JSON.parse(reading);

    // Generate illustrations for full and soulmate readings using OpenAI
    if (readingType === 'full' || readingType === 'soulmate') {
      for (let i = 0; i < parsedReading.pastLives.length; i++) {
        const life = parsedReading.pastLives[i];
        const imagePrompt = `Create a mystical, artistic illustration of ${life.name}, a ${life.profession} in ${life.period} at ${life.location}. Style: ethereal, dreamlike, soft colors, spiritual atmosphere, ancient and mystical feel. Include period-appropriate clothing and environment. High quality, detailed artwork.`;

        try {
          const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-image-1',
              prompt: imagePrompt,
              n: 1,
              size: '1024x1024',
              quality: 'high',
              output_format: 'webp',
              output_compression: 85,
            }),
          });

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            const base64Image = imageData.data?.[0]?.b64_json;
            if (base64Image) {
              parsedReading.pastLives[i].illustration = `data:image/webp;base64,${base64Image}`;
            }
          }
        } catch (imgError) {
          console.error('Image generation error:', imgError);
        }
      }
    }

    // Save reading to database
    const { error: insertError } = await supabaseClient
      .from("past_life_readings")
      .insert({
        user_id: user.id,
        birth_date: birthDate,
        dreams_dejavu: dreamsDejavu,
        talents_phobias: talentsPhobias,
        reading_type: readingType,
        credits_used: cost,
        past_lives: parsedReading.pastLives,
        karmic_lessons: parsedReading.overallKarmicTheme,
        soulmate_analysis: parsedReading.soulmateConnection || null,
        partner_birth_date: partnerBirthDate || null,
        partner_info: partnerInfo || null
      });

    if (insertError) throw insertError;

    // Deduct credits
    await supabaseClient
      .from("past_life_credits")
      .update({ credits_remaining: credits.credits_remaining - cost })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({ reading: parsedReading }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in analyze-past-life:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});