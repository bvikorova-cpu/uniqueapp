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

    const { characterIds, message, conversationHistory } = await req.json();
    if (!characterIds?.length || !message) throw new Error("Characters and message required");

    // Deduct 4 credits
    const { data: credits } = await supabase.from("character_credits").select("*").eq("user_id", user.id).single();
    if (!credits || credits.credits_remaining < 4) throw new Error("Not enough credits. You need 4 credits for group chat.");
    await supabase.from("character_credits").update({ credits_remaining: credits.credits_remaining - 4 }).eq("id", credits.id);

    // Get all characters
    const { data: characters } = await supabase.from("ai_characters").select("*").in("id", characterIds);
    if (!characters?.length) throw new Error("Characters not found");

    // Generate responses from each companion in parallel
    const responses = await Promise.all(
      characters.map(async (character) => {
        const historyFormatted = (conversationHistory || []).map((m: any) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.name ? `[${m.name}]: ${m.content}` : m.content,
        }));

        const otherCompanions = characters.filter(c => c.id !== character.id).map(c => c.name).join(", ");

        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `${character.system_prompt}\n\nYou are in a GROUP CHAT with ${otherCompanions}. Keep responses short (1-3 sentences). Stay in character. You may reference or respond to what other companions said. Be natural and conversational.`
              },
              ...historyFormatted,
              { role: "user", content: message },
            ],
            max_tokens: 150,
          }),
        });

        const aiData = await aiResponse.json();
        return {
          companion_name: character.name,
          companion_id: character.id,
          response: aiData.choices[0].message.content,
        };
      })
    );

    await supabase.from("ai_usage_history").insert({
      user_id: user.id, usage_type: "companion_group_chat", credits_used: 4,
      description: `Group chat with ${characters.map(c => c.name).join(", ")}`,
    });

    return new Response(JSON.stringify({ responses }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
