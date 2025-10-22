import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;

    if (!user) {
      throw new Error("Unauthorized");
    }

    const body = await req.json();
    const { conversationId, message, characterId } = body;

    // Input validation
    if (!message || typeof message !== 'string') {
      throw new Error("Message is required and must be a string");
    }

    if (message.trim().length === 0) {
      throw new Error("Message cannot be empty");
    }

    if (message.length > 2000) {
      throw new Error("Message too long (max 2000 characters)");
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!conversationId || !uuidRegex.test(conversationId)) {
      throw new Error("Invalid conversation ID format");
    }

    if (!characterId || !uuidRegex.test(characterId)) {
      throw new Error("Invalid character ID format");
    }

    // Verify conversation ownership
    const { data: conversationOwnership, error: convError } = await supabaseClient
      .from('character_conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversationOwnership) {
      throw new Error("Conversation not found");
    }

    if (conversationOwnership.user_id !== user.id) {
      throw new Error("Unauthorized: This conversation does not belong to you");
    }

    // Check message limits for free users
    const { data: limits } = await supabaseClient
      .from("user_message_limits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!limits) {
      // Create initial limits
      await supabaseClient.from("user_message_limits").insert({
        user_id: user.id,
        messages_used_today: 0,
        is_premium: false,
      });
    } else if (!limits.is_premium) {
      // Check daily limit (20 messages for free users)
      const today = new Date().toISOString().split('T')[0];
      if (limits.last_reset_date !== today) {
        // Reset counter
        await supabaseClient
          .from("user_message_limits")
          .update({ messages_used_today: 0, last_reset_date: today })
          .eq("user_id", user.id);
      } else if (limits.messages_used_today >= 20) {
        return new Response(
          JSON.stringify({ error: "Daily message limit reached. Upgrade to premium for unlimited messages." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get character details
    const { data: character } = await supabaseClient
      .from("ai_characters")
      .select("*")
      .eq("id", characterId)
      .single();

    if (!character) {
      throw new Error("Character not found");
    }

    // Check if user has access to premium characters
    if (character.is_premium) {
      const { data: access } = await supabaseClient
        .from("user_character_access")
        .select("*")
        .eq("user_id", user.id)
        .eq("character_id", characterId)
        .maybeSingle();

      if (!access) {
        return new Response(
          JSON.stringify({ error: "Premium character access required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get conversation history for context
    const { data: messages } = await supabaseClient
      .from("character_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20); // Last 20 messages for context

    // Get conversation memory
    const { data: conversation } = await supabaseClient
      .from("character_conversations")
      .select("memory_context, summary")
      .eq("id", conversationId)
      .single();

    // Build context with memory
    const conversationHistory = messages?.map(m => ({
      role: m.role,
      content: m.content
    })) || [];

    const memoryContext = conversation?.memory_context || {};
    const memoryString = Object.keys(memoryContext).length > 0
      ? `\n\nImportant context about the user: ${JSON.stringify(memoryContext)}`
      : '';

    const summaryContext = conversation?.summary
      ? `\n\nConversation summary: ${conversation.summary}`
      : '';

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: character.system_prompt + memoryString + summaryContext
          },
          ...conversationHistory,
          {
            role: "user",
            content: message
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error("Failed to generate response");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response generated");
    }

    // Save user message
    await supabaseClient.from("character_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: message,
    });

    // Save AI response
    await supabaseClient.from("character_messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: aiResponse,
    });

    // Update message count for free users
    if (limits && !limits.is_premium) {
      await supabaseClient
        .from("user_message_limits")
        .update({ messages_used_today: limits.messages_used_today + 1 })
        .eq("user_id", user.id);
    }

    // Update conversation timestamp
    await supabaseClient
      .from("character_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
