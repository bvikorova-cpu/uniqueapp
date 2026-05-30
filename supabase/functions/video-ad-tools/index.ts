import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { encode as b64encode, decode as b64decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // Health probe: no auth, no credits.
    const probe = req.method === 'GET' ? {} : await req.clone().json().catch(() => ({}));
    if ((probe as any)?.action === 'ping' || new URL(req.url).searchParams.get('action') === 'ping') {
      return new Response(JSON.stringify({
        ok: true,
        router: 'video-ad-tools',
        actions: ['ping', 'generate_script', 'storyboard', 'ad_copy', 'audience_analyzer', 'performance_predictor', 'brand_voice', 'multi_platform', 'competitor_analysis', 'thumbnail_generator', 'music_composer', 'voiceover_script', 'campaign_planner', 'social_calendar', 'roi_calculator', 'ad_analytics', 'multi_language_translator', 'ab_tester', 'url_to_video', 'hook_analyzer', 'caption_generator', 'winning_ads_recommend', 'avatar_plan', 'stock_footage', 'resize_advice', 'text_to_video_split', 'scenes', 'sfx', 'tts', 'voice_clone'],
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

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
      url_to_video: 5,
      hook_analyzer: 3,
      caption_generator: 3,
      winning_ads_recommend: 3,
      avatar_plan: 3,
      stock_footage: 3,
      resize_advice: 3,
      text_to_video_split: 3,
      // Merged from video-ad-scenes/sfx/tts/voice-clone
      scenes: 5,
      sfx: 5,
      tts: 5,
      voice_clone: 10,
    };

    const cost = costs[action] || 1;
    let refundOnError = false;
    let prevCredits = 0;

    if (!isAdmin) {
      const { data: credits } = await supabase
        .from('video_ad_credits').select('credits_remaining')
        .eq('user_id', user.id).maybeSingle();

      if (!credits || credits.credits_remaining < cost) {
        return new Response(JSON.stringify({ error: 'Insufficient credits. Please purchase more.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      prevCredits = credits.credits_remaining;

      await supabase.from('video_ad_credits')
        .update({ credits_remaining: prevCredits - cost })
        .eq('user_id', user.id);
      refundOnError = true;
    }

    const refund = async () => {
      if (!refundOnError) return;
      try {
        await supabase.from('video_ad_credits')
          .update({ credits_remaining: prevCredits })
          .eq('user_id', user.id);
      } catch (_) { /* swallow */ }
    };

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) { await refund(); throw new Error('OpenAI not configured'); }

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

      case 'url_to_video': {
        // Fetch URL content first
        let pageText = '';
        try {
          const r = await fetch(params.url, { headers: { 'User-Agent': 'Mozilla/5.0 LovableBot' } });
          const html = await r.text();
          pageText = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 6000);
        } catch (_) { pageText = params.url; }
        systemPrompt = 'You are an expert at converting product/landing pages into ready-to-shoot video ads. Return JSON with: productName, valueProposition, targetAudience, suggestedPlatform, suggestedDuration (15/30/60), script (full voiceover), scenes (array of 5-8 {duration, description, voiceover, visuals, textOverlay}), callToAction, hooks (array of 3 alternative opening hooks), musicSuggestion, brandTone.';
        userPrompt = `Convert this URL/page into a complete video ad. URL: ${params.url}. Page content: ${pageText}. Platform preference: ${params.platform || 'auto'}. Tone: ${params.tone || 'auto'}.`;
        break;
      }

      case 'hook_analyzer':
        systemPrompt = 'You are an expert at analyzing the first 3 seconds of video ads (the "hook"). Return JSON with: hookScore (0-100), attentionGrab (1-10), clarity (1-10), curiosityGap (1-10), emotionalImpact (1-10), strengths (array), weaknesses (array), improvedHooks (array of 5 better alternatives), bestHook (string), patternsUsed (array of techniques like "shock","question","contrast","fomo","stat"), platformFit (object with tiktok/youtube/instagram/facebook scores 0-100), retention3sEstimate (percentage string), recommendation (string).';
        userPrompt = `Analyze this video ad hook (first 3 seconds): "${params.hook}". Full context: ${params.context || 'general ad'}. Platform: ${params.platform || 'all'}. Target: ${params.audience || 'general'}.`;
        break;

      case 'caption_generator':
        systemPrompt = 'You are an expert at generating animated video captions/subtitles in CapCut style. Return JSON with: captions (array of {startTime (seconds), endTime (seconds), text, style (highlight/normal/emphasis), position (top/middle/bottom), animation (pop/fade/slide/typewriter), color (hex), emoji (optional)}), totalDuration, recommendedFont, srtFormat (full SRT formatted string), styleGuide (object with rules), engagementTips (array).';
        userPrompt = `Generate animated captions for this video script/voiceover: "${params.script}". Total duration: ${params.duration || 30}s. Style: ${params.style || 'modern bold'}. Language: ${params.language || 'English'}. Platform: ${params.platform || 'tiktok'}.`;
        break;

      case 'winning_ads_recommend': {
        // Pull from library + AI-generated suggestions
        const { data: libraryAds } = await supabase
          .from('winning_ads_library')
          .select('*')
          .eq('industry', params.industry || 'saas')
          .limit(5);
        systemPrompt = 'You are an ad strategist. Given winning ad examples and a user product, return JSON with: matches (array of 5 inspiration objects {brand, hook, whyItWorks, applyToYou, score}), customStrategy (string), patternsToSteal (array of 5 techniques), avoidMistakes (array), nextSteps (array).';
        userPrompt = `User product: "${params.product}". Industry: ${params.industry}. Reference winning ads in library: ${JSON.stringify(libraryAds || [])}. Recommend strategy and patterns.`;
        break;
      }

      case 'avatar_plan':
        systemPrompt = 'You are an expert at designing AI talking-head avatar video ads (Synthesia/HeyGen style). Return JSON with: avatarDescription (detailed visual prompt for image gen: gender, age, ethnicity, attire, background, lighting, mood), voiceCharacter (suggested voice traits), recommendedVoiceId (one of: JBFqnCBsd6RMkjVDRZzb, EXAVITQu4vr4xnSDxMaL, IKne3meq5aSn9XLyUdCD, XrExE9yKIg1WjnnlVkGX, cgSgspJ2msm6clMCkdW9, nPczCjzI2devNBz1zQrb), scriptForAvatar (the talking head VO, 30-60 words), pacing (fast/medium/slow), gestures (array of 3 cue points), backgroundType, dressCode.';
        userPrompt = `Design AI avatar talking head for this ad. Product: "${params.product}". Audience: ${params.audience || 'general'}. Tone: ${params.tone || 'professional'}. Industry: ${params.industry || 'general'}.`;
        break;

      case 'stock_footage':
        systemPrompt = 'You are an expert at matching video ads with stock footage from Pexels and Pixabay. Return JSON with: scenes (array of {sceneNumber, description, keywords (array of 3-5 short search terms), pexelsUrl (https://www.pexels.com/search/videos/{kw1+kw2}/), pixabayUrl (https://pixabay.com/videos/search/{kw1+kw2}/), unsplashUrl (https://unsplash.com/s/photos/{kw1+kw2}), shotType (close-up/wide/medium), motionStyle (static/slow-pan/dynamic), durationSeconds)), generalKeywords (array), avoidKeywords (array), proTips (array of 3 strings).';
        userPrompt = `Match these script scenes with stock footage searches. Script/scenes: "${params.script}". Platform: ${params.platform || 'all'}. Mood: ${params.mood || 'energetic'}.`;
        break;

      case 'resize_advice':
        systemPrompt = 'You are an expert at adapting/resizing video ads across aspect ratios. Return JSON with: source (aspect ratio), targets (array of {ratio, platform (TikTok/Instagram Reels/YouTube Shorts/YouTube Landscape/Square Feed), reframingStrategy, focalPoint (where to keep subject), cropZones (array {scene, instruction}), textRepositioning, ctaPlacement, durationAdjustment}), commonMistakes (array), ffmpegCommandHint (string FFmpeg command template).';
        userPrompt = `Provide reframing/resizing advice. Source video aspect: ${params.sourceRatio || '16:9'}. Subject focus: ${params.subject || 'center'}. Has on-screen text: ${params.hasText || 'yes'}. Target platforms: ${params.targets || 'TikTok, Instagram Reels, YouTube Shorts, Square'}.`;
        break;

      case 'text_to_video_split':
        systemPrompt = 'You are an expert at splitting a video ad script into shootable B-roll scenes. Return JSON with: scenes (array of {sceneNumber, durationSeconds, visualPrompt (detailed cinematic description for AI video/image gen), cameraMove (static/pan/zoom/dolly), lighting, mood, voiceoverLine, textOverlay (optional)}), totalScenes, totalDuration, suggestedAspect (16:9/9:16/1:1), styleGuide.';
        userPrompt = `Split this script into ${params.sceneCount || 5} cinematic B-roll scenes ready for AI video gen. Script: "${params.script}". Style: ${params.style || 'cinematic modern'}. Aspect: ${params.aspect || '9:16'}.`;
        break;

      case 'scenes': {
        const openaiKey2 = Deno.env.get('OPENAI_API_KEY');
        if (!openaiKey2) { await refund(); throw new Error('OPENAI_API_KEY not configured'); }
        const { scenes, aspectRatio } = params;
        if (!Array.isArray(scenes) || scenes.length < 1 || scenes.length > 8) {
          await refund();
          return new Response(JSON.stringify({ error: 'scenes must be 1-8 prompts' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const size = aspectRatio === '9:16' ? '1024x1536' : aspectRatio === '1:1' ? '1024x1024' : '1536x1024';
        const frames: { prompt: string; b64: string }[] = [];
        for (const sceneText of scenes) {
          const r = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${openaiKey2}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'gpt-image-1', prompt: `Cinematic video ad scene, professional advertising photography, high quality: ${sceneText}`, size, quality: 'medium', n: 1 }),
          });
          if (!r.ok) {
            const errTxt = await r.text();
            await refund();
            return new Response(JSON.stringify({ error: `OpenAI image error ${r.status}: ${errTxt.slice(0, 200)}`, partialFrames: frames.length }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          const j = await r.json();
          const b64 = j.data?.[0]?.b64_json;
          if (!b64) { await refund(); return new Response(JSON.stringify({ error: 'No image data returned', partialFrames: frames.length }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }
          frames.push({ prompt: sceneText, b64 });
        }
        return new Response(JSON.stringify({ frames, credits_used: cost }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'sfx': {
        const elevenKey = Deno.env.get('ELEVENLABS_API_KEY');
        if (!elevenKey) { await refund(); throw new Error('ELEVENLABS_API_KEY not configured'); }
        const { prompt, durationSeconds = 5, promptInfluence = 0.4 } = params;
        if (!prompt || typeof prompt !== 'string' || prompt.length < 3 || prompt.length > 500) {
          await refund();
          return new Response(JSON.stringify({ error: 'prompt must be 3-500 chars' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const dur = Math.min(22, Math.max(0.5, Number(durationSeconds) || 5));
        const r = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
          method: 'POST',
          headers: { 'xi-api-key': elevenKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: prompt, duration_seconds: dur, prompt_influence: promptInfluence }),
        });
        if (!r.ok) { const txt = await r.text(); await refund(); return new Response(JSON.stringify({ error: `ElevenLabs SFX error ${r.status}: ${txt.slice(0, 200)}` }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }
        const buf = await r.arrayBuffer();
        return new Response(JSON.stringify({ audioBase64: b64encode(new Uint8Array(buf)), mimeType: 'audio/mpeg', credits_used: cost }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'tts': {
        const elevenKey = Deno.env.get('ELEVENLABS_API_KEY');
        if (!elevenKey) { await refund(); throw new Error('ELEVENLABS_API_KEY not configured'); }
        const { text, voiceId } = params;
        if (!text || typeof text !== 'string' || text.length < 1 || text.length > 5000) {
          await refund();
          return new Response(JSON.stringify({ error: 'Invalid text (1-5000 chars)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const vId = voiceId || 'JBFqnCBsd6RMkjVDRZzb';
        const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vId}?output_format=mp3_44100_128`, {
          method: 'POST',
          headers: { 'xi-api-key': elevenKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.4, use_speaker_boost: true } }),
        });
        if (!r.ok) { await refund(); const errTxt = await r.text(); return new Response(JSON.stringify({ error: `ElevenLabs error ${r.status}: ${errTxt.slice(0, 300)}` }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }
        const audioBuf = await r.arrayBuffer();
        return new Response(JSON.stringify({ audioBase64: b64encode(new Uint8Array(audioBuf)), mimeType: 'audio/mpeg', credits_used: cost }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'voice_clone': {
        const elevenKey = Deno.env.get('ELEVENLABS_API_KEY');
        if (!elevenKey) { await refund(); throw new Error('ELEVENLABS_API_KEY not configured'); }
        const { name, description, audioBase64, mimeType = 'audio/mpeg' } = params;
        if (!name || !audioBase64) { await refund(); return new Response(JSON.stringify({ error: 'name and audioBase64 are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }
        if (audioBase64.length > 14_000_000) { await refund(); return new Response(JSON.stringify({ error: 'Audio sample too large (max ~10MB)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }
        const audioBytes = b64decode(audioBase64);
        const ext = mimeType.includes('wav') ? 'wav' : mimeType.includes('m4a') ? 'm4a' : 'mp3';
        const form = new FormData();
        form.append('name', String(name).slice(0, 80));
        if (description) form.append('description', String(description).slice(0, 500));
        form.append('files', new Blob([audioBytes], { type: mimeType }), `sample.${ext}`);
        const r = await fetch('https://api.elevenlabs.io/v1/voices/add', { method: 'POST', headers: { 'xi-api-key': elevenKey }, body: form });
        if (!r.ok) { const txt = await r.text(); await refund(); return new Response(JSON.stringify({ error: `ElevenLabs voice clone error ${r.status}: ${txt.slice(0, 300)}` }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }
        const j = await r.json();
        return new Response(JSON.stringify({ voiceId: j.voice_id, credits_used: cost }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        await refund();
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    let result: unknown;
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
        }),
      });
      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`AI gateway error ${response.status}: ${txt.slice(0, 200)}`);
      }
      const aiData = await response.json();
      result = JSON.parse(aiData.choices[0].message.content);
    } catch (aiErr) {
      await refund();
      const msg = aiErr instanceof Error ? aiErr.message : String(aiErr);
      console.error('[video-ad-tools] AI error:', msg);
      return new Response(JSON.stringify({ error: msg }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ result, credits_used: cost }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[video-ad-tools] error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
