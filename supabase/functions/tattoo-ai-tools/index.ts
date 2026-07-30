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

    // Image-to-image edit (Gemini chat-image shape) — used by the aging simulator
    const editImage = async (prompt: string, sourceImage: string) => {
      const call = () => rawFetch(LOVABLE_IMAGE_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY ?? ''}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'google/gemini-3.1-flash-image',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: sourceImage } },
            ],
          }],
          modalities: ['image', 'text'],
        }) });

      if (!LOVABLE_API_KEY) return null;
      let response = await call();
      if (!response.ok) {
        console.error('Aged image edit failed:', response.status, await response.text().catch(() => ''));
        return null;
      }
      return extractImage(await response.json());
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
      const { years, skinType, imageUrl: sourceImage } = params;
      const [analysis, agedImageUrl] = await Promise.all([
        chatCompletion(
          'You are a professional tattoo aging expert. Answer with concrete, structured content — never with a preamble like "Here is an analysis". Start directly with the first section header.',
          `Analyze how THIS tattoo would look after ${years} years on ${skinType} skin. Use these exact section headers and short bullet points under each:\n\nCOLOR FADING\nLINE BLUR\nOVERALL CHANGE (%)\nTOUCH-UP TIMELINE\nCARE TIPS\nBEST & WORST CASE\n\nBe specific and practical. No introduction, no closing paragraph.`,
          1500,
          typeof sourceImage === 'string' ? sourceImage : undefined
        ),
        typeof sourceImage === 'string' && sourceImage
          ? editImage(
              `Edit this tattoo photo to show realistically how it will look after ${years} years of natural aging on ${skinType} skin tone. Keep the exact same subject, composition, placement and framing — only apply aging effects: faded and slightly desaturated ink, softened and blurred/spread linework, reduced contrast, subtle blowout of fine lines, slight skin texture change. Do not redraw or change the design. Photorealistic result.`,
              sourceImage
            ).catch((e) => { console.error('aging image failed:', e); return null; })
          : Promise.resolve(null),
      ]);
      payload = { analysis, agedImageUrl };

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
      const { preferences, imageUrl } = params;
      let existingTattooDescription = '';
      if (imageUrl && typeof imageUrl === 'string') {
        try {
          existingTattooDescription = await chatCompletion(
            'You are a tattoo expert analyzing a photo of an existing tattoo for a cover-up. Be concise.',
            'Describe the existing tattoo in this image in 2-3 sentences: approximate size, colors, style, subject, and how dark/dense it looks.',
            400,
            imageUrl
          ) || '';
        } catch (e) {
          console.error('cover-up image analysis failed:', e);
        }
      }

      const baseDescription = existingTattooDescription || 'a small, colorful existing tattoo';
      const userPreferences = preferences || 'elegant, balanced, not overly dark or aggressive';

      const suggestions = await chatCompletion(
        'You are an expert tattoo cover-up artist with 20+ years of experience. You specialize in soft, elegant cover-ups that transform old tattoos without defaulting to dark or aggressive designs unless the client explicitly asks for that.',
        `Client wants a cover-up for this existing tattoo: ${baseDescription}.\nClient preferences: "${userPreferences}".\n\nImportant style guidance:\n- If the client says "Japanese" or "Japan", recommend elegant, graceful motifs like cherry blossoms, koi fish, cranes, waves, maple leaves, or chrysanthemums with flowing lines. Do NOT suggest fierce dragons, demons, samurai, or oni unless the client explicitly asks for them.\n- Do NOT default to "dark and bold" unless the client specifically asks for it.\n- Provide a gentle, balanced design strategy that matches the size and mood of the existing tattoo.\n\nProvide: DESIGN APPROACH, COLOR STRATEGY, SIZE, STYLE RECOMMENDATIONS, 3 GENTLE DESIGN IDEAS, SESSION ESTIMATE, COST RANGE, IMPORTANT NOTES.`,
        1400
      );
      const coverUpUrl = await generateImage(
        `Flat tattoo flash artwork on plain white paper, designed as a professional cover-up. The existing tattoo being covered is: ${baseDescription}. Client's style preferences: "${userPreferences}". Create a beautiful, harmonious cover-up design that is elegant and balanced, NOT scary, violent, or overly dark unless the user explicitly asked for that. If Japanese style is requested, use graceful motifs like cherry blossoms, koi fish, waves, cranes, or maple leaves — NOT aggressive dragons, demons, or samurai. Clean linework, professional tattoo stencil quality, isolated on pure white background. NO human skin, body parts, mannequins, photos of people, text, frames, or backgrounds.`
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
        'You are a tattoo aftercare specialist and dermatology expert. Write in PLAIN TEXT only — never use markdown symbols such as #, *, _ or backticks. Use UPPERCASE section headers followed by short lines starting with "- ". Always finish every section completely.',
        `Write a complete personalized tattoo aftercare guide.
Healing stage: ${healingStage}
Concerns: ${concerns || 'general care'}

Use exactly these sections, in this order, each with 3-5 concrete bullet lines:
DAILY CHECKLIST
WASHING ROUTINE
RECOMMENDED PRODUCTS
WHAT TO AVOID
SUN PROTECTION
WATER EXPOSURE
CLOTHING
WARNING SIGNS
NEXT STEPS
PRO TIPS

Keep each bullet under 20 words so the whole guide fits.`,
        2500
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
