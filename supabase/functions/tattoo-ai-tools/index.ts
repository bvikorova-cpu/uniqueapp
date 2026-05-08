import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const __auth = await requireAiCredits(req, corsHeaders, { credits: 5, usageType: "tattoo_ai" });
    if (__auth.errorResponse) return __auth.errorResponse;
    const __deduct = __auth.deduct!;
    const { type, ...params } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');

    // Helper for chat completions
    const chatCompletion = async (systemPrompt: string, userPrompt: string, maxTokens = 1000) => {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "gpt-5",
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
          max_completion_tokens: maxTokens,
        }),
      });
      if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
      const data = await response.json();
      return data.choices?.[0]?.message?.content;
    };

    // Helper for image generation
    const generateImage = async (prompt: string) => {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: prompt,
        n: 1,
        size: "1024x1024",
        }),
      });
      if (!response.ok) {
        if (response.status === 429) throw new Error('Rate limit exceeded. Please try again shortly.');
        throw new Error(`Image generation error: ${response.status}`);
      }
      const data = await response.json();
      const imageUrl = (data.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : null);
      if (!imageUrl) throw new Error('No image generated');
      return imageUrl;
    };

    // ─── STYLE MIX ───
    if (type === 'style_mix') {
      const { style1, style2, description } = params;
      const imageUrl = await generateImage(
        `Create a professional tattoo design that is a creative fusion of ${style1} and ${style2} styles. The design: ${description}. Seamlessly blend the characteristics of both styles. High detail, clean lines, professional tattoo art quality. White background. Ultra high resolution.`
      );
      await __deduct().catch((e) => console.error("deduct failed:", e));
      return new Response(JSON.stringify({ imageUrl }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ─── AGING SIMULATION ───
    if (type === 'aging_simulation') {
      const { years, skinType } = params;
      const analysis = await chatCompletion(
        'You are a professional tattoo aging expert. Provide detailed, scientific analysis of how tattoos age over time based on skin type, ink quality, and environmental factors.',
        `Analyze how a tattoo would age over ${years} years on ${skinType} skin. Provide:\n1. Color fading prediction (which colors fade first, how much)\n2. Line blur estimate (fine lines vs thick lines)\n3. Overall appearance change percentage\n4. Recommended touch-up timeline\n5. Care tips to slow aging\n6. Best and worst case scenarios\nFormat with clear headers and bullet points.`
      );
      return new Response(JSON.stringify({ analysis }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ─── COLOR PALETTE ───
    if (type === 'color_palette') {
      const { skinTone, description } = params;
      const palette = await chatCompletion(
        'You are an expert tattoo color consultant specializing in ink-to-skin-tone matching. You understand how different ink pigments appear on various Fitzpatrick skin types and how they age.',
        `Create a detailed color palette recommendation for:\n- Skin tone: ${skinTone}\n- Tattoo idea: ${description}\n\nProvide:\n1. 🎨 PRIMARY COLORS: 3-5 recommended ink colors with specific pigment names (not just "red" but "Crimson Red" or "Burnt Sienna")\n2. 🌟 ACCENT COLORS: 2-3 complementary highlight colors\n3. 🔲 SHADING: Recommended shading approach (grey wash, color shading, etc.)\n4. ⚠️ COLORS TO AVOID: Inks that won't hold well on this skin tone\n5. ⏰ LONGEVITY: How each color will age on this skin type\n6. 💡 PRO TIPS: Artist-level advice for the best result\n\nBe specific with ink brand suggestions when possible.`,
        1200
      );
      return new Response(JSON.stringify({ palette }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ─── MEANING LOOKUP ───
    if (type === 'meaning_lookup') {
      const { symbol } = params;
      const meaning = await chatCompletion(
        'You are a tattoo symbolism and cultural history expert with deep knowledge of art history, mythology, religion, and cross-cultural symbolism.',
        `Provide a comprehensive encyclopedia entry for the tattoo symbol/motif: "${symbol}"\n\nInclude:\n1. 📜 ORIGINS & HISTORY: Where and when this symbol first appeared in tattoo culture\n2. 🌍 CULTURAL MEANINGS: Different meanings across cultures (Japanese, Celtic, Polynesian, Western, etc.)\n3. 🔮 SPIRITUAL & MYTHOLOGICAL: Religious, spiritual, or mythological significance\n4. 💀 MODERN INTERPRETATIONS: Contemporary tattoo culture meanings\n5. 🎨 POPULAR STYLE PAIRINGS: Which tattoo styles work best with this motif\n6. 🤝 COMMON COMBINATIONS: Other symbols often paired with this one and what the combinations mean\n7. ⚡ PLACEMENT SIGNIFICANCE: If body placement changes the meaning\n8. 📊 POPULARITY: Current trend status in the tattoo world`,
        1500
      );
      return new Response(JSON.stringify({ meaning }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ─── COVER-UP GENERATOR ───
    if (type === 'cover_up') {
      const { preferences } = params;
      
      // Generate cover-up suggestions
      const suggestions = await chatCompletion(
        'You are an expert tattoo cover-up artist with 20+ years of experience. You understand ink layering, color theory for cover-ups, and design strategies.',
        `A client wants to cover up an existing tattoo. Their style preferences: "${preferences || 'open to suggestions'}"\n\nProvide a detailed cover-up strategy:\n1. 🎯 DESIGN APPROACH: What types of designs work best for cover-ups\n2. 🎨 COLOR STRATEGY: How to use dark inks to mask the old tattoo\n3. 📐 SIZE RECOMMENDATION: How much larger the cover-up should be\n4. 🖌️ STYLE RECOMMENDATIONS: Top 3 styles that work best for cover-ups (with reasons)\n5. ⚡ SPECIFIC DESIGN IDEAS: 3 detailed design concepts tailored to their preferences\n6. ⏰ SESSION ESTIMATE: Typical number of sessions needed\n7. 💰 EXPECTED COST RANGE: Typical pricing for cover-up work\n8. ⚠️ IMPORTANT NOTES: What to discuss with the artist before starting`,
        1200
      );

      // Generate a cover-up design image
      const coverUpUrl = await generateImage(
        `Professional tattoo cover-up design. ${preferences || 'Bold dark design with intricate details'}. Design should feature dense, detailed artwork ideal for covering existing tattoos. Rich dark tones with strategic highlights. Clean white background. Ultra detailed professional tattoo art.`
      );

      return new Response(JSON.stringify({ suggestions, coverUpUrl }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ─── PAIN MAP INFO ───
    if (type === 'pain_info') {
      const { bodyPart, painLevel } = params;
      const info = await chatCompletion(
        'You are a tattoo pain and anatomy expert. Provide practical, science-based information about tattoo pain on different body parts.',
        `Provide detailed pain information for getting a tattoo on the ${bodyPart} (pain level: ${painLevel}/10):\n\n1. 🔬 WHY IT HURTS: Anatomical explanation (nerve density, bone proximity, skin thickness)\n2. ⏱️ DURATION IMPACT: How long sessions are typically tolerable here\n3. 💊 PAIN MANAGEMENT: Practical tips to reduce discomfort (breathing, numbing creams, positioning)\n4. 📏 SIZE CONSIDERATIONS: How design size affects pain duration\n5. 🎨 BEST STYLES: Which tattoo styles cause less pain on this area\n6. 🔄 HEALING TIME: Typical healing timeline for this body part\n7. ⚠️ RISKS: Any specific risks or complications for this area\n8. 💡 PRO TIP: What experienced tattoo artists recommend for this spot`,
        800
      );
      return new Response(JSON.stringify({ info }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ─── CARE GUIDE ───
    if (type === 'care_guide') {
      const { healingStage, concerns } = params;
      const guide = await chatCompletion(
        'You are a tattoo aftercare specialist and dermatology expert. Provide medically-informed, practical tattoo care advice.',
        `Create a personalized tattoo care guide for:\n- Healing stage: ${healingStage}\n- Specific concerns: ${concerns || 'general care'}\n\nProvide:\n1. ✅ DAILY CHECKLIST: Step-by-step daily care routine for this stage\n2. 🧴 PRODUCTS: Specific product recommendations (creams, soaps, moisturizers)\n3. ⚠️ WHAT TO AVOID: Things that can damage the tattoo at this stage\n4. 🚿 WASHING GUIDE: How to properly clean the tattoo\n5. ☀️ SUN PROTECTION: UV protection advice specific to this stage\n6. 🏊 WATER EXPOSURE: Swimming, baths, etc. guidelines\n7. 👕 CLOTHING: What to wear over the tattooed area\n8. 🚨 WARNING SIGNS: When to see a doctor (infection indicators)\n9. 📅 NEXT STEPS: What to expect in the coming days/weeks\n10. 💡 PRO TIPS: Expert advice most people don't know`,
        1200
      );
      return new Response(JSON.stringify({ guide }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw new Error(`Unknown tool type: ${type}`);
  } catch (error: any) {
    console.error('tattoo-ai-tools error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message?.includes('Rate limit') ? 429 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
