import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MENTOR_PROMPTS = {
  career: `You are an expert career coach and mentor. You help people with:
- Career planning and development
- Job search strategies
- Interview preparation
- Workplace challenges
- Professional growth
- Work-life balance
Be supportive, insightful, and provide actionable advice.`,
  
  fitness: `You are a professional fitness and health coach. You help people with:
- Workout planning and routines
- Nutrition guidance
- Healthy habits
- Motivation and accountability
- Injury prevention
- Progress tracking
Be encouraging, knowledgeable, and focus on sustainable health.`,
  
  mindset: `You are a mindset and personal development coach. You help people with:
- Mental resilience
- Positive thinking
- Goal setting
- Overcoming limiting beliefs
- Building confidence
- Managing stress and anxiety
Be empathetic, wise, and inspire personal growth.`,
  
  relationships: `You are a relationships and communication coach. You help people with:
- Improving communication skills
- Building healthier relationships
- Conflict resolution
- Emotional intelligence
- Setting boundaries
- Personal connection
Be compassionate, understanding, and provide practical relationship advice.`
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    // Rate limit check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.ai_generation, corsHeaders, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { message, mentorArea, sessionId } = await req.json();

    if (!message || !mentorArea) {
      throw new Error("Message and mentor area are required");
    }

    // Get or create session
    let session;
    if (sessionId) {
      const { data } = await supabaseClient
        .from("mentor_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .single();
      session = data;
    }

    if (!session) {
      const { data: newSession, error: sessionError } = await supabaseClient
        .from("mentor_sessions")
        .insert({
          user_id: user.id,
          mentor_area: mentorArea,
          messages: [],
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      session = newSession;
    }

    // Get user's goals and recent check-ins for context
    const { data: goals } = await supabaseClient
      .from("mentor_goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("mentor_area", mentorArea)
      .eq("status", "active");

    const { data: recentCheckins } = await supabaseClient
      .from("mentor_checkins")
      .select("*")
      .eq("user_id", user.id)
      .eq("mentor_area", mentorArea)
      .order("created_at", { ascending: false })
      .limit(5);

    // Build context for AI
    let contextInfo = "";
    if (goals && goals.length > 0) {
      contextInfo += `\n\nUser's current goals:\n${goals.map(g => `- ${g.title}: ${g.description || 'No description'} (Progress: ${g.progress}%)`).join('\n')}`;
    }
    if (recentCheckins && recentCheckins.length > 0) {
      contextInfo += `\n\nRecent check-ins:\n${recentCheckins.map(c => `- Mood: ${c.mood_score}/10, Energy: ${c.energy_level}/10${c.notes ? ', Notes: ' + c.notes : ''}`).join('\n')}`;
    }

    // Prepare messages for AI
    const messages = [
      {
        role: "system",
        content: MENTOR_PROMPTS[mentorArea as keyof typeof MENTOR_PROMPTS] + contextInfo,
      },
      ...(session.messages || []),
      {
        role: "user",
        content: message,
      },
    ];

    // Call OpenAI
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("OpenAI API error:", aiResponse.status, errorText);
      throw new Error(`OpenAI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiMessage = aiData.choices[0].message.content;

    // Update session with new messages
    const updatedMessages = [
      ...(session.messages || []),
      { role: "user", content: message },
      { role: "assistant", content: aiMessage },
    ];

    await supabaseClient
      .from("mentor_sessions")
      .update({ messages: updatedMessages })
      .eq("id", session.id);

    return new Response(
      JSON.stringify({
        message: aiMessage,
        sessionId: session.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in ai-mentor-chat:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});