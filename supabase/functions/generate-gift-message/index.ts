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

    if (type === "travel_planner") {
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
