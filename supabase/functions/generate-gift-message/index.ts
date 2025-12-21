import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { style, customPrompt, giftType, recipientName } = await req.json();
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openAIApiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const stylePrompts: Record<string, string> = {
      romantic: "Write a sweet, loving, and romantic message.",
      funny: "Write a humorous and playful message that will make them smile.",
      heartfelt: "Write a sincere and emotionally touching message.",
      friendly: "Write a warm, casual, and friendly message.",
      poetic: "Write a beautiful, artistic message with poetic language.",
      motivational: "Write an inspiring and uplifting message.",
    };

    const prompt = `You are a gift message writer. Generate a short, personal gift message (2-3 sentences max).
    
Style: ${stylePrompts[style] || stylePrompts.heartfelt}
${giftType ? `Gift being sent: ${giftType}` : ""}
${recipientName ? `Recipient's name: ${recipientName}` : ""}
${customPrompt ? `Additional context: ${customPrompt}` : ""}

Write ONLY the message, no quotes, no explanation. Keep it under 150 characters.`;

    console.log("Generating gift message with style:", style);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error("OpenAI API error");
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content?.trim() || "Sending you warm wishes!";

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate message" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
