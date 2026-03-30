import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Not authenticated");

    const { mood } = await req.json();
    if (!mood) throw new Error("Mood is required");

    // Deduct 3 credits
    const { data: credits } = await supabase.from("character_credits").select("*").eq("user_id", user.id).single();
    if (!credits || credits.credits_remaining < 3) throw new Error("Not enough credits. You need 3 credits for mood analysis.");
    await supabase.from("character_credits").update({ credits_remaining: credits.credits_remaining - 3 }).eq("id", credits.id);

    // Get available companions
    const { data: characters } = await supabase.from("ai_characters").select("name, personality_type, description");
    const characterList = characters?.map(c => `${c.name} (${c.personality_type}): ${c.description}`).join("\n") || "";

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a mood analysis AI. Based on the user's mood, recommend the best AI companion from this list:\n${characterList}\n\nRespond in JSON: {"recommended_companion":"name","reason":"why this companion is perfect","mood_insight":"brief analysis of user's emotional state","conversation_starters":["3 suggested opening messages"]}`
          },
          { role: "user", content: `My current mood: ${mood}` }
        ],
        response_format: { type: "json_object" },
      }),
    });

    const aiData = await aiResponse.json();
    const result = JSON.parse(aiData.choices[0].message.content);

    // Log usage
    await supabase.from("ai_usage_history").insert({
      user_id: user.id, usage_type: "companion_mood_match", credits_used: 3, description: `Mood: ${mood.slice(0, 100)}`,
    });

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
