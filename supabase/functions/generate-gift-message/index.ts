import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { style, customPrompt, giftType, recipientName, type } = await req.json();
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

    // Check credits (3 credits per AI generation)
    const CREDIT_COST = 3;
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

    let systemPrompt = "";
    let userPrompt = "";

    // ─── UNIVERSAL TEXT-AI ROUTER ───
    // Map of `type` → system prompt for all aliased text/AI helpers.
    // Falls back to free-form prompt when not matched (uses customPrompt).
    const UNIVERSAL_PROMPTS: Record<string, string> = {
      // AI assistants & chats
      mentor_chat:        "You are an experienced career mentor. Provide thoughtful, personalized career advice.",
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
    };

    if (UNIVERSAL_PROMPTS[type]) {
      systemPrompt = UNIVERSAL_PROMPTS[type];
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
        max_tokens: type === "travel_planner" ? 1500 : 300,
        temperature: 0.8,
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

    // Deduct credits after successful generation
    await supabase
      .from("secret_santa_credits")
      .update({ credits_remaining: currentCredits - CREDIT_COST })
      .eq("user_id", user.id);

    // Log usage
    await supabase.from("social_gifts_ai_messages").insert({
      user_id: user.id,
      message_type: type || style || "message",
      prompt: customPrompt || null,
      generated_message: message,
    }).catch(() => {}); // Non-critical

    return new Response(JSON.stringify({ message }), {
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
