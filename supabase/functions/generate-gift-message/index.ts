import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const reqBody = await req.json();
    // Module-specific ledgers below (secret_santa_credits, kids_*_credits, teen_career_credits)
    // already act as the credit gate for legacy gift + kids flows. Universal AI helpers
    // (mentor_chat, chef_chat, legal, etc.) still need the unified ai_credits gate.
    // We therefore only apply requireAiCredits when NO module-specific ledger applies,
    // to prevent the user being charged twice (Bug fix 2026-04-30).
    const __style = reqBody.style;
    const __giftType = reqBody.giftType;
    const __type = reqBody.type;
    const __isLegacyGift = !!__style || !!__giftType;
    const __KIDS_TYPES = new Set(["kids_drawing", "kids_reading", "kids_story", "teen_career"]);
    const __hasModuleLedger = __isLegacyGift || (__type && __KIDS_TYPES.has(__type));

    let __deduct: () => Promise<void> = async () => {};
    if (!__hasModuleLedger) {
      const __auth = await requireAiCredits(req, corsHeaders, { credits: 1, usageType: "gift_message" });
      if (__auth.errorResponse) return __auth.errorResponse;
      __deduct = __auth.deduct!;
    }
    // Accept many naming conventions used across the frontend
    const style = __style;
    const giftType = __giftType;
    const recipientName = reqBody.recipientName;
    const type = __type;
    const customPrompt = reqBody.customPrompt || reqBody.prompt || reqBody.input || reqBody.message || reqBody.query;
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Auth & credit check
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    // Credit check ONLY for the legacy gift-message types (style/giftType set).
    // Universal aliased types (e.g. pet_name, legal, mentor_chat) skip this gate
    // because each hub has its own credit ledger handled by the calling component.
    const CREDIT_COST = 3;
    const isLegacyGift = !!style || !!giftType;
    if (isLegacyGift) {
      const { data: creditData } = await supabase
        .from("secret_santa_credits")
        .select("credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle();

      const currentCredits = creditData?.credits_remaining || 0;
      if (currentCredits < CREDIT_COST) {
        return new Response(
          JSON.stringify({ error: `Not enough credits. You need ${CREDIT_COST} credits for AI generation.` }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ─── KIDS HUB-SPECIFIC CREDIT GATING (paid-only model) ───
    // Each kids module has its own credit ledger. Deduct from the right table here
    // before invoking the AI. If insufficient, return 402.
    const KIDS_CREDIT_MAP: Record<string, { table: string; cost: number }> = {
      kids_drawing: { table: "kids_drawing_credits", cost: 2 },
      kids_reading: { table: "kids_reading_credits", cost: 2 },
      kids_story:   { table: "kids_story_credits",   cost: 3 },
      teen_career:  { table: "teen_career_credits",  cost: 5 },
    };
    const kidsCfg = type ? KIDS_CREDIT_MAP[type] : undefined;
    if (kidsCfg) {
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      const { data: kidsRow } = await adminClient
        .from(kidsCfg.table)
        .select("credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle();
      const kidsBalance = kidsRow?.credits_remaining ?? 0;
      if (kidsBalance < kidsCfg.cost) {
        return new Response(
          JSON.stringify({
            error: `Insufficient credits. Need ${kidsCfg.cost}, have ${kidsBalance}.`,
            creditsRequired: kidsCfg.cost,
            creditsRemaining: kidsBalance,
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      // Atomic optimistic-concurrency deduction
      const { error: deductErr } = await adminClient
        .from(kidsCfg.table)
        .update({ credits_remaining: kidsBalance - kidsCfg.cost })
        .eq("user_id", user.id)
        .eq("credits_remaining", kidsBalance);
      if (deductErr) {
        return new Response(
          JSON.stringify({ error: "Failed to deduct credits, please retry" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Best-effort fetch of current balance for the deduction step at the end
    const { data: creditData } = await supabase
      .from("secret_santa_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const currentCredits = creditData?.credits_remaining || 0;

    let systemPrompt = "";
    let userPrompt = "";

    // ─── UNIVERSAL TEXT-AI ROUTER ───
    // Map of `type` → system prompt for all aliased text/AI helpers.
    // Falls back to free-form prompt when not matched (uses customPrompt).
    const UNIVERSAL_PROMPTS: Record<string, string> = {
      // AI assistants & chats
      mentor_chat:        "PLACEHOLDER_MENTOR_CHAT", // dynamically replaced based on mentorArea below
      stock_content:      "You are a stock-photo content strategist. Generate compelling content ideas with SEO keywords.",
      chef_chat:          "You are a Michelin-starred chef. Answer cooking questions with expert techniques and tips.",
      offspring_chat:     "You are a digital offspring AI. Respond as the user's child would, based on their personality traits.",
      legal:              "You are a legal information assistant. Provide general legal information (NOT legal advice). Always recommend consulting a licensed attorney.",
      mystery_box:        "You are a mystery-box curator. Generate exciting, surprising contents for a mystery box.",
      teen_career:        "You are a teen career counselor. Suggest career paths matched to the teen's interests, skills and personality.",
      kids_homework:      "You are a friendly tutor for kids. Explain concepts simply with examples a child would understand. Encourage curiosity.",
      kids_drawing:       "You are an art teacher for kids. Provide a fun step-by-step drawing tutorial.",
      kids_reading:       "You are a reading companion for kids. Help with comprehension, vocabulary and story discussion.",
      kids_science:       "You are a science teacher for kids. Explain experiments and concepts safely and engagingly.",
      kids_story:         "You are a children's storyteller. Create a captivating, age-appropriate story.",
      // Pet AI
      pet_name:           "You are a creative pet-name generator. Suggest 10 unique, fitting names with brief meanings.",
      pet_personality:    "You are a pet behaviorist. Analyze the pet's personality and provide training/care recommendations.",
      pet_training:       "You are a certified dog trainer. Create a step-by-step training plan with timeline.",
      pet_mood:           "You are a pet mood analyst. Identify the pet's emotional state and explain visual/behavioral cues.",
      pet_health:         "You are a veterinary information assistant. Provide health insights (NOT diagnosis). Always recommend a vet for symptoms.",
      pet_compatibility:  "You are a pet-compatibility expert. Analyze how two pets/animals would interact.",
      pet_battle:         "You are a pet-battle strategist (game). Provide a tactical battle plan for the user's pet.",
      pet_story:          "You are a pet-story writer. Create a heartwarming/adventure story featuring the pet.",
      // Generators
      age_progression:    "Describe how a person/face would age realistically over the requested years. Include skin, features, hair changes.",
      ai_room:            "You are an interior designer. Suggest a complete room design including layout, palette and furniture.",
      castle_panorama:    "Describe a stunning 360° castle panorama with rich detail.",
      certificate:        "Generate a formal certificate text with elegant phrasing for the achievement/event.",
      collectible:        "Design a unique digital collectible with name, lore, rarity tier and stats.",
      course_content:     "Generate structured course content: outline, lessons, learning objectives, and exercises.",
      escape_panorama:    "Describe a 360° escape-room scene with hidden clues and atmosphere.",
      fashion_design:     "You are a fashion designer. Describe a complete outfit/collection concept with materials and styling.",
      music:              "You are a music composer. Describe a complete musical piece (genre, mood, structure, instrumentation, lyrics if applicable).",
      paint_by_numbers:   "Describe a paint-by-numbers design suitable for the requested theme.",
      paint_image:        "Describe a detailed painting concept with composition, palette and technique.",
      phobia_cure:        "You are an exposure-therapy guide. Design a gradual, science-backed cure plan for the phobia. Recommend professional help.",
      recipe_from_ingredients: "You are a creative chef. Design a recipe using ONLY the provided ingredients. Include steps, time and macros.",
      sports_prediction:  "You are a sports analyst. Provide a data-driven prediction with confidence level and key factors.",
      story_video:        "Write a script for a short story video including scene descriptions, dialogue and narration.",
      tattoo:             "You are a tattoo artist. Describe a meaningful tattoo design with symbolism, style and placement.",
      teacher_coloring:   "Generate a coloring page concept suitable for the classroom theme.",
      video_ad:           "You are an ad creative. Write a 30-second video ad script with hook, body and CTA.",
      video_thumbnail:    "Describe a high-CTR video thumbnail concept (composition, text, expression, colors).",
      virtual_tour:       "Describe a 360° virtual tour script with key points of interest.",
      weekly_meal_plan:   "You are a nutritionist. Build a balanced 7-day meal plan with macros and shopping list.",
      translate_audio:    "Translate the text faithfully to the target language and indicate pronunciation tips.",
      bulk_panoramas:     "Describe multiple themed 360° panoramas as a structured list.",
      shadow_story:       "Enhance the dark/mystery story with vivid atmosphere, twists and emotional depth.",
      // Niche helpers
      karmic_debt:        "You are a numerologist. Calculate karmic debt numbers from the birth date and explain their meaning.",
      genetic_matches:    "You are a genealogist. Suggest plausible genetic-match interpretations from the data.",
      soul_matches:       "You are a relationship insight AI. Suggest soul-match traits and compatibility for the user.",
      brain_duel_match:   "You are a matchmaker for brain duels. Suggest opponents based on skill level and topic preferences.",
      // ─── Sports AI (basketball / football / hockey / tennis / american football) ───
      basketball_analysis: "You are a professional basketball analyst. Provide detailed post-match analysis with concrete numbers, tactical observations and actionable improvements.",
      basketball_tactics:  "You are a basketball tactical coach. Design optimal lineups, offensive sets, defensive schemes and matchup advantages. Be specific and concrete.",
      basketball_scout:    "You are a basketball scout. Return ONLY valid JSON array of player prospects with realistic stats and reasonable price tags.",
      basketball_training: "You are a basketball strength & skills coach. Build a structured training plan targeting the player's weakest attributes.",
      basketball_chemistry:"You are a team chemistry analyst. Score chemistry between listed players and suggest pairings/rotations.",
      football_analysis:   "You are a football (soccer) analyst. Provide post-match analysis: performance summary, strengths, weaknesses, transfer targets and next-match preparation.",
      football_tactics:    "You are a football tactical coach. Analyze formation, recommend tactics, define player roles and pre-empt opponent weaknesses.",
      football_scout:      "You are a football talent scout. Return ONLY valid JSON array of prospects with realistic ratings, potential and prices.",
      football_training:   "You are a football fitness & technique coach. Build a structured weekly training plan.",
      football_prediction: "You are a football match predictor. Provide a data-driven prediction with confidence level and key factors.",
      hockey_analysis:     "You are an ice-hockey analyst. Provide post-match analysis incl. zone efficiency, special teams (PP/PK), line changes.",
      hockey_tactics:      "You are an ice-hockey tactical coach. Recommend optimal lines, PP/PK schemes, forechecking system and plays.",
      hockey_scout:        "You are an ice-hockey scout. Return ONLY valid JSON array of prospects with skating/shooting/defense/speed stats.",
      hockey_training:     "You are an ice-hockey strength coach. Build a training plan targeting weak attributes.",
      tennis_analysis:     "You are a tennis analyst. Provide post-match analysis incl. serve, return, net play and break-point conversion.",
      tennis_tactics:      "You are a tennis coach. Recommend match strategy, shot patterns and surface-specific adjustments.",
      tennis_scout:        "You are a tennis scout. Return ONLY valid JSON array of prospects with realistic stats.",
      tennis_training:     "You are a tennis fitness & technique coach. Build a structured training plan.",
      af_analysis:         "You are an American-football analyst. Provide post-match analysis incl. offense, defense, special teams and red-zone efficiency.",
      af_tactics:          "You are an American-football coordinator. Recommend offensive formations, defensive schemes, special teams and key plays.",
      af_scout:            "You are an American-football scout. Return ONLY valid JSON array of prospects with realistic stats and prices.",
      af_training:         "You are an American-football coach. Build a training plan targeting weak attributes.",
      // ─── Match simulators (return narrative play-by-play) ───
      basketball_match:    "You are a basketball play-by-play commentator. Simulate the match quarter-by-quarter with realistic scores and key moments.",
      football_match:      "You are a football commentator. Simulate the match minute-by-minute with realistic scoring and key events.",
      hockey_match:        "You are a hockey play-by-play commentator. Simulate the match period-by-period with realistic scoring.",
      tennis_match:        "You are a tennis commentator. Simulate the match set-by-set with key points and momentum shifts.",
      af_match:            "You are an American-football commentator. Simulate the match quarter-by-quarter with key drives.",
      // ─── Wellness / fitness / nutrition ───
      meal_analysis:       "You are a registered nutritionist. Analyze the meal: estimated calories/macros/micros, weight-loss suitability score 1-10, improvements. End with an emoji verdict.",
      cultural_guide:      "You are a cultural travel guide. Provide a respectful, thorough cultural briefing: greetings, etiquette, dress, dining, religion, gestures to avoid, basic phrases with pronunciation, public norms, photography rules, holidays.",
      wellness_advice:     "You are a wellness coach (NOT a doctor). Provide holistic advice on stress, sleep, movement and mindfulness. Recommend professional help for serious symptoms.",
      fitness_plan:        "You are a certified personal trainer. Build a safe, progressive workout plan tailored to the user's goal and experience.",
      nutrition_plan:      "You are a registered nutritionist. Build a balanced meal plan with macros and shopping list.",
      // ─── Generic AI helpers ───
      avatar:              "You are an avatar designer. Describe a unique avatar matching the description and style.",
      bio:                 "You are a profile-bio writer. Write a concise, engaging bio (max 160 chars).",
      monetization_ideas:  "You are a monetization strategist. Generate 5 creative, actionable monetization ideas with target audience, revenue model and implementation steps.",
      escape_room_panorama:"You are an escape-room designer. Describe a 360° panorama of the room with hidden clues and atmospheric detail.",
      influ_king:          "You are a social-media growth expert (Influ-King). Provide expert advice on the requested influencer task.",
      antique_appraisal:   "You are an antiques appraiser. Provide estimated value range, era, authenticity notes and selling recommendations.",
      handwriting:         "You are a graphologist. Analyze the handwriting traits and what they may suggest about the writer's personality.",
      lie_detector:        "You are a behavioral analysis assistant. Score statement credibility 0-100% with reasoning. NOT a substitute for legal/professional analysis.",
      iq_question:         "You are an IQ test designer. Generate a logic/pattern question with 4 options and indicate the correct answer.",
      brand_battle:        "You are a brand strategist. Compare the brands across positioning, audience and competitive edge.",
      character_chat:      "You are role-playing as the requested character. Stay in character and respond naturally.",
      creative_forge:      "You are a creative director. Generate the requested creative concept with vivid, actionable detail.",
      coloring_page:       "Describe a coloring page concept suitable for the requested age group and theme.",
      cooking_tip:         "You are a Michelin-starred chef. Provide a concrete cooking tip or recipe variation.",
      photo_concept:       "You are a photo art director. Describe a photo composition with lighting, framing and styling.",
      gift_idea:           "You are a gift-idea generator. Suggest 5 thoughtful, personalized gift ideas with budget tiers.",
      past_life:           "You are a past-life narrator (entertainment, not factual). Craft an evocative past-life vignette.",
      phobia:              "You are a phobia coach. Explain the phobia compassionately and outline gradual coping steps. Recommend professional help.",
      reincarnation:       "You are a reincarnation storyteller (entertainment). Craft a vivid reincarnation reading.",
      shadow_arena:        "You are a dark-fantasy game master. Narrate the shadow-arena scene dramatically.",
      time_capsule:        "You are a time-capsule writer. Compose a heartfelt message for a future recipient.",
      time_reversal:       "You are a 'what if' historian. Narrate an alternate timeline based on the reversal premise.",
      crystal_energy:      "You are a crystal-energy consultant (entertainment). Suggest crystals and rituals for the user's intent.",
      lottery_tuning:      "You are a probability analyst. Generate balanced, varied lottery number sets with brief reasoning (entertainment only).",
      tutoring:            "You are an expert tutor. Explain the topic step-by-step with examples and a quick check-for-understanding question.",
      educational:         "You are an educational content designer. Create structured learning material with objectives, content and exercises.",
      anonymous_date:      "You are an anonymous-dating coach. Suggest a creative ice-breaker and 3 thoughtful follow-up questions.",
      best_friend:         "You are an empathetic best-friend AI. Respond warmly, actively listen and offer gentle support.",
      psychology:          "You are a psychology assistant (NOT a therapist). Offer evidence-based perspectives and recommend professional help when appropriate.",
      safety_check:        "You are a safety-content moderator. Flag risk and suggest safer alternatives where applicable.",
      future_face:         "Describe how the user's face would look in the requested future scenario.",
      multiverse:          "You are a multiverse storyteller. Narrate a vivid alternate-reality version of the user's situation.",
      decor:               "You are an interior decorator. Suggest a cohesive decor concept with palette, materials and key pieces.",
      companion:           "You are a friendly AI companion. Respond warmly and naturally to the user.",
      mega_talent:         "You are a talent-show coach. Evaluate the talent description and provide actionable feedback.",
      job_match:           "You are a career advisor. Match the user's profile to suitable job roles and explain why.",
      property_listing:    "You are a real-estate copywriter. Write a compelling property listing description.",
      fundraising:         "You are a fundraising copywriter. Write a compelling, honest campaign pitch.",
      group_suggestion:    "You are a community manager. Suggest relevant groups based on the user's interests.",
      event_idea:          "You are an event planner. Suggest 3 creative event concepts with logistics outline.",
      poll_question:       "You are a community-engagement specialist. Generate engaging poll questions with 4 options each.",
      hashtag_suggest:     "You are a social-media strategist. Suggest 10 trending, relevant hashtags.",
      caption:             "You are a social-media copywriter. Write a punchy caption with 1-2 emojis.",
      story_idea:          "You are a storyteller. Suggest 3 short story concepts with a hook for each.",
      voice_script:        "You are a voice-over scriptwriter. Write a natural, conversational script.",
      voice_transform:     "PLACEHOLDER_VOICE_TRANSFORM", // dynamically replaced based on style below
      // ─── Generic fallback for unknown types ───
      generic_ai:          "You are a helpful AI assistant. Provide a clear, useful response to the user's request.",
    };

    // ─── IMAGE GENERATION BRANCH ───
    // Routes media-generating proxies (paint-image, video-thumbnail, virtual-tryon, etc.)
    // through OpenAI (gpt-image-1) and returns base64 data URL.
    const IMAGE_TYPES: Record<string, string> = {
      // proxyMap keys (snake_case from kebab-case function names)
      generate_paint_image:        "Detailed acrylic painting, gallery quality, vivid colors, expressive brushwork.",
      generate_paint_by_numbers:   "Paint-by-numbers template: clean black outlines on white, numbered regions, simple shapes.",
      generate_video_thumbnail:    "High-CTR YouTube thumbnail, bold composition, dramatic lighting, expressive subject, vibrant colors.",
      generate_tattoo:             "Detailed tattoo design on white background, fine linework, ready for stencil.",
      generate_teacher_coloring:   "Black-and-white coloring page, clean outlines, kid-friendly, no shading.",
      generate_collectible:        "Digital collectible artwork, fantasy/sci-fi style, premium card art quality, intricate detail.",
      generate_ai_room_design:     "Photorealistic interior room design, magazine quality, natural lighting.",
      generate_castle_panorama:    "Panoramic 360° castle scene, cinematic lighting, ultra-detailed.",
      generate_escape_room_panorama:"360° escape-room panorama, dramatic lighting, hidden clues.",
      generate_virtual_tour:       "Photorealistic 360° panoramic interior view, real-estate quality.",
      bulk_generate_panoramas:     "Cinematic 360° panorama, ultra-detailed environment.",
      generate_age_progression:    "Photorealistic portrait showing realistic aging progression, soft natural lighting.",
      generate_fashion_design:     "Editorial fashion photograph of the described outfit, high-fashion lighting.",
      generate_story_video:        "Cinematic still frame from the described story scene, film grade.",
      generate_video_ad:           "Cinematic ad keyframe, brand-quality lighting and composition.",
      virtual_tryon:               "Photorealistic person wearing the described outfit, full body, studio lighting.",
      photo_ai_upscaling:          "Ultra-high-resolution photorealistic version of the described image, sharp detail.",
      restore_old_photo:           "Restored vintage photograph, repaired damage, original colors preserved.",
      photo_colorization_pro:      "Naturally colorized version of the described black-and-white photo.",
      photo_face_enhancement:      "Enhanced photorealistic portrait with improved facial detail, soft natural lighting.",
      photo_background_removal:    "Subject isolated on clean white background, sharp cut-out edges.",
      photo_damage_detection:      "Photorealistic comparison highlighting damaged regions of an old photograph.",
      home_virtual_staging:        "Photorealistic virtually-staged interior with stylish furniture, magazine quality.",
      home_color_palette:          "Interior design mood-board showing a cohesive color palette and material samples.",
      home_furniture_recommender:  "Photorealistic interior arrangement with recommended furniture pieces.",
      antique_ar_room:             "Photorealistic AR preview of the antique displayed in a tasteful room setting.",
      antique_museum_display:      "Museum-grade display of the antique in an elegant exhibition case.",
      beauty_nail_art:             "High-resolution nail art design, manicure photography, studio lighting.",
      beauty_transformation:       "Photorealistic before/after beauty transformation portrait.",
      beauty_tutorial:             "Step-by-step beauty tutorial visual reference, soft studio lighting.",
      capsule_wardrobe:            "Flat-lay editorial photo of a coordinated capsule wardrobe.",
      outfit_recommender:          "Editorial flat-lay or full-body shot of the recommended outfit.",
      // direct/legacy short aliases
      paint_image:        "Detailed acrylic painting, gallery quality, vivid colors.",
      paint_by_numbers:   "Paint-by-numbers template: clean outlines, numbered regions.",
      video_thumbnail:    "High-CTR thumbnail, bold composition, dramatic lighting.",
      tattoo:             "Detailed tattoo design on white background, fine linework.",
      teacher_coloring:   "Black-and-white coloring page, clean outlines.",
      coloring_page:      "Black-and-white coloring page, clean outlines.",
      collectible:        "Digital collectible artwork, premium card art.",
      ai_room:            "Photorealistic interior room design.",
      castle_panorama:    "Panoramic 360° castle scene.",
      escape_panorama:    "360° escape-room scene.",
      escape_room_panorama:"360° escape-room panorama.",
      virtual_tour:       "Photorealistic 360° panoramic interior view.",
      future_face:        "Photorealistic portrait of the described future face.",
      age_progression:    "Photorealistic portrait with realistic aging.",
      fashion_design:     "Editorial fashion photograph of the outfit.",
      avatar:             "Stylized avatar portrait, clean background.",
      photo_concept:      "Cinematic photo composition.",
      generate_image:     "High-quality photorealistic image as described.",
    };

    if (IMAGE_TYPES[type]) {
      // OpenAI image generation (gpt-image-1) — same OPENAI_API_KEY as text branch.
      const stylePrefix = IMAGE_TYPES[type];
      const subject = customPrompt || reqBody.title || reqBody.description || `a ${type.replace(/_/g, " ")}`;
      const imgPrompt = `${stylePrefix} Subject: ${subject}`;

      const imgResp = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: imgPrompt,
          size: "1024x1024",
          n: 1,
        }),
      });

      if (!imgResp.ok) {
        if (imgResp.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded, try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errText = await imgResp.text();
        console.error("OpenAI image gen error:", errText);
        return new Response(JSON.stringify({ error: "Image generation failed" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const imgData = await imgResp.json();
      const b64 = imgData.data?.[0]?.b64_json;
      const directUrl = imgData.data?.[0]?.url;
      const imageUrl = b64 ? `data:image/png;base64,${b64}` : directUrl;
      if (!imageUrl) {
        return new Response(JSON.stringify({ error: "No image returned from OpenAI" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await __deduct().catch((e) => console.error("deduct failed:", e));
      return new Response(JSON.stringify({
        imageUrl,
        templateImageUrl: imageUrl,
        url: imageUrl,
        image: imageUrl,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (UNIVERSAL_PROMPTS[type]) {
      systemPrompt = UNIVERSAL_PROMPTS[type];
      // Dynamic specialization for mentor_chat based on mentorArea
      if (type === "mentor_chat") {
        const area = (reqBody.mentorArea || reqBody.area || "career").toString().toLowerCase();
        const MENTOR_PROMPTS: Record<string, string> = {
          career: "You are an elite career coach with 20+ years experience. Help with career planning, interview prep, resume optimization, workplace challenges, and professional development. Be specific, actionable, and encouraging. Use markdown formatting.",
          fitness: "You are a certified fitness & nutrition coach. Help with workout planning, nutrition guidance, healthy habits, progress tracking, and injury prevention. Always recommend consulting a doctor before starting new programs. Be specific and motivating. Use markdown formatting.",
          mindset: "You are a mindset & resilience coach trained in CBT and positive psychology. Help with mental resilience, goal achievement, confidence building, stress management, and positive thinking. Be empathetic and practical. Use markdown formatting.",
          relationships: "You are a relationships & communication coach. Help with communication skills, conflict resolution, emotional intelligence, healthy boundaries, and connection building. Be warm, non-judgmental, and concrete. Use markdown formatting.",
        };
        systemPrompt = MENTOR_PROMPTS[area] || MENTOR_PROMPTS.career;
      } else if (type === "voice_transform") {
        const styleDesc: Record<string, string> = {
          warm: "warm, friendly, slightly casual, with a small touch of emotion or emoji",
          professional: "polished, precise, courteous, business-appropriate",
          energetic: "high-energy, enthusiastic, exclamation-heavy, motivational",
          calm: "calm, measured, soothing, contemplative",
          authoritative: "direct, confident, decisive, leadership-tone",
        };
        const desc = styleDesc[style] || styleDesc.warm;
        systemPrompt = `Rewrite the user's text in a ${desc} voice. Keep meaning. Output only the rewritten text, no preamble.`;
      }
      userPrompt = customPrompt || `Generate the ${type} as requested.`;
    } else if (type === "travel_planner") {
      systemPrompt = "You are an expert travel advisor and trip planner. Provide detailed, practical, and well-organized travel advice. Use clear headings, bullet points, and specific recommendations. Be thorough but concise.";
      userPrompt = customPrompt || "Suggest a great travel destination";
    } else if (type === "gift_designer") {
      systemPrompt = `You are a creative gift designer AI. Create a unique personalized digital gift concept. Return ONLY valid JSON: {"name": "...", "description": "...", "emoji": "...", "value": number, "theme": "..."}. The value should be between 10-500. Be creative and unique.`;
      userPrompt = customPrompt || "Create a unique surprise gift";
    } else if (type === "thank_you") {
      systemPrompt = "You are a heartfelt thank-you message writer. Write ONLY the thank you message, no quotes, no explanation. Make it genuine and touching.";
      const styleMap: Record<string, string> = {
        heartfelt: "Write a sincere, emotionally touching thank you.",
        funny: "Write a humorous, playful thank you that makes them smile.",
        formal: "Write a polite, professional thank you.",
        poetic: "Write a beautiful, artistic thank you with poetic language.",
        excited: "Write an enthusiastic, energetic thank you full of excitement.",
        grateful: "Write a deeply grateful, appreciative thank you.",
      };
      userPrompt = `${styleMap[style] || styleMap.heartfelt} Keep it 2-3 sentences. ${customPrompt || ""}`;
    } else if (type) {
      // Unknown type → generic fallback (so we never 404 the frontend)
      systemPrompt = "You are a helpful AI assistant. Provide a clear, useful, well-structured response.";
      userPrompt = customPrompt || `Help with: ${type}`;
    } else {
      const stylePrompts: Record<string, string> = {
        romantic: "Write a sweet, loving, and romantic message.",
        funny: "Write a humorous and playful message that will make them smile.",
        heartfelt: "Write a sincere and emotionally touching message.",
        friendly: "Write a warm, casual, and friendly message.",
        poetic: "Write a beautiful, artistic message with poetic language.",
        motivational: "Write an inspiring and uplifting message.",
      };

      systemPrompt = "You are a gift message writer. Write ONLY the message, no quotes, no explanation.";
      userPrompt = `${stylePrompts[style] || stylePrompts.heartfelt} Keep it 2-3 sentences.
${giftType ? `Gift being sent: ${giftType}` : ""}
${recipientName ? `Recipient's name: ${recipientName}` : ""}
${customPrompt ? `Additional context: ${customPrompt}` : ""}`;
    }

    console.log("Generating with OpenAI, type:", type || "message", "style:", style);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: (() => {
          const longTypes = new Set(["travel_planner", "cultural_guide", "weekly_meal_plan", "fitness_plan", "nutrition_plan", "course_content", "educational", "monetization_ideas"]);
          const isSport = type && /(_analysis|_tactics|_match|_training|_scout|_chemistry|_prediction)$/.test(type);
          if (longTypes.has(type)) return 1500;
          if (isSport) return 1200;
          return 600;
        })(),
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content?.trim() || "Sending you warm wishes!";

    // Deduct credits after successful generation (best-effort, never fail the request)
    try {
      await supabase
        .from("secret_santa_credits")
        .update({ credits_remaining: currentCredits - CREDIT_COST })
        .eq("user_id", user.id);
    } catch { /* ignore */ }

    // Log usage (best-effort)
    try {
      await supabase.from("social_gifts_ai_messages").insert({
        user_id: user.id,
        message_type: type || style || "message",
        prompt: customPrompt || null,
        generated_message: message,
      });
    } catch { /* ignore */ }

    // Return ALL common response keys so any frontend component can read it
    await __deduct().catch((e) => console.error("deduct failed:", e));
    return new Response(JSON.stringify({ message, text: message, result: message, content: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
