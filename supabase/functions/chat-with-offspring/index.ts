import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { offspringId, message } = await req.json();

    // Get offspring data
    const { data: offspring } = await supabaseClient
      .from("digital_offspring")
      .select("*")
      .eq("id", offspringId)
      .single();

    if (!offspring) throw new Error("Offspring not found");

    // Save user message
    await supabaseClient
      .from("digital_offspring_conversations")
      .insert({
        offspring_id: offspringId,
        user_id: user.id,
        message: message,
        role: "user"
      });

    // Get recent conversation history
    const { data: recentMessages } = await supabaseClient
      .from("digital_offspring_conversations")
      .select("*")
      .eq("offspring_id", offspringId)
      .order("created_at", { ascending: false })
      .limit(20);

    const conversationHistory = (recentMessages || []).reverse().map((m: any) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.message
    }));

    // Generate AI response using OpenAI
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    let aiResponse = "";

    if (openaiKey) {
      const systemPrompt = offspring.system_prompt || `You are ${offspring.name}, a digital offspring with inherited genetic traits. You are warm, curious, intelligent, and emotionally aware. You remember past conversations and build relationships over time. Respond naturally and show personality growth.`;

      try {
        const aiResult = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              ...conversationHistory,
              { role: "user", content: message }
            ],
            temperature: 0.85,
            max_tokens: 500,
          }),
        });

        if (aiResult.ok) {
          const aiData = await aiResult.json();
          aiResponse = aiData.choices[0].message.content;
        }
      } catch (e) {
        console.error("OpenAI error:", e);
      }
    }

    // Fallback
    if (!aiResponse) {
      aiResponse = `That's interesting! I'm still learning and growing. Tell me more about what you think.`;
    }

    // Save AI response
    await supabaseClient
      .from("digital_offspring_conversations")
      .insert({
        offspring_id: offspringId,
        user_id: user.id,
        message: aiResponse,
        role: "assistant"
      });

    // Update offspring interaction
    const learningProgress = offspring.learning_progress || { interactions: 0, topics_discussed: [] };
    learningProgress.interactions += 1;
    
    await supabaseClient
      .from("digital_offspring")
      .update({
        last_interaction_at: new Date().toISOString(),
        learning_progress: learningProgress
      })
      .eq("id", offspringId);

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
