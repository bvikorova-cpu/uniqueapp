import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Per-tool credit cost (must match the UI badges)
const CREDIT_COSTS: Record<string, number> = {
  design: 8,
  style_mix: 8,
  aging_simulation: 5,
  color_palette: 6,
  meaning_lookup: 5,
  cover_up: 10,
  pain_info: 4,
  care_guide: 5,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, ...params } = body;
    const cost = CREDIT_COSTS[type];
    if (!cost) {
      return new Response(JSON.stringify({ error: `Unknown tool type: ${type}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const __auth = await requireAiCredits(req, corsHeaders, { credits: cost, usageType: `tattoo_${type}` });
    if (__auth.errorResponse) return __auth.errorResponse;
    const __deduct = __auth.deduct!;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');

    const chatCompletion = async (systemPrompt: string, userPrompt: string, maxTokens = 1000) => {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
          max_completion_tokens: maxTokens,
        }),
      });
      if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
      const data = await response.json();
      return data.choices?.[0]?.message?.content;
    };

    const generateImage = async (prompt: string) => {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: "gpt-image-1", prompt, n: 1, size: "1024x1024" }),
      });
      if (!response.ok) {
        if (response.status === 429) throw new Error('Rate limit exceeded. Please try again shortly.');
        throw new Error(`Image generation error: ${response.status}`);
      }
      const data = await response.json();
      const imageUrl = data.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : null;
      if (!imageUrl) throw new Error('No image generated');
      return imageUrl;
    };

    let payload: Record<string, unknown> = {};

    if (type === 'design') {
      const { prompt, style, colorScheme, placement, size } = params;
      const imageUrl = await generateImage(
        `Professional tattoo design. Concept: ${prompt}. Style: ${style || 'traditional'}. Color scheme: ${colorScheme || 'black & grey'}. Intended placement: ${placement || 'arm'}. Size: ${size || 'medium'}. Clean lines, high detail, professional tattoo art quality. Pure white background. Ultra high resolution.`
      );
      payload = { imageUrl };
    } else if (type === 'style_mix') {
      const { style1, style2, description } = params;
      const imageUrl = await generateImage(
        `Create a professional tattoo design that is a creative fusion of ${style1} and ${style2} styles. The design: ${description}. Seamlessly blend the characteristics of both styles. High detail, clean lines, professional tattoo art quality. White background. Ultra high resolution.`
      );
      payload = { imageUrl };
    } else if (type === 'aging_simulation') {
      const { years, skinType } = params;
      const analysis = await chatCompletion(
        'You are a professional tattoo aging expert. Provide detailed, scientific analysis of how tattoos age over time based on skin type, ink quality, and environmental factors.',
        `Analyze how a tattoo would age over ${years} years on ${skinType} skin. Provide:\n1. Color fading prediction\n2. Line blur estimate\n3. Overall appearance change percentage\n4. Recommended touch-up timeline\n5. Care tips to slow aging\n6. Best and worst case scenarios\nFormat with clear headers and bullet points.`
      );
      payload = { analysis };
    } else if (type === 'color_palette') {
      const { skinTone, description } = params;
      const palette = await chatCompletion(
        'You are an expert tattoo color consultant specializing in ink-to-skin-tone matching.',
        `Create a detailed color palette for:\n- Skin tone: ${skinTone}\n- Tattoo idea: ${description}\n\nInclude PRIMARY COLORS, ACCENT COLORS, SHADING, COLORS TO AVOID, LONGEVITY, and PRO TIPS.`,
        1200
      );
      payload = { palette };
    } else if (type === 'meaning_lookup') {
      const { symbol } = params;
      const meaning = await chatCompletion(
        'You are a tattoo symbolism and cultural history expert.',
        `Provide a comprehensive encyclopedia entry for: "${symbol}". Include ORIGINS, CULTURAL MEANINGS, SPIRITUAL, MODERN INTERPRETATIONS, STYLE PAIRINGS, COMBINATIONS, PLACEMENT, POPULARITY.`,
        1500
      );
      payload = { meaning };
    } else if (type === 'cover_up') {
      const { preferences } = params;
      const suggestions = await chatCompletion(
        'You are an expert tattoo cover-up artist with 20+ years of experience.',
        `Client preferences: "${preferences || 'open to suggestions'}". Provide DESIGN APPROACH, COLOR STRATEGY, SIZE, STYLE RECOMMENDATIONS, 3 DESIGN IDEAS, SESSION ESTIMATE, COST RANGE, IMPORTANT NOTES.`,
        1200
      );
      const coverUpUrl = await generateImage(
        `Professional tattoo cover-up design. ${preferences || 'Bold dark design with intricate details'}. Dense detailed artwork ideal for covering existing tattoos. Rich dark tones. Clean white background.`
      );
      payload = { suggestions, coverUpUrl };
    } else if (type === 'pain_info') {
      const { bodyPart, painLevel } = params;
      const info = await chatCompletion(
        'You are a tattoo pain and anatomy expert.',
        `Pain info for tattoo on ${bodyPart} (level ${painLevel}/10). Include WHY IT HURTS, DURATION, PAIN MANAGEMENT, SIZE CONSIDERATIONS, BEST STYLES, HEALING TIME, RISKS, PRO TIP.`,
        800
      );
      payload = { info };
    } else if (type === 'care_guide') {
      const { healingStage, concerns } = params;
      const guide = await chatCompletion(
        'You are a tattoo aftercare specialist and dermatology expert.',
        `Personalized tattoo care guide for stage: ${healingStage}, concerns: ${concerns || 'general care'}. Include DAILY CHECKLIST, PRODUCTS, WHAT TO AVOID, WASHING, SUN PROTECTION, WATER EXPOSURE, CLOTHING, WARNING SIGNS, NEXT STEPS, PRO TIPS.`,
        1200
      );
      payload = { guide };
    }

    await __deduct().catch((e) => console.error("deduct failed:", e));
    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('tattoo-ai-tools error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message?.includes('Rate limit') ? 429 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
