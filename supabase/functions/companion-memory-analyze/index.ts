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

    const { conversationId } = await req.json();
    if (!conversationId) throw new Error("Conversation ID required");

    // Deduct 5 credits
    const { data: credits } = await supabase.from("character_credits").select("*").eq("user_id", user.id).single();
    if (!credits || credits.credits_remaining < 5) throw new Error("Not enough credits. You need 5 credits for memory analysis.");
    await supabase.from("character_credits").update({ credits_remaining: credits.credits_remaining - 5 }).eq("id", credits.id);

    // Get conversation messages
    const { data: messages } = await supabase
      .from("character_messages")
      .select("role, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(50);

    if (!messages || messages.length === 0) throw new Error("No messages found");

    const chatLog = messages.map(m => `${m.role}: ${m.content}`).join("\n");

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Analyze this conversation and extract key memory points about the user. Return JSON: {"summary":"2-3 sentence summary of relationship and topics","memory_context":{"name":"user's name if mentioned","interests":["list"],"emotional_patterns":["list"],"topics_discussed":["list"],"preferences":{"key":"value pairs"}}}`
          },
          { role: "user", content: chatLog }
        ],
        response_format: { type: "json_object" },
      }),
    });

    const aiData = await aiResponse.json();
    const result = JSON.parse(aiData.choices[0].message.content);

    // Update conversation with memory
    await supabase.from("character_conversations").update({
      summary: result.summary,
      memory_context: result.memory_context,
      updated_at: new Date().toISOString(),
    }).eq("id", conversationId);

    await supabase.from("ai_usage_history").insert({
      user_id: user.id, usage_type: "companion_memory_analysis", credits_used: 5,
      description: `Memory analysis for conversation`,
    });

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
