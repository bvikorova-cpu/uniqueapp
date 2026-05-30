import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Early auth pre-check (returns 401 instead of crashing inside try → 500)
  const _earlyAuth = req.headers.get("Authorization");
  if (!_earlyAuth || !_earlyAuth.toLowerCase().startsWith("bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { action, ...params } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const creditCosts: Record<string, number> = {
      mood_journal: 3,
      conversation_starters: 2,
      encouragement_cards: 3,
      life_coach: 4,
      friendship_analytics: 4,
      mood_playlist: 3,
      daily_affirmations: 2,
      friendship_games: 3,
      dream_companion: 4,
      memory_scrapbook: 3,
      gratitude_garden: 3,
      friendship_horoscope: 2,
      conflict_resolver: 4,
      bucket_list: 3,
      self_care_planner: 3,
    };

    const cost = creditCosts[action];
    if (!cost) throw new Error(`Unknown action: ${action}`);

    const { data: credits } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    const remaining = credits?.credits_remaining || 0;
    if (remaining < cost) {
      return new Response(JSON.stringify({ error: "Insufficient credits", credits_remaining: remaining, cost }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "mood_journal": {
        systemPrompt = `You are a compassionate AI mood analyst and journal companion. Analyze the user's mood entry and provide deep emotional insights. Return a JSON object with:
- mood_score (1-10 integer)
- mood_label (one word: Happy, Sad, Anxious, Calm, Excited, Stressed, Grateful, Lonely, Motivated, Confused)
- insight (2-3 sentences of empathetic analysis about their emotional state)
- patterns (array of 2-3 emotional patterns you notice)
- suggestion (one actionable self-care suggestion)
- affirmation (a personalized positive affirmation)`;
        userPrompt = `Analyze this mood journal entry: "${params.entry}"`;
        break;
      }
      case "conversation_starters": {
        systemPrompt = `You are a creative friendship conversation designer. Generate engaging, fun, and meaningful conversation starters. Return a JSON object with:
- starters (array of 6 objects, each with: text, category (Fun/Deep/Creative/Nostalgia/Goals/Random), emoji)
- theme (the overall conversational theme you chose)
- tip (a brief tip on how to have better conversations)`;
        userPrompt = params.context
          ? `Generate conversation starters based on these interests: ${params.context}`
          : `Generate diverse and engaging conversation starters for a best friend chat.`;
        break;
      }
      case "encouragement_cards": {
        systemPrompt = `You are an uplifting AI encouragement specialist. Create beautiful, personalized encouragement cards. Return a JSON object with:
- cards (array of 4 objects, each with: title, message (2-3 inspiring sentences), emoji, color_theme (lavender/coral/mint/gold))
- daily_mantra (a short powerful daily mantra)
- gratitude_prompt (a gratitude reflection question)`;
        userPrompt = params.situation
          ? `Create encouragement cards for someone going through: ${params.situation}`
          : `Create uplifting encouragement cards for general positivity and self-empowerment.`;
        break;
      }
      case "life_coach": {
        systemPrompt = `You are an expert AI life coach specializing in goal-setting, productivity, and personal growth. Return a JSON object with:
- assessment (2-3 sentences analyzing their current situation)
- goals (array of 3 SMART goals, each with: goal, timeline, first_step, motivation)
- action_plan (array of 5 specific daily actions)
- mindset_shift (one key mindset change to focus on)
- accountability_check (a question to ask themselves weekly)
- resources (array of 3 recommended activities or practices)`;
        userPrompt = `Provide life coaching for: "${params.topic}"`;
        break;
      }
      case "friendship_analytics": {
        systemPrompt = `You are an AI friendship analytics expert. Analyze the user's conversation history and friendship patterns. Return a JSON object with:
- communication_style (object with: primary_style (string), strengths (array of 3 strings), areas_to_improve (array of 2 strings))
- emotional_trends (array of 5 objects with: week (string like "Week 1"), sentiment_score (1-10), dominant_emotion (string))
- conversation_insights (object with: avg_message_length (string), most_active_time (string), favorite_topics (array of 3 strings), engagement_score (1-100))
- friendship_health_score (1-100 integer)
- growth_areas (array of 3 objects with: area (string), tip (string), emoji (string))
- fun_stats (object with: total_laughs (number), deep_conversations (number), supportive_moments (number), random_fun_facts (array of 2 strings))`;
        userPrompt = params.conversationSummary
          ? `Analyze these friendship patterns: ${params.conversationSummary}. Messages exchanged: ${params.messageCount || 0}`
          : `Generate sample friendship analytics for someone with ${params.messageCount || 50} messages exchanged. Make it insightful and encouraging.`;
        break;
      }
      case "mood_playlist": {
        systemPrompt = `You are an AI music therapist who creates personalized playlists based on emotional state. Return a JSON object with:
- playlist_name (creative playlist title)
- playlist_description (1-2 sentence description of the vibe)
- songs (array of 8 objects, each with: title (string), artist (string), genre (string), mood_match (string explaining why this fits), energy_level (1-10))
- listening_order_tip (advice on how to listen for maximum emotional benefit)
- mood_transition (object with: current_mood (string), target_mood (string), journey (string describing the emotional arc))
- bonus_activity (an activity to pair with the playlist)`;
        userPrompt = params.mood
          ? `Create a therapeutic playlist for someone feeling: ${params.mood}. ${params.preferences ? `They enjoy: ${params.preferences}` : ""}`
          : `Create an uplifting mood-boosting playlist for general emotional wellness.`;
        break;
      }
      case "daily_affirmations": {
        systemPrompt = `You are an AI affirmation specialist creating powerful, personalized daily affirmations. Return a JSON object with:
- morning_affirmations (array of 5 objects, each with: affirmation (string), category (Confidence/Gratitude/Growth/Love/Strength), emoji (string))
- evening_reflections (array of 3 objects, each with: reflection (string), prompt (string for journaling))
- power_mantra (object with: mantra (string), explanation (string), when_to_use (string))
- weekly_intention (object with: intention (string), action_steps (array of 3 strings))
- personalized_note (a warm, personal note of encouragement)`;
        userPrompt = params.focus
          ? `Create daily affirmations focused on: ${params.focus}. ${params.challenges ? `Current challenges: ${params.challenges}` : ""}`
          : `Create powerful daily affirmations for overall well-being and personal empowerment.`;
        break;
      }
      case "friendship_games": {
        systemPrompt = `You are a fun AI game master creating interactive friendship games and quizzes. Return a JSON object with:
- game (object with: name (string), description (string), type (Quiz/Challenge/Story/Trivia))
- questions (array of 6 objects, each with: question (string), options (array of 4 strings), correct_answer (index 0-3), fun_fact (string), points (number 10-50))
- bonus_challenge (object with: challenge (string), reward (string), difficulty (Easy/Medium/Hard))
- friendship_trivia (array of 3 objects with: fact (string), category (string))
- scoring (object with: excellent (string threshold + message), good (string), needs_practice (string))`;
        userPrompt = params.gameType
          ? `Create a ${params.gameType} themed friendship game. ${params.topic ? `Topic: ${params.topic}` : ""}`
          : `Create a fun and engaging friendship quiz game with diverse topics.`;
        break;
      }
      case "dream_companion": {
        systemPrompt = `You are an AI dream interpretation companion who combines psychology and creativity. Return a JSON object with:
- interpretation (object with: summary (string 2-3 sentences), emotional_meaning (string), subconscious_message (string))
- symbols (array of 4 objects, each with: symbol (string), meaning (string), personal_relevance (string), emoji (string))
- dream_themes (array of 3 strings identifying major themes)
- psychological_insight (object with: theory (string naming a psychological perspective), explanation (string), reflection_question (string))
- creative_rewrite (string - a short creative retelling of the dream as a mini-story)
- action_suggestion (object with: suggestion (string), reason (string))
- dream_type (string: Anxiety/Aspirational/Processing/Prophetic/Lucid/Recurring)`;
        userPrompt = `Interpret this dream: "${params.dream}"`;
        break;
      }
      case "memory_scrapbook": {
        systemPrompt = `You are an AI memory curator who helps create beautiful digital scrapbook entries. Return a JSON object with:
- scrapbook_entry (object with: title (string creative title), tagline (string short memorable quote), date_label (string formatted nicely))
- story (string 3-4 sentence beautifully written version of the memory)
- emotions_captured (array of 4 objects with: emotion (string), intensity (1-10), color (string hex color), emoji (string))
- memory_tags (array of 5 strings like hashtags)
- reflection (object with: what_it_meant (string), lesson_learned (string), gratitude (string))
- companion_note (string a warm AI best friend comment about the memory)
- suggested_activities (array of 3 strings to relive similar moments)
- memory_rating (object with: nostalgia_level (1-10), happiness_level (1-10), significance (1-10))`;
        userPrompt = params.memory
          ? `Create a beautiful scrapbook entry for this memory: "${params.memory}"`
          : `Create a sample scrapbook entry about a wonderful day spent with a close friend.`;
        break;
      }
      case "gratitude_garden": {
        systemPrompt = `You are an AI gratitude garden curator who helps users cultivate thankfulness through beautiful, nature-inspired metaphors. Return a JSON object with:
- garden_entry (object with: flower_name (string creative flower name representing the gratitude), flower_emoji (string), bloom_stage (Seed/Sprout/Bud/Bloom/Full Bloom), color (string hex color))
- gratitude_analysis (object with: depth_score (1-10), category (People/Experiences/Growth/Nature/Self/Opportunities), emotional_impact (string 1-2 sentences))
- reflections (array of 3 objects with: reflection (string), prompt (string follow-up question), emoji (string))
- gratitude_chain (array of 4 strings - things connected to what they're grateful for that they might not have considered)
- garden_stats (object with: total_flowers (number random 1-50), rarest_bloom (string), garden_health (1-100), season (Spring/Summer/Autumn/Winter))
- daily_gratitude_challenge (object with: challenge (string), difficulty (Easy/Medium/Hard), reward (string))
- wisdom_quote (object with: quote (string), author (string))
- companion_note (string warm encouraging note about their gratitude practice)`;
        userPrompt = params.gratitude
          ? `Create a gratitude garden entry for: "${params.gratitude}"`
          : `Create a beautiful sample gratitude garden entry about appreciating a close friendship.`;
        break;
      }
      case "friendship_horoscope": {
        systemPrompt = `You are a mystical AI friendship astrologer who creates fun, personalized friendship horoscopes. Return a JSON object with:
- daily_horoscope (object with: title (string), message (string 2-3 sentences), lucky_emoji (string), friendship_energy (1-10), best_activity (string))
- compatibility_reading (object with: overall_score (1-100), communication (1-10), fun_factor (1-10), emotional_bond (1-10), growth_potential (1-10), cosmic_advice (string))
- friendship_forecast (array of 3 objects with: period (Today/This Week/This Month), prediction (string), emoji (string), vibe (string one word))
- cosmic_challenge (object with: challenge (string), reward (string), cosmic_significance (string))
- lucky_elements (object with: color (string), number (number 1-99), day (string weekday), crystal (string), element (Fire/Water/Earth/Air))
- celestial_message (string a mystical encouraging message about friendship)
- power_pair_activity (object with: activity (string), why (string), best_time (string))`;
        userPrompt = params.zodiacSign
          ? `Create a friendship horoscope for a ${params.zodiacSign}. ${params.friendSign ? `Their best friend is a ${params.friendSign}.` : ""}`
          : `Create an engaging friendship horoscope for today with universal appeal.`;
        break;
      }
      case "conflict_resolver": {
        systemPrompt = `You are an expert AI mediator and conflict resolution specialist for friendships. You are empathetic, balanced, and solution-focused. Return a JSON object with:
- situation_analysis (object with: summary (string 2-3 sentences), conflict_type (Miscommunication/Boundary/Values/Expectations/Trust/Jealousy), severity (1-10), both_perspectives (array of 2 strings showing each side)))
- emotional_map (array of 4 objects with: emotion (string), source (string why they feel this), validation (string), emoji (string))
- resolution_steps (array of 5 objects with: step (string), action (string specific thing to do), script (string example of what to say), difficulty (Easy/Medium/Hard))
- communication_templates (array of 3 objects with: situation (string when to use), opener (string how to start), full_message (string complete example message), tone (Gentle/Direct/Apologetic))
- healing_timeline (object with: immediate (string what to do now), short_term (string this week), long_term (string ongoing), recovery_estimate (string))
- boundary_recommendations (array of 3 objects with: boundary (string), reason (string), how_to_set (string))
- mediator_note (string balanced, wise observation about the conflict)
- friendship_preservation_score (1-100 how likely the friendship can be preserved)`;
        userPrompt = `Help resolve this friendship conflict: "${params.conflict}"`;
        break;
      }
      case "bucket_list": {
        systemPrompt = `You are an adventurous AI bucket list curator who creates exciting, personalized friendship adventure lists. Return a JSON object with:
- bucket_list (array of 10 objects with: adventure (string), category (Travel/Food/Creative/Adrenaline/Learning/Social/Wellness/Mystery), difficulty (Easy/Medium/Hard/Epic), estimated_cost (string like "Free"/"$"/"$$"/"$$$"), time_needed (string), fun_rating (1-10), emoji (string), why (string why this is special for friends))
- themed_collections (array of 3 objects with: theme (string), adventures (array of 3 strings), vibe (string))
- monthly_challenge (object with: challenge (string), month (string), reward (string), buddy_system (string how to do it together))
- dream_adventure (object with: ultimate (string the ultimate bucket list item), why_its_special (string), planning_tip (string), estimated_timeline (string))
- adventure_stats (object with: total_possible_adventures (number), difficulty_breakdown (object with easy/medium/hard/epic counts), estimated_total_time (string))
- companion_dare (object with: dare (string), stakes (string), deadline (string))
- adventure_quote (object with: quote (string), author (string))`;
        userPrompt = params.interests
          ? `Create a friendship bucket list based on these interests: "${params.interests}". ${params.budget ? `Budget: ${params.budget}` : ""} ${params.location ? `Location: ${params.location}` : ""}`
          : `Create an exciting and diverse friendship bucket list with adventures for all budgets and energy levels.`;
        break;
      }
      case "self_care_planner": {
        systemPrompt = `You are a holistic AI self-care specialist who creates personalized wellness routines. Return a JSON object with:
- self_care_plan (object with: plan_name (string creative name), focus_area (Mind/Body/Soul/Social/Creative), duration (string like "7-day plan"), difficulty (Gentle/Moderate/Intensive))
- daily_routine (array of 7 objects representing each day, each with: day (string "Day 1" etc), morning_ritual (string), afternoon_activity (string), evening_wind_down (string), mini_challenge (string), self_care_score_goal (1-10))
- wellness_categories (array of 5 objects with: category (Physical/Mental/Emotional/Social/Spiritual), activity (string), duration (string), benefit (string), emoji (string))
- emergency_self_care (array of 4 objects with: situation (string like "Feeling overwhelmed"), quick_fix (string 5 min activity), deeper_practice (string 30 min activity), affirmation (string))
- habit_tracker (array of 6 objects with: habit (string), frequency (Daily/3x Week/Weekly), importance (1-10), streak_reward (string))
- personalized_tips (array of 4 strings specific actionable wellness tips)
- weekly_reflection_prompts (array of 3 strings journaling prompts)
- companion_encouragement (string warm supportive message about their self-care journey)`;
        userPrompt = params.needs
          ? `Create a self-care plan for someone dealing with: "${params.needs}". ${params.timeAvailable ? `Available time: ${params.timeAvailable}` : ""} ${params.preferences ? `Preferences: ${params.preferences}` : ""}`
          : `Create a balanced 7-day self-care plan focusing on overall wellness and stress relief.`;
        break;
      }
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      throw new Error("AI service error");
    }

    const aiData = await response.json();
    const result = JSON.parse(aiData.choices[0].message.content);

    // Deduct credits
    await supabase.from("ai_credits").update({
      credits_remaining: remaining - cost,
    }).eq("user_id", user.id);

    // Log usage
    await supabase.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: `best_friend_${action}`,
      credits_used: cost,
      description: `Best Friend AI: ${action.replace(/_/g, " ")}`,
    });

    // If mood journal, save entry
    if (action === "mood_journal" && result.mood_score) {
      await supabase.from("best_friend_mood_journal").insert({
        user_id: user.id,
        mood_score: result.mood_score,
        mood_label: result.mood_label,
        journal_entry: params.entry,
        ai_insight: result.insight,
        tags: result.patterns || [],
      });
    }

    return new Response(JSON.stringify({ ...result, credits_remaining: remaining - cost }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("best-friend-ai error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message === "Unauthorized" ? 401 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
