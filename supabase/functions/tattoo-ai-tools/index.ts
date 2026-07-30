import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";

const corsHeaders = { 'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version' };

// Per-tool credit cost (must match the UI badges)
const CREDIT_COSTS: Record<string, number> = { design: 8,
  style_mix: 8,
  aging_simulation: 5,
  color_palette: 6,
  meaning_lookup: 5,
  cover_up: 10,
  pain_info: 4,
  care_guide: 5 };

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
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const __auth = await requireAiCredits(req, corsHeaders, { credits: cost, usageType: `tattoo_${type}` });
    if (__auth.errorResponse) return __auth.errorResponse;
    const __deduct = __auth.deduct!;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!OPENAI_API_KEY && !LOVABLE_API_KEY) throw new Error('AI service is not configured');

    const rawFetch = ((globalThis as any).__ORIGINAL_FETCH__ as typeof fetch | undefined) ?? fetch;
    const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
    const OPENAI_IMAGE_URL = 'https://api.openai.com/v1/images/generations';
    const LOVABLE_CHAT_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';
    const LOVABLE_IMAGE_URL = 'https://ai.gateway.lovable.dev/v1/images/generations';

    const chatCompletion = async (systemPrompt: string, userPrompt: string, maxTokens = 1000, imageUrl?: string) => {
      const userContent: any = imageUrl
        ? [{ type: 'text', text: userPrompt }, { type: 'image_url', image_url: { url: imageUrl } }]
        : userPrompt;
      const messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }];
      const call = (lovable: boolean) => rawFetch(lovable ? LOVABLE_CHAT_URL : OPENAI_CHAT_URL, {
        method: 'POST',
        headers: lovable
          ? { 'Lovable-API-Key': LOVABLE_API_KEY ?? '', 'Content-Type': 'application/json' }
          : { 'Authorization': `Bearer ${OPENAI_API_KEY ?? ''}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(lovable
          ? { model: 'google/gemini-3.6-flash', messages, max_tokens: maxTokens }
          : { model: 'gpt-4o-mini', messages, max_completion_tokens: maxTokens }) });

      let response = LOVABLE_API_KEY ? await call(true) : await call(false);
      if (!response.ok && LOVABLE_API_KEY && OPENAI_API_KEY) {
        console.error('Lovable chat failed:', response.status, await response.text().catch(() => ''));
        response = await call(false);
      }
      if (!response.ok) {
        if (response.status === 429) throw new Error('Rate limit exceeded. Please try again shortly.');
        throw new Error(`AI text error: ${response.status}`);
      }
      const data = await response.json();
      return data.choices?.[0]?.message?.content;
    };

    const extractImage = (data: any): string | null => {
      const b64 = data?.data?.[0]?.b64_json;
      if (b64) return `data:image/png;base64,${b64}`;
      const url = data?.data?.[0]?.url;
      if (url) return url;
      const fromMessage = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      return fromMessage ?? null;
    };

    const generateImage = async (prompt: string) => {
      const call = (lovable: boolean) => rawFetch(lovable ? LOVABLE_IMAGE_URL : OPENAI_IMAGE_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${(lovable ? LOVABLE_API_KEY : OPENAI_API_KEY) ?? ''}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(lovable
          ? { model: 'openai/gpt-image-1-mini', prompt, size: '1024x1024', quality: 'low' }
          : { model: 'gpt-image-1', prompt, n: 1, size: '1024x1024', quality: 'low' }) });

      let response = LOVABLE_API_KEY ? await call(true) : await call(false);
      if (!response.ok && LOVABLE_API_KEY && OPENAI_API_KEY) {
        console.error('Lovable image failed:', response.status, await response.text().catch(() => ''));
        response = await call(false);
      }
      if (!response.ok) {
        if (response.status === 429) throw new Error('Rate limit exceeded. Please try again shortly.');
        throw new Error(`Image generation error: ${response.status}`);
      }
      const imageUrl = extractImage(await response.json());
      if (!imageUrl) throw new Error('No image generated');
      return imageUrl;
    };

    let payload: Record<string, unknown> = {};

    if (type === 'design') {
      const { prompt, style, colorScheme, placement, size } = params;
      const imageUrl = await generateImage(
        `Flat tattoo flash artwork on plain white paper. Subject (draw exactly this and nothing else): ${prompt}. Tattoo style: ${style || 'traditional'}. Color scheme: ${colorScheme || 'black & grey'}. Proportions suited for ${placement || 'arm'} placement, ${size || 'medium'} size. Clean bold linework, high detail, professional tattoo stencil quality, isolated design, pure white background. Do NOT draw human skin, body parts, mannequins, photos of people wearing the tattoo, backgrounds, frames or text.`
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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('tattoo-ai-tools error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message?.includes('Rate limit') ? 429 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
