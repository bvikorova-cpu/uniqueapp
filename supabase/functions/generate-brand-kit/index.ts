import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessName, businessType, targetAudience, brandValues } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Check credits
    const { data: creditsData } = await supabase
      .from('ai_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    const creditsNeeded = 15;

    if (!creditsData || creditsData.credits_remaining < creditsNeeded) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Generate brand strategy
    const strategyResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: 'system',
            content: 'You are an expert brand strategist and marketing consultant. Create comprehensive brand strategies with actionable insights.'
          },
          {
            role: 'user',
            content: `Create a complete brand strategy for:
Business Name: ${businessName}
Business Type: ${businessType}
Target Audience: ${targetAudience}
Brand Values: ${brandValues}

Provide:
1. A catchy slogan (max 10 words)
2. A longer tagline (max 20 words)
3. 5 brand colors with hex codes (primary, secondary, accent, background, text)
4. Social media strategy with specific tactics for Instagram, Facebook, LinkedIn, and TikTok
5. Visual identity guidelines (typography, imagery style, tone)

Format as JSON with keys: slogan, tagline, colors (array), socialStrategy (object), visualIdentity (object)`
          }
        ],
      }),
    });

    if (!strategyResponse.ok) {
      throw new Error(`AI API error: ${strategyResponse.status}`);
    }

    const strategyData = await strategyResponse.json();
    const strategyText = strategyData.choices[0].message.content;
    
    // Parse JSON from AI response
    let brandStrategy;
    try {
      const jsonMatch = strategyText.match(/\{[\s\S]*\}/);
      brandStrategy = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        slogan: "Build Your Future",
        tagline: "Empowering businesses to reach their full potential",
        colors: [
          { name: "Primary", hex: "#6366F1" },
          { name: "Secondary", hex: "#8B5CF6" },
          { name: "Accent", hex: "#EC4899" },
          { name: "Background", hex: "#F3F4F6" },
          { name: "Text", hex: "#111827" }
        ],
        socialStrategy: {
          instagram: "Post daily stories and 3-4 feed posts weekly with branded visuals",
          facebook: "Share community content and engage with audience 2-3 times weekly",
          linkedin: "Professional thought leadership posts twice weekly",
          tiktok: "Create trendy, educational short videos 4-5 times weekly"
        },
        visualIdentity: {
          typography: "Modern sans-serif for headings, clean sans-serif for body",
          imagery: "Clean, professional photos with brand color overlays",
          tone: "Professional yet approachable, innovative and trustworthy"
        }
      };
    } catch (e) {
      console.error('Failed to parse AI response, using defaults');
      brandStrategy = {
        slogan: "Build Your Future",
        tagline: "Empowering businesses to reach their full potential",
        colors: [
          { name: "Primary", hex: "#6366F1" },
          { name: "Secondary", hex: "#8B5CF6" },
          { name: "Accent", hex: "#EC4899" },
          { name: "Background", hex: "#F3F4F6" },
          { name: "Text", hex: "#111827" }
        ],
        socialStrategy: {
          instagram: "Post daily stories and 3-4 feed posts weekly",
          facebook: "Share community content 2-3 times weekly",
          linkedin: "Post professional content twice weekly",
          tiktok: "Create short videos 4-5 times weekly"
        },
        visualIdentity: {
          typography: "Modern sans-serif fonts",
          imagery: "Professional, branded visuals",
          tone: "Professional and approachable"
        }
      };
    }

    // Generate logo using OpenAI
    const logoPrompt = `Modern, professional logo for ${businessName}, ${businessType} business. ${brandStrategy.colors[0].hex} color scheme. Clean, minimalist design. High quality, 1024x1024.`;
    
    let logoUrl = null;
    try {
      const logoResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: "gpt-image-1", prompt: logoPrompt, n: 1, size: "1024x1024" }),
      });

      if (logoResponse.ok) {
        const logoData = await logoResponse.json();
        const base64Image = logoData.data?.[0]?.b64_json;
        if (base64Image) {
          logoUrl = `data:image/webp;base64,${base64Image}`;
        }
      }
    } catch (logoError) {
      console.error('Logo generation error:', logoError);
    }

    // Save brand kit to database
    const { data: brandKit, error: brandError } = await supabase
      .from('brand_kits')
      .insert({
        user_id: user.id,
        business_name: businessName,
        business_type: businessType,
        target_audience: targetAudience,
        brand_values: brandValues,
        logo_url: logoUrl,
        slogan: brandStrategy.slogan,
        tagline: brandStrategy.tagline,
        color_palette: brandStrategy.colors,
        social_media_strategy: brandStrategy.socialStrategy,
        visual_identity: brandStrategy.visualIdentity,
        credits_used: creditsNeeded
      })
      .select()
      .single();

    if (brandError) throw brandError;

    // Deduct credits
    await supabase
      .from('ai_credits')
      .update({ 
        credits_remaining: creditsData.credits_remaining - creditsNeeded 
      })
      .eq('user_id', user.id);

    await supabase
      .from('ai_usage_history')
      .insert({
        user_id: user.id,
        usage_type: 'brand_kit',
        credits_used: creditsNeeded,
        description: `Brand kit for ${businessName}`
      });

    return new Response(
      JSON.stringify({ success: true, brandKit }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});