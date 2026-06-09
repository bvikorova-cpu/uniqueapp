import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Per-action credit cost. Mirrors the "X Credits" labels shown in /fashion-studio.
const ACTION_COSTS: Record<string, number> = {
  "battle-score": 5,
  "body-shape": 8,
  "celebrity-clone": 15,
  "color-harmony": 5,
  "color-season": 8,
  "compatibility": 8,
  "dress-code": 6,
  "fabric-analyzer": 10,
  "forecast-calendar": 12,
  "history-explorer": 10,
  "mood-board": 12,
  "mood-ring": 5,
  "ootd-score": 5,
  "outfit-cost": 8,
  "outfit-remix": 10,
  "personal-shopper": 2,
  "shopping-links": 6,
  "show-simulator": 15,
  "style-dna": 8,
  "style-scanner": 8,
  "sustainable": 6,
  "trend-forecaster": 10,
  "trend-radar": 12,
  "video-generator": 25,
  "virtual-stylist": 15,
  "wardrobe-analytics": 10,
  "capsule-wardrobe": 15,
  "street-style": 3,
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
    throw new Error("OpenAI API error");
  }
  const aiData = await response.json();
  const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall) {
    try { return JSON.parse(toolCall.function.arguments); } catch { return { result: toolCall.function.arguments }; }
  }
  const content = aiData.choices?.[0]?.message?.content || "";
  try { return JSON.parse(content); } catch { return { result: content }; }
}

