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

    const { characterId, message } = await req.json();
    if (!characterId || !message) throw new Error("Character and message required");

    // Deduct 2 credits
    const { data: credits } = await supabase.from("character_credits").select("*").eq("user_id", user.id).single();
    if (!credits || credits.credits_remaining < 2) throw new Error("Not enough credits. You need 2 credits for voice messages.");
    await supabase.from("character_credits").update({ credits_remaining: credits.credits_remaining - 2 }).eq("id", credits.id);

    // Get character info
    const { data: character } = await supabase.from("ai_characters").select("*").eq("id", characterId).single();
    if (!character) throw new Error("Character not found");

    // Generate AI text response
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: character.system_prompt },
          { role: "user", content: message },
        ],
      }),
    });

    const aiData = await aiResponse.json();
    const responseText = aiData.choices[0].message.content;

    // Create or get conversation
    let conversationId: string;
    const { data: existingConvo } = await supabase
      .from("character_conversations")
      .select("id")
      .eq("user_id", user.id)
      .eq("character_id", characterId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (existingConvo) {
      conversationId = existingConvo.id;
    } else {
      const { data: newConvo } = await supabase
        .from("character_conversations")
        .insert({ user_id: user.id, character_id: characterId })
        .select("id")
        .single();
      conversationId = newConvo!.id;
    }

    // Store user message
    await supabase.from("character_messages").insert({
      conversation_id: conversationId,
      content: message,
      role: "user",
    });

    // Store AI response (voice URL would come from TTS service)
    await supabase.from("character_messages").insert({
      conversation_id: conversationId,
      content: responseText,
      role: "assistant",
    });

    await supabase.from("ai_usage_history").insert({
      user_id: user.id, usage_type: "companion_voice_message", credits_used: 2,
      description: `Voice message with ${character.name}`,
    });

    return new Response(JSON.stringify({
      response_text: responseText,
      companion_name: character.name,
      audio_url: null, // Would integrate TTS here
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
