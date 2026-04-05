import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function callAI(apiKey: string, apiUrl: string, model: string, messages: any[], tools?: any[], toolChoice?: any) {
  const body: any = { model, messages };
  if (tools) { body.tools = tools; body.tool_choice = toolChoice; }
  
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 429) throw { status: 429, message: "Rate limited" };
    if (response.status === 402) throw { status: 402, message: "Payment required" };
    throw new Error("AI gateway error");
  }

  const aiData = await response.json();
  const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall) {
    try { return JSON.parse(toolCall.function.arguments); } catch { return { result: toolCall.function.arguments }; }
  }
  return { result: aiData.choices?.[0]?.message?.content };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action, ...params } = body;
    if (!action) throw new Error("Action required");

    const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");
    const lovableUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    const openaiUrl = "https://api.openai.com/v1/chat/completions";

    let result: any;

    switch (action) {
      case "battle-score":
        result = await callAI(OPENAI_KEY!, openaiUrl, "gpt-4o-mini",
          [
          { role: 'system', content: 'You are a professional fashion competition judge. Score outfits based on theme adherence, creativity, style, and overall impact. Return JSON.' },
          { role: 'user', content: `Score this outfit for a style battle:\n\nBattle Theme: ${params.battleTheme}\nOutfit: ${params.outfitDescription}\n\nReturn JSON with: theme_score (1-100), creativity_score (1-100), style_score (1-100), impact_score (1-100), overall_score (1-100), judge_commentary (detailed feedback string), standout_elements (array of strings), areas_to_improve (array of strings)` }
        ]
        );
        break;
      case "body-shape":
        result = await callAI(LOVABLE_KEY!, lovableUrl, "google/gemini-2.5-flash",
          [
          { role: "system", content: "You are a body-positive fashion stylist who helps people dress for their body shape with confidence. Focus on enhancing natural features and celebrating body diversity." },
          { role: "user", content: `Analyze body shape and provide styling advice:\n\nHeight: ${params.height}cm\nBody Shape: ${params.bodyShape}\nStyle Goal: ${params.styleGoal}\n\nProvide:\n1. shapeAnalysis: Analysis of body proportions and strengths\n2. bestStyles: Silhouettes, cuts, and styles that work best\n3. avoidStyles: Common style mistakes and what to avoid\n4. shoppingGuide: Specific brands and pieces to look for` }
        ]
          , [{
          type: "function",
          function: {
            name: "body_shape_result",
            description: "Return body shape analysis",
            parameters: {
              type: "object",
              properties: {
                shapeAnalysis: { type: "string" },
                bestStyles: { type: "string" },
                avoidStyles: { type: "string" },
                shoppingGuide: { type: "string" }
              },
              required: ["shapeAnalysis", "bestStyles", "avoidStyles", "shoppingGuide"]
            }
          }
        }]
          , { type: "function", function: { name: "body_shape_result" } }
        );
        break;
      case "celebrity-clone":
        result = await callAI(OPENAI_KEY!, openaiUrl, "gpt-4o-mini",
          [{
          role: "system",
          content: "You are a celebrity fashion analyst. Break down celebrity looks and find budget alternatives. Return JSON only."
        }, {
          role: "user",
          content: `Break down ${params.celebrity}'s most iconic recent look and find ${params.budget_level} budget alternatives. Return JSON: { "celebrity": "", "look_description": "", "style_era": "", "difficulty_to_recreate": "Easy/Medium/Hard", "items": [{"original_item":"","brand":"","estimated_price":"€500","budget_alternative":"","budget_brand":"","budget_price":"€45","match_accuracy":85}]
        );
        break;
      case "color-harmony":
        result = await callAI(LOVABLE_KEY!, lovableUrl, "google/gemini-2.5-flash",
          [
          { role: "system", content: "You are an expert color consultant specializing in fashion and personal styling. You understand color theory, seasonal color analysis, and how colors interact with different skin tones." },
          { role: "user", content: `Create a color harmony analysis:\n\nBase Color: ${params.baseColor}\nOccasion: ${params.occasion}\nSkin Tone: ${params.skinTone}\n\nProvide:\n1. harmonicPalette: 5-7 harmonious colors that work with the base color\n2. outfitCombinations: 3-4 complete outfit color combinations\n3. avoidColors: Colors that clash or don't work\n4. seasonalAdaptation: How to adapt this palette across seasons` }
        ]
          , [{
          type: "function",
          function: {
            name: "color_harmony",
            description: "Return color harmony analysis",
            parameters: {
              type: "object",
              properties: {
                harmonicPalette: { type: "string" },
                outfitCombinations: { type: "string" },
                avoidColors: { type: "string" },
                seasonalAdaptation: { type: "string" }
              },
              required: ["harmonicPalette", "outfitCombinations", "avoidColors", "seasonalAdaptation"]
            }
          }
        }]
          , { type: "function", function: { name: "color_harmony" } }
        );
        break;
      case "color-season":
        result = await callAI(OPENAI_KEY!, openaiUrl, "gpt-4o-mini",
          [{
          role: "system",
          content: "You are an expert color analyst specializing in seasonal color analysis for fashion. Return JSON only."
        }, {
          role: "user",
          content: `Perform seasonal color analysis for: skin tone=${params.skin_tone}, hair=${params.hair_color}, eyes=${params.eye_color}, undertone=${params.undertone}. Return JSON: { "season": "Spring/Summer/Autumn/Winter", "sub_season": "e.g. Deep Winter", "description": "", "best_colors": [{"name":"","hex":"#hex","usage":""}]
        );
        break;
      case "compatibility":
        result = await callAI(OPENAI_KEY!, openaiUrl, "gpt-4o-mini",
          [
          { role: "system", content: "You are a fashion compatibility analyst. Compare two styles/outfits and provide: 1) Compatibility score (0-100%), 2) Style harmony analysis, 3) Color compatibility, 4) Occasion overlap, 5) How to blend both styles, 6) Hybrid outfit suggestions combining elements. Use markdown." },
          { role: "user", content: `Analyze compatibility between:\n\nStyle 1: ${params.outfit1}\n\nStyle 2: ${params.outfit2}` }
        ]
        );
        break;
      case "dress-code":
        result = await callAI(OPENAI_KEY!, openaiUrl, "gpt-4o-mini",
          [
          { role: "system", content: "You are a dress code expert. Provide: 1) Exact dress code classification, 2) Do's and Don'ts, 3) 3 complete outfit suggestions (men & women), 4) Accessories guide, 5) Common mistakes to avoid, 6) Cultural considerations. Use markdown with clear sections." },
          { role: "user", content: `What should I wear to: ${params.eventDescription}` }
        ]
        );
        break;
      case "fabric-analyzer":
        result = await callAI(OPENAI_KEY!, openaiUrl, "gpt-4o-mini",
          [{
          role: "system",
          content: "You are an expert textile and fabric analyst. Analyze the fabric in the image. Return JSON only."
        }, {
          role: "user",
          content: [
            { type: "text", text: `Analyze this fabric image. Return JSON: { "fabric_name": "", "composition": [{"material":"","percentage":50}]
        );
        break;
      case "forecast-calendar":
        result = await callAI(OPENAI_KEY!, openaiUrl, "gpt-4o-mini",
          [{
          role: "system",
          content: "You are a fashion forecast expert. Generate a 7-day fashion forecast calendar. Return JSON only."
        }, {
          role: "user",
          content: `Create a 7-day fashion forecast for someone in ${params.location} who prefers ${params.preferred_style} style. Return JSON: { "week_theme": "", "trend_spotlight": "", "days": [{ "day": "Monday", "date": "Apr 1", "weather_vibe": "Sunny", "recommended_outfit": "", "color_palette": ["#hex1","#hex2","#hex3"]
        );
        break;
      case "history-explorer":
        result = await callAI(OPENAI_KEY!, openaiUrl, "gpt-4o-mini",
          [
          { role: "system", content: "You are a fashion historian. Analyze the image and provide: 1) Historical era identification, 2) Cultural origins & influences, 3) Evolution timeline of this style, 4) Famous designers associated, 5) Modern interpretations, 6) How to wear this historically-inspired look today. Use markdown." },
          { role: "user", content: [{ type: "text", text: "Analyze the fashion history of this item/outfit:" }, { type: "image_url", image_url: { url: imageUrl } }]
        );
        break;
      case "mood-board":
        result = await callAI(LOVABLE_KEY!, lovableUrl, "google/gemini-2.5-flash",
          [
          { role: "system", content: "You are a creative fashion mood board designer. Generate detailed, evocative mood board descriptions that inspire fashion collections." },
          { role: "user", content: `Create a fashion mood board:\n\nTheme: ${params.theme}\nAesthetic: ${params.aesthetic}\n\nProvide:\n1. moodDescription: Overall mood, atmosphere, and visual direction\n2. keyPieces: 8-10 key fashion pieces that define this mood\n3. textures: Fabrics, textures, and materials palette\n4. styling: Hair, makeup, and accessories direction` }
        ]
          , [{
          type: "function",
          function: {
            name: "mood_board",
            description: "Return mood board",
            parameters: {
              type: "object",
              properties: {
                moodDescription: { type: "string" },
                keyPieces: { type: "string" },
                textures: { type: "string" },
                styling: { type: "string" }
              },
              required: ["moodDescription", "keyPieces", "textures", "styling"]
            }
          }
        }]
          , { type: "function", function: { name: "mood_board" } }
        );
        break;
      case "mood-ring":
        result = await callAI(OPENAI_KEY!, openaiUrl, "gpt-4o-mini",
          [{
          role: "system",
          content: "You are a fashion psychologist who matches outfits to moods and emotions using color therapy. Return JSON only."
        }, {
          role: "user",
          content: `Suggest outfits for mood="${params.mood}", energy=${params.energy_level}%, context="${context || 'general day'}". Return JSON: { "detected_mood": "", "mood_emoji": "😊", "mood_color": "#hex", "fashion_prescription": "", "outfits": [{"outfit_name":"","description":"","key_pieces":[]
        );
        break;
      case "ootd-score":
        result = await callAI(OPENAI_KEY!, openaiUrl, "gpt-4o-mini",
          [
          { role: 'system', content: 'You are an elite fashion critic and stylist. Score outfits honestly and provide detailed, constructive feedback. Return JSON.' },
          { role: 'user', content: `Score this outfit of the day:\n\nOutfit: ${params.outfitDescription}\nOccasion: ${occasion || 'Casual'}\nSeason: ${season || 'All-season'}\nBody Type: ${bodyType || 'Not specified'}\n\nReturn JSON with: overall_score (1-100), style_score (1-100), color_harmony_score (1-100), occasion_appropriateness_score (1-100), trend_relevance_score (1-100), strengths (array of strings), improvements (array of strings), styling_tips (array of 3 specific tips), style_tags (array of style category tags like "minimalist", "streetwear"), celebrity_match (which celebrity has a similar style), confidence_boost (motivational message)` }
        ]
        );
        break;
      case "outfit-cost":
        result = await callAI(OPENAI_KEY!, openaiUrl, "gpt-4o-mini",
          [
          { role: "system", content: "You are an expert fashion cost analyst. Provide detailed cost breakdowns for outfits including: 1) Item-by-item cost estimates (budget/mid/luxury tiers), 2) Total outfit cost per tier, 3) Best value alternatives, 4) Where to buy recommendations, 5) Cost-per-wear analysis. Use markdown with tables." },
          { role: "user", content: `Analyze the cost of this outfit: ${params.description}` }
        ]
        );
        break;
      case "outfit-remix":
        result = await callAI(OPENAI_KEY!, openaiUrl, "gpt-4o-mini",
          [{
          role: "system",
          content: "You are a creative fashion stylist who can remix any outfit into 10 completely different looks. Return JSON only."
        }, {
          role: "user",
          content: `Remix this outfit into 10 different looks: "${params.outfit_description}". Return JSON: { "original_outfit": "", "remix_count": 10, "variations": [{"remix_name":"","occasion":"","changes_made":[]
        );
        break;
      case "personal-shopper":
        result = await callAI(OPENAI_KEY!, openaiUrl, "gpt-4o-mini",
          [
          { role: 'system', content: systemPrompt },
          ...messages
        ]
        );
        break;
      case "shopping-links":
        result = await callAI(OPENAI_KEY!, openaiUrl, "gpt-4o-mini",
          [
          {
            role: "system",
            content: `You are a personal shopping assistant. Generate purchase recommendations with real store names. Return JSON with: outfit_concept, total_estimated_budget (EUR), styling_tip, items array where each has: item_name, brand, estimated_price (EUR), where_to_buy (array of real store names like Zara, H&M, ASOS, Net-a-Porter, Farfetch, etc.), style_match_score (0-100), description, alternatives array (name, price, brand).`
          },
          {
            role: "user",
            content: `Find shopping recommendations:\nLooking for: ${params.description}\nBudget: €${params.budget}\nStyle: ${params.style}\nProvide 4-6 items with alternatives.`
          }
        ]
        );
        break;
      case "show-simulator":
        result = await callAI(OPENAI_KEY!, openaiUrl, "gpt-4o-mini",
          [
          { role: 'system', content: 'You are a world-class fashion show director and creative consultant. Generate detailed fashion show concepts with runway choreography, lighting design, music cues, and commentary scripts. Return JSON.' },
          { role: 'user', content: `Create a virtual fashion show concept for these outfits:\n${outfitDescriptions.map((d: string, i: number) => `Look ${i+1}: ${d}`).join('\n')}\n\nTheme: ${theme || 'Modern Elegance'}\nMood: ${mood || 'Sophisticated'}\n\nReturn JSON with: show_title, opening_statement, looks (array with: look_number, outfit_name, runway_description, music_cue, lighting_direction, commentary_script, styling_notes), finale_description, show_duration_minutes, audience_impact_score (1-100)` }
        ]
        );
        break;
      case "style-dna":
        result = await callAI(LOVABLE_KEY!, lovableUrl, "google/gemini-2.5-flash",
          [
          { role: "system", content: "You are an expert fashion stylist and personal brand consultant. Analyze the user's style preferences and create a comprehensive Style DNA profile." },
          { role: "user", content: `Analyze my style DNA:\n\nPreferences: ${params.preferences}\nBody Type: ${params.bodyType}\nLifestyle: ${params.lifestyle}\n\nProvide a detailed analysis with these sections:\n1. styleProfile: My unique fashion personality type and description\n2. colorPalette: Colors that work best for me and why\n3. wardrobeEssentials: Must-have pieces for my style\n4. styleIcons: Celebrities/fashion icons with similar style\n\nReturn as JSON with keys: styleProfile, colorPalette, wardrobeEssentials, styleIcons` }
        ]
          , [{
          type: "function",
          function: {
            name: "style_dna_result",
            description: "Return style DNA analysis",
            parameters: {
              type: "object",
              properties: {
                styleProfile: { type: "string" },
                colorPalette: { type: "string" },
                wardrobeEssentials: { type: "string" },
                styleIcons: { type: "string" }
              },
              required: ["styleProfile", "colorPalette", "wardrobeEssentials", "styleIcons"]
            }
          }
        }]
          , { type: "function", function: { name: "style_dna_result" } }
        );
        break;
      case "style-scanner":
        result = await callAI(OPENAI_KEY!, openaiUrl, "gpt-4o-mini",
          [
          {
            role: "system",
            content: `You are an expert fashion analyst. Analyze outfit photos and return JSON with: outfit_name, overall_score (0-100), style_category, color_analysis (primary_colors array, harmony_score 0-100, palette_name), identified_items array (item_name, brand_guess, estimated_price in EUR, style_rating 1-10), fit_analysis, occasion_match array, trend_alignment (0-100), improvement_tips array (3-5), celebrity_match, season_suitability.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this outfit photo in detail. Identify every item, estimate brands and prices, score the overall look." },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
        );
        break;
      case "sustainable":
        result = await callAI(LOVABLE_KEY!, lovableUrl, "google/gemini-2.5-flash",
          [
          { role: "system", content: "You are a sustainable fashion expert helping people transition to eco-friendly wardrobes. You know about ethical brands, sustainable materials, circular fashion, and environmental impact." },
          { role: "user", content: `Provide sustainable fashion recommendations:\n\nCurrent Wardrobe: ${params.wardrobe}\nBudget: ${params.budget}\n\nProvide:\n1. sustainabilityScore: Rate current wardrobe sustainability and explain\n2. swapSuggestions: Fast fashion items to replace with sustainable alternatives\n3. ecoAlternatives: Specific sustainable brands and materials recommendations\n4. actionPlan: A 30-day plan to make the wardrobe more sustainable` }
        ]
          , [{
          type: "function",
          function: {
            name: "sustainable_result",
            description: "Return sustainable fashion analysis",
            parameters: {
              type: "object",
              properties: {
                sustainabilityScore: { type: "string" },
                swapSuggestions: { type: "string" },
                ecoAlternatives: { type: "string" },
                actionPlan: { type: "string" }
              },
              required: ["sustainabilityScore", "swapSuggestions", "ecoAlternatives", "actionPlan"]
            }
          }
        }]
          , { type: "function", function: { name: "sustainable_result" } }
        );
        break;
      case "trend-forecaster":
        result = await callAI(LOVABLE_KEY!, lovableUrl, "google/gemini-2.5-flash",
          [
          { role: "system", content: "You are an expert fashion trend forecaster with deep knowledge of runway shows, street style, and global fashion movements." },
          { role: "user", content: `Forecast fashion trends for ${params.season} in the ${params.category} category.\n\nProvide:\n1. topTrends: Top 5-7 emerging trends with descriptions\n2. colorTrends: Trending colors and how to wear them\n3. fabricTrends: Materials and textures gaining popularity\n4. investmentPieces: Key pieces worth investing in this season` }
        ]
          , [{
          type: "function",
          function: {
            name: "trend_forecast",
            description: "Return trend forecast",
            parameters: {
              type: "object",
              properties: {
                topTrends: { type: "string" },
                colorTrends: { type: "string" },
                fabricTrends: { type: "string" },
                investmentPieces: { type: "string" }
              },
              required: ["topTrends", "colorTrends", "fabricTrends", "investmentPieces"]
            }
          }
        }]
          , { type: "function", function: { name: "trend_forecast" } }
        );
        break;
      case "trend-radar":
        result = await callAI(OPENAI_KEY!, openaiUrl, "gpt-4o-mini",
          [
          { role: "system", content: "You are a fashion trend radar analyst. Provide a comprehensive trend report: 1) 🔴 HOT NOW - Top 5 trending items/styles with virality score, 2) 🟡 EMERGING - 5 upcoming trends to watch, 3) 🟢 INVESTMENT PIECES - 3 items worth buying now, 4) 📉 DECLINING - styles losing momentum, 5) 🔮 PREDICTION - next big trend forecast, 6) Regional trend variations. Use emojis and markdown tables." },
          { role: "user", content: `Generate trend radar report for: ${params.category}` }
        ]
        );
        break;
      case "video-generator":
        result = await callAI(OPENAI_KEY!, openaiUrl, "gpt-4o-mini",
          [
          {
            role: "system",
            content: `You are a cinematic fashion video director. Create detailed scene-by-scene storyboards for fashion show videos. Return JSON with: overall_concept, recommended_soundtrack, color_grading, total_duration, production_notes, and storyboard array where each scene has: scene_number, scene_title, visual_description, camera_movement, lighting, music_mood, duration_seconds, transition.`
          },
          {
            role: "user",
            content: `Create a ${params.duration}-second ${params.style} fashion show video storyboard.\nConcept: ${params.concept}\nMood: ${mood || "Sophisticated"}\nGenerate 6-10 detailed scenes.`
          }
        ]
        );
        break;
      case "virtual-stylist":
        result = await callAI(OPENAI_KEY!, openaiUrl, "gpt-4o-mini",
          []
        );
        break;
      case "wardrobe-analytics":
        result = await callAI(OPENAI_KEY!, openaiUrl, "gpt-4o-mini",
          [
          {
            role: "system",
            content: `You are a wardrobe analytics expert. Analyze wardrobe data and return JSON with: wardrobe_score (0-100), sustainability_rating, wardrobe_summary (total_items, total_estimated_value EUR, avg_cost_per_wear EUR, most_worn_category, least_worn_category), category_breakdown array (category, count, percentage, value EUR), color_distribution array (color, count, percentage), usage_insights (most_versatile_item, underused_items array, cost_per_wear_champions array with item, cost_per_wear, times_worn), recommendations array (5 actionable tips).`
          },
          {
            role: "user",
            content: `Analyze this wardrobe of ${items?.length || 0} items: ${itemsSummary || "No items provided - generate sample analysis"}`
          }
        ]
        );
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    const status = e.status || 500;
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