function makeTool(name: string, props: Record<string, { type: string }>) {
  return [[{
    type: "function",
    function: { name, description: `Return ${name}`, parameters: { type: "object", properties: props, required: Object.keys(props) } }
  }], { type: "function", function: { name } }];
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ── 1. Auth guard ──────────────────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
    const token = authHeader.replace("Bearer ", "");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    // ── 2. Parse body & validate action ────────────────────
    let body: any;
    try { body = await req.json(); } catch { return jsonResponse({ error: "Invalid JSON body" }, 400); }
    const { action, ...p } = body || {};
    if (!action || typeof action !== "string") {
      return jsonResponse({ error: "Action required" }, 400);
    }
    const cost = ACTION_COSTS[action];
    if (cost === undefined) {
      return jsonResponse({ error: `Unknown action: ${action}` }, 400);
    }

    // ── 3. Credit guard (server-side, atomic) ──────────────
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const { data: creditsRow } = await adminClient
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const remaining = creditsRow?.credits_remaining ?? 0;
    if (remaining < cost) {
      return jsonResponse({ error: "Insufficient credits", required: cost, remaining }, 402);
    }

    // ── 4. AI call ─────────────────────────────────────────
    const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_KEY) return jsonResponse({ error: "OPENAI_API_KEY not configured" }, 500);
    const openaiUrl = "https://api.openai.com/v1/chat/completions";
    let result: any;

    switch (action) {
      case "battle-score":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are a professional fashion competition judge. Score outfits. Return JSON with: theme_score, creativity_score, style_score, impact_score, overall_score (all 1-100), judge_commentary, standout_elements (array), areas_to_improve (array)." },
          { role: "user", content: `Score this outfit for a style battle:\nBattle Theme: ${p.battleTheme}\nOutfit: ${p.outfitDescription}` }
        ]);
        break;

      case "body-shape": {
        const [tools, toolChoice] = makeTool("body_shape_result", { shapeAnalysis: { type: "string" }, bestStyles: { type: "string" }, avoidStyles: { type: "string" }, shoppingGuide: { type: "string" } });
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are a body-positive fashion stylist who helps people dress for their body shape with confidence." },
          { role: "user", content: `Analyze body shape and provide styling advice:\nHeight: ${p.height}cm\nBody Shape: ${p.bodyShape}\nStyle Goal: ${p.styleGoal}` }
        ], tools as any, toolChoice);
        break;
      }

      case "celebrity-clone":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are a celebrity fashion analyst. Break down celebrity looks and find budget alternatives. Return JSON with: celebrity, look_description, style_era, difficulty_to_recreate, items (array with original_item, brand, estimated_price, budget_alternative, budget_brand, budget_price, match_accuracy)." },
          { role: "user", content: `Break down ${p.celebrity}'s most iconic recent look and find ${p.budget_level} budget alternatives.` }
        ]);
        break;

      case "color-harmony": {
        const [tools, toolChoice] = makeTool("color_harmony", { harmonicPalette: { type: "string" }, outfitCombinations: { type: "string" }, avoidColors: { type: "string" }, seasonalAdaptation: { type: "string" } });
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are an expert color consultant specializing in fashion and personal styling." },
          { role: "user", content: `Create a color harmony analysis:\nBase Color: ${p.baseColor}\nOccasion: ${p.occasion}\nSkin Tone: ${p.skinTone}` }
        ], tools as any, toolChoice);
        break;
      }

      case "color-season":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are an expert color analyst specializing in seasonal color analysis for fashion. Return JSON with: season, sub_season, description, best_colors (array with name, hex, usage)." },
          { role: "user", content: `Perform seasonal color analysis for: skin tone=${p.skin_tone}, hair=${p.hair_color}, eyes=${p.eye_color}, undertone=${p.undertone}.` }
        ]);
        break;

      case "compatibility":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are a fashion compatibility analyst. Compare two styles and provide compatibility score, harmony analysis, color compatibility, occasion overlap, blending suggestions, and hybrid outfit ideas. Use markdown." },
          { role: "user", content: `Analyze compatibility between:\nStyle 1: ${p.outfit1}\nStyle 2: ${p.outfit2}` }
        ]);
        break;

      case "dress-code":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are a dress code expert. Provide dress code classification, Do's and Don'ts, 3 complete outfit suggestions, accessories guide, common mistakes, and cultural considerations. Use markdown." },
          { role: "user", content: `What should I wear to: ${p.eventDescription}` }
        ]);
        break;

      case "fabric-analyzer":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are an expert textile and fabric analyst. Return JSON with: fabric_name, composition (array with material, percentage), care_instructions, quality_rating, sustainability_score, best_uses." },
          { role: "user", content: p.imageUrl ? [{ type: "text", text: "Analyze this fabric image." }, { type: "image_url", image_url: { url: p.imageUrl } }] : `Analyze this fabric: ${p.description || ""}` }
        ]);
        break;

      case "forecast-calendar":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are a fashion forecast expert. Generate a 7-day fashion forecast calendar. Return JSON with: week_theme, trend_spotlight, days (array with day, date, weather_vibe, recommended_outfit, color_palette array)." },
          { role: "user", content: `Create a 7-day fashion forecast for someone in ${p.location} who prefers ${p.preferred_style} style.` }
        ]);
        break;

      case "history-explorer":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are a fashion historian. Analyze the item and provide historical era identification, cultural origins, evolution timeline, famous designers, modern interpretations, and how to wear today. Use markdown." },
          { role: "user", content: p.imageUrl ? [{ type: "text", text: "Analyze the fashion history of this item:" }, { type: "image_url", image_url: { url: p.imageUrl } }] : `Analyze the fashion history of: ${p.description || ""}` }
        ]);
        break;

      case "mood-board": {
        const [tools, toolChoice] = makeTool("mood_board", { moodDescription: { type: "string" }, keyPieces: { type: "string" }, textures: { type: "string" }, styling: { type: "string" } });
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are a creative fashion mood board designer." },
          { role: "user", content: `Create a fashion mood board:\nTheme: ${p.theme}\nAesthetic: ${p.aesthetic}` }
        ], tools as any, toolChoice);
        break;
      }

      case "mood-ring":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are a fashion psychologist who matches outfits to moods. Return JSON with: detected_mood, mood_emoji, mood_color (hex), fashion_prescription, outfits (array with outfit_name, description, key_pieces array)." },
          { role: "user", content: `Suggest outfits for mood="${p.mood}", energy=${p.energy_level}%, context="${p.context || 'general day'}".` }
        ]);
        break;

      case "ootd-score":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are an elite fashion critic. Score outfits honestly. Return JSON with: overall_score, style_score, color_harmony_score, occasion_appropriateness_score, trend_relevance_score (all 1-100), strengths, improvements, styling_tips (arrays), style_tags, celebrity_match, confidence_boost." },
          { role: "user", content: `Score this outfit:\nOutfit: ${p.outfitDescription}\nOccasion: ${p.occasion || 'Casual'}\nSeason: ${p.season || 'All-season'}\nBody Type: ${p.bodyType || 'Not specified'}` }
        ]);
        break;

      case "outfit-cost":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are an expert fashion cost analyst. Provide detailed cost breakdowns with budget/mid/luxury tiers, best value alternatives, where to buy, and cost-per-wear analysis. Use markdown with tables." },
          { role: "user", content: `Analyze the cost of this outfit: ${p.description}` }
        ]);
        break;

      case "outfit-remix":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are a creative fashion stylist. Remix an outfit into 10 different looks. Return JSON with: original_outfit, remix_count, variations (array with remix_name, occasion, changes_made array)." },
          { role: "user", content: `Remix this outfit into 10 different looks: "${p.outfit_description}".` }
        ]);
        break;

      case "personal-shopper":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: p.systemPrompt || "You are a personal fashion shopper assistant." },
          ...(p.messages || [{ role: "user", content: "Help me find an outfit" }])
        ]);
        break;

      case "shopping-links":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are a personal shopping assistant. Generate purchase recommendations with real store names. Return JSON with: outfit_concept, total_estimated_budget (EUR), styling_tip, items (array with item_name, brand, estimated_price EUR, where_to_buy array, style_match_score 0-100, description, alternatives array)." },
          { role: "user", content: `Find shopping recommendations:\nLooking for: ${p.description}\nBudget: €${p.budget}\nStyle: ${p.style}\nProvide 4-6 items with alternatives.` }
        ]);
        break;

      case "show-simulator":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are a world-class fashion show director. Generate detailed fashion show concepts. Return JSON with: show_title, opening_statement, looks (array with look_number, outfit_name, runway_description, music_cue, lighting_direction, commentary_script), finale_description, show_duration_minutes, audience_impact_score." },
          { role: "user", content: `Create a virtual fashion show for these outfits:\n${(p.outfitDescriptions || []).map((d: string, i: number) => `Look ${i+1}: ${d}`).join('\n')}\nTheme: ${p.theme || 'Modern Elegance'}\nMood: ${p.mood || 'Sophisticated'}` }
        ]);
        break;

      case "style-dna": {
        const [tools, toolChoice] = makeTool("style_dna_result", { styleProfile: { type: "string" }, colorPalette: { type: "string" }, wardrobeEssentials: { type: "string" }, styleIcons: { type: "string" } });
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are an expert fashion stylist and personal brand consultant." },
          { role: "user", content: `Analyze my style DNA:\nPreferences: ${p.preferences}\nBody Type: ${p.bodyType}\nLifestyle: ${p.lifestyle}` }
        ], tools as any, toolChoice);
        break;
      }

      case "style-scanner":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are an expert fashion analyst. Analyze outfit photos and return JSON with: outfit_name, overall_score 0-100, style_category, color_analysis, identified_items array, fit_analysis, occasion_match, trend_alignment, improvement_tips, celebrity_match, season_suitability." },
          { role: "user", content: p.imageUrl ? [{ type: "text", text: "Analyze this outfit photo in detail." }, { type: "image_url", image_url: { url: p.imageUrl } }] : `Analyze this outfit: ${p.description || ""}` }
        ]);
        break;

      case "sustainable": {
        const [tools, toolChoice] = makeTool("sustainable_result", { sustainabilityScore: { type: "string" }, swapSuggestions: { type: "string" }, ecoAlternatives: { type: "string" }, actionPlan: { type: "string" } });
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are a sustainable fashion expert helping people transition to eco-friendly wardrobes." },
          { role: "user", content: `Provide sustainable fashion recommendations:\nCurrent Wardrobe: ${p.wardrobe}\nBudget: ${p.budget}` }
        ], tools as any, toolChoice);
        break;
      }

      case "trend-forecaster": {
        const [tools, toolChoice] = makeTool("trend_forecast", { topTrends: { type: "string" }, colorTrends: { type: "string" }, fabricTrends: { type: "string" }, investmentPieces: { type: "string" } });
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are an expert fashion trend forecaster." },
          { role: "user", content: `Forecast fashion trends for ${p.season} in the ${p.category} category.` }
        ], tools as any, toolChoice);
        break;
      }

      case "trend-radar":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are a fashion trend radar analyst. Provide: HOT NOW (top 5 with virality score), EMERGING (5 upcoming), INVESTMENT PIECES (3 items), DECLINING styles, PREDICTION of next big trend. Use emojis and markdown." },
          { role: "user", content: `Generate trend radar report for: ${p.category}` }
        ]);
        break;

      case "video-generator":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are a cinematic fashion video director. Return JSON with: overall_concept, recommended_soundtrack, color_grading, total_duration, production_notes, storyboard (array with scene_number, scene_title, visual_description, camera_movement, lighting, music_mood, duration_seconds, transition)." },
          { role: "user", content: `Create a ${p.duration}-second ${p.style} fashion show video storyboard.\nConcept: ${p.concept}\nMood: ${p.mood || "Sophisticated"}` }
        ]);
        break;

      case "virtual-stylist":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: p.systemPrompt || "You are a virtual fashion stylist. Provide personalized outfit recommendations." },
          ...(p.messages || [{ role: "user", content: "Help me with my style" }])
        ]);
        break;

      case "wardrobe-analytics":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are a wardrobe analytics expert. Return JSON with: wardrobe_score 0-100, sustainability_rating, wardrobe_summary, category_breakdown, color_distribution, usage_insights, recommendations (array of 5 tips)." },
          { role: "user", content: `Analyze this wardrobe of ${(p.items || []).length} items: ${p.itemsSummary || "No items provided - generate sample analysis"}` }
        ]);
        break;

      case "capsule-wardrobe":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are a capsule wardrobe expert. Design a minimal versatile wardrobe. Use markdown." },
          { role: "user", content: p.prompt || "Design a capsule wardrobe for me" }
        ]);
        break;

      case "street-style":
        result = await callAI(OPENAI_KEY, openaiUrl, "gpt-4o-mini", [
          { role: "system", content: "You are a global street style analyst. Analyze current street fashion trends from major cities. Use markdown." },
          { role: "user", content: p.prompt || "Analyze current global street style trends" }
        ]);
        break;

      default:
        return jsonResponse({ error: `Unknown action: ${action}` }, 400);
    }

    // ── 5. Atomic credit deduction (race-safe, only on AI success) ──
    const { data: newRemaining, error: dedErr } = await adminClient.rpc(
      "deduct_ai_credits_atomic",
      { _user_id: user.id, _amount: cost },
    );
    if (dedErr) {
      if (dedErr.message?.includes("INSUFFICIENT_CREDITS")) {
        return jsonResponse({ error: "Insufficient credits", required: cost }, 402);
      }
      throw dedErr;
    }
    await adminClient.from("ai_credits")
      .update({ last_used_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return jsonResponse({ ...result, credits_remaining: newRemaining });


  } catch (e: any) {
    const status = typeof e?.status === "number" ? e.status : 500;
    return jsonResponse({ error: e?.message || "Internal error" }, status);
  }
});
