import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Not authenticated');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Not authenticated');

    const { action, ...params } = await req.json();

    // Check admin
    const { data: adminRole } = await supabase
      .from('user_roles').select('role')
      .eq('user_id', user.id).eq('role', 'admin').maybeSingle();
    const isAdmin = !!adminRole;

    // Credit costs
    const costs: Record<string, number> = {
      generate_script: 1,
      storyboard: 3,
      ad_copy: 2,
      audience_analyzer: 2,
      performance_predictor: 3,
      brand_voice: 2,
      multi_platform: 3,
      competitor_analysis: 4,
      thumbnail_generator: 2,
      music_composer: 3,
      voiceover_script: 2,
      campaign_planner: 4,
      social_calendar: 3,
      roi_calculator: 2,
      ad_analytics: 3,
      multi_language_translator: 3,
      ab_tester: 4,
    };

    const cost = costs[action] || 1;

    if (!isAdmin) {
      const { data: credits } = await supabase
        .from('video_ad_credits').select('credits_remaining')
        .eq('user_id', user.id).maybeSingle();

      if (!credits || credits.credits_remaining < cost) {
        throw new Error('Insufficient credits. Please purchase more.');
      }

      await supabase.from('video_ad_credits')
        .update({ credits_remaining: credits.credits_remaining - cost })
        .eq('user_id', user.id);
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) throw new Error('OpenAI not configured');

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'generate_script':
        systemPrompt = 'You are an expert video ad scriptwriter. Generate complete professional video ad scripts with scene breakdowns, voiceover text, visual directions, music suggestions, and emotional targeting. Return JSON with: title, script, scenes (array of {duration, description, voiceover, visuals}), callToAction, musicSuggestion, targetEmotions (array).';
        userPrompt = `Create a ${params.duration}s video ad script for "${params.productService}" targeting ${params.targetAudience}. Key message: ${params.keyMessage}. Tone: ${params.tone}. Platform: ${params.platform}.${params.premiumFeatures?.competitiveAnalysis ? ' Include competitiveAnalysis field.' : ''}${params.premiumFeatures?.abTesting ? ' Include abTestVariants array with 3 variants (title, tagline).' : ''}${params.premiumFeatures?.voiceActorSuggestions ? ' Include voiceActors array with 3 suggestions (name, style).' : ''}${params.premiumFeatures?.budgetOptimizer ? ' Include budgetBreakdown (production, distribution, total in EUR).' : ''}${params.premiumFeatures?.performancePredictions ? ' Include performancePrediction (reach, engagement, conversion).' : ''}`;
        break;

      case 'storyboard':
        systemPrompt = 'You are a professional storyboard artist and creative director. Create detailed visual storyboards for video ads. Return JSON with: title, frames (array of {frameNumber, duration, cameraAngle, shotType, description, visualElements, textOverlay, transition, notes}), overallStyle, colorPalette (array), moodBoard (array of descriptions).';
        userPrompt = `Create a detailed storyboard for a ${params.duration}s ${params.platform} video ad for "${params.product}". Style: ${params.style || 'cinematic'}. Target: ${params.audience}. Message: ${params.message}.`;
        break;

      case 'ad_copy':
        systemPrompt = 'You are an expert ad copywriter specializing in video advertising. Optimize ad copy for maximum engagement. Return JSON with: headline, subheadline, bodyVariants (array of 3 versions), ctaVariants (array of 5 CTAs), hashtagSuggestions (array), emotionalHooks (array), urgencyElements (array), socialProof suggestions, toneAnalysis.';
        userPrompt = `Optimize ad copy for "${params.product}" targeting ${params.audience}. Current message: ${params.message}. Platform: ${params.platform}. Tone: ${params.tone}.`;
        break;

      case 'audience_analyzer':
        systemPrompt = 'You are an expert audience research analyst for video advertising. Provide deep audience insights. Return JSON with: primaryAudience (demographics, psychographics, painPoints, motivations), secondaryAudiences (array), bestPlatforms (array with platform, reasoning, bestTimeToPost), contentPreferences, competitorAudiences, recommendedTone, keyMessages (array), avoidTopics (array).';
        userPrompt = `Analyze the target audience for "${params.product}". Initial audience description: ${params.audience}. Industry: ${params.industry || 'general'}.`;
        break;

      case 'performance_predictor':
        systemPrompt = 'You are an AI ad performance analyst. Predict video ad performance metrics. Return JSON with: overallScore (0-100), reachEstimate, engagementRate, clickThroughRate, conversionEstimate, costPerView, costPerClick, bestPerformingElements (array), weakPoints (array), optimizationSuggestions (array), platformComparison (array of {platform, score, notes}), timeToResults.';
        userPrompt = `Predict performance for a ${params.duration}s video ad on ${params.platform} for "${params.product}". Target: ${params.audience}. Message: ${params.message}. Budget: ${params.budget || 'moderate'}.`;
        break;

      case 'brand_voice':
        systemPrompt = 'You are a brand identity expert. Analyze and match brand voice for video ads. Return JSON with: voiceProfile (personality, tone, values, keywords), scriptToneGuide, doList (array), dontList (array), samplePhrases (array), competitorVoiceComparison, uniqueSellingProposition, emotionalConnection, brandArchetype, colorAssociations (array), musicStyleRecommendation.';
        userPrompt = `Analyze and define brand voice for "${params.brand}". Industry: ${params.industry}. Current description: ${params.description}. Target audience: ${params.audience}.`;
        break;

      case 'multi_platform':
        systemPrompt = 'You are a multi-platform video ad specialist. Adapt video ad scripts for different platforms. Return JSON with: adaptations (array of {platform, duration, aspectRatio, scriptAdaptation, keyChanges, platformTips, bestPractices, estimatedPerformance}).';
        userPrompt = `Adapt this video ad for all major platforms. Original script: ${params.script}. Product: ${params.product}. Platforms: YouTube, Instagram Reels, TikTok, Facebook, LinkedIn, Twitter/X.`;
        break;

      case 'competitor_analysis':
        systemPrompt = 'You are a competitive intelligence analyst for video advertising. Return JSON with: competitors (array of {name, adStrategy, strengths, weaknesses, estimatedBudget, platformFocus, creativeTrends}), marketGaps (array), opportunities (array), threats (array), recommendedStrategy, differentiators (array), benchmarks.';
        userPrompt = `Analyze competitor video advertising landscape for "${params.product}" in the ${params.industry} industry. Target market: ${params.market}.`;
        break;

      case 'thumbnail_generator':
        systemPrompt = 'You are a video thumbnail design expert. Create detailed thumbnail concepts. Return JSON with: thumbnails (array of 4 concepts, each with {title, layout, dominantColors, textOverlay, imageDescription, emotionalAppeal, clickbaitLevel (1-10), a11yScore}), bestPractices, platformOptimizations.';
        userPrompt = `Design 4 thumbnail concepts for a video ad about "${params.product}". Platform: ${params.platform}. Target: ${params.audience}. Style: ${params.style || 'professional'}.`;
        break;

      case 'music_composer':
        systemPrompt = 'You are a music director for video advertising. Suggest detailed music compositions. Return JSON with: mainTrack (genre, tempo, mood, instruments, structureBreakdown), alternatives (array of 3), soundEffects (array with timestamps), voiceoverMusicBalance, licensingSuggestions, emotionalArc, beatDropMoments (array).';
        userPrompt = `Compose music direction for a ${params.duration}s video ad for "${params.product}". Tone: ${params.tone}. Target emotion: ${params.emotion}. Platform: ${params.platform}.`;
        break;

      case 'voiceover_script':
        systemPrompt = 'You are a professional voiceover director. Create detailed voiceover scripts with direction. Return JSON with: script, voiceProfile (gender, ageRange, accent, paceWPM, tone), directions (array of {timestamp, text, emotion, pace, emphasis, pause}), alternateVersions (array of 2), castingSuggestions (array), recordingTips.';
        userPrompt = `Create a detailed voiceover script for a ${params.duration}s video ad for "${params.product}". Message: ${params.message}. Tone: ${params.tone}. Platform: ${params.platform}.`;
        break;

      case 'campaign_planner':
        systemPrompt = 'You are a video ad campaign strategist. Create comprehensive campaign plans. Return JSON with: campaignName, objective, phases (array of {name, duration, budget, platforms, adTypes, kpis}), totalBudget, timeline, targetingStrategy, creativeRequirements, abTestPlan, scalingStrategy, riskMitigation, expectedROI.';
        userPrompt = `Create a complete video ad campaign plan for "${params.product}". Budget: ${params.budget}. Duration: ${params.campaignDuration}. Goal: ${params.goal}. Market: ${params.market}.`;
        break;

      case 'social_calendar':
        systemPrompt = 'You are a social media ad scheduling expert. Create optimized posting calendars. Return JSON with: calendar (array of 30 days, each with {date, platform, adType, postTime, caption, hashtags, budgetAllocation, expectedReach}), weeklyThemes (array), monthlyGoals, bestDays, worstDays, competitorAvoidance.';
        userPrompt = `Create a 30-day video ad posting calendar for "${params.product}" across ${params.platforms || 'all platforms'}. Industry: ${params.industry}. Budget: ${params.budget}/month.`;
        break;

      case 'roi_calculator':
        systemPrompt = 'You are an advertising ROI analyst. Calculate and predict ad ROI. Return JSON with: projectedROI, breakEvenPoint, costPerAcquisition, lifetimeValue, revenueProjection (monthly array for 6 months), optimizationTips (array), budgetAllocation (by platform), riskAssessment, bestCaseScenario, worstCaseScenario, recommendations (array).';
        userPrompt = `Calculate ROI for video ad campaign. Product: "${params.product}". Price: ${params.price}. Ad budget: ${params.budget}. Platform: ${params.platform}. Industry avg conversion: ${params.conversionRate || '2-5%'}.`;
        break;

      case 'ad_analytics':
        systemPrompt = 'You are an AI ad analytics expert. Analyze campaign performance and provide actionable insights. Return JSON with: overallPerformance (object with key metrics like impressions, clicks, ctr, conversions, costPerClick, roas), strengths (array of strings), weaknesses (array of strings), recommendations (array of strings), platformBreakdown (array of {platform, score, performance, notes}), nextSteps (string), trendAnalysis (string).';
        userPrompt = `Analyze ad campaign performance for "${params.product}". Campaign data: ${params.campaignData || 'not provided - generate realistic estimates'}. Budget spent: ${params.budget || 'moderate'}. Platforms: ${params.platforms || 'multiple'}.`;
        break;

      case 'multi_language_translator':
        systemPrompt = 'You are an expert ad script translator and localization specialist. Translate and culturally adapt ad scripts for global markets. Return JSON with: translations (array of {language, flag (emoji), translatedScript, culturalNotes, localizedCTA, toneAdaptation}), generalTips (string with localization advice).';
        userPrompt = `Translate and localize this ad script for the following languages: ${params.languages || 'Spanish, French, German, Japanese'}. Product: "${params.product || 'the advertised product'}". Original script: "${params.script}". Adapt culturally, not just translate literally.`;
        break;

      case 'ab_tester':
        systemPrompt = 'You are an AI A/B testing expert for video advertising. Compare ad variants and predict performance. Return JSON with: winner (string "Variant A" or "Variant B"), winnerReason (string), variants (array of 2 objects each with {name, isWinner (boolean), predictedScore (0-100), predictedCTR, predictedEngagement, predictedConversion, strengths (array), weaknesses (array)}), recommendations (array of improvement suggestions), statisticalConfidence (string).';
        userPrompt = `A/B test analysis for "${params.product}". Variant A: "${params.scriptA}". ${params.scriptB ? `Variant B: "${params.scriptB}"` : 'Generate an optimized Variant B.'}. Target audience: ${params.audience || 'general'}. Platform: ${params.platform || 'all platforms'}.`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' },
      }),
    });

    const aiData = await response.json();
    const result = JSON.parse(aiData.choices[0].message.content);

    return new Response(JSON.stringify({ result, credits_used: cost }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
