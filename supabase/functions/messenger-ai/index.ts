import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CREDIT_COST = 1;

async function callOpenAI(apiKey: string, messages: any[]) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", messages }),
  });
  if (!response.ok) throw new Error(`AI error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

const styles: Record<string, string> = {
  heartfelt: "Write with genuine warmth and emotional depth.",
  poetic: "Use poetic language and metaphors.",
  funny: "Be witty, clever, and humorous.",
  professional: "Keep it respectful and professionally warm.",
};

const variationPrompts: Record<string, string> = {
  mood: "Create variations of the message in different emotional tones.",
  formality: "Create variations ranging from casual to formal.",
  length: "Create short, medium, and long versions.",
  style: "Create variations in different writing styles.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { action, style, recipientName, context, conversationText, text, variationType, messages: msgHistory, ...params } = await req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("API key not configured");
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    
    const { data: credits } = await supabase
      .from("messenger_ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (!credits || credits.credits_remaining < CREDIT_COST) {
      return new Response(JSON.stringify({ error: "Insufficient credits" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    let result: string;
    switch (action) {
      case "anonymous-compliment":
        result = await callOpenAI(apiKey, [
          {
            role: 'system',
            content: `You are a master of writing beautiful, anonymous compliments that make people feel special.
            ${styles[style] || styles.heartfelt}
            Create a unique, memorable compliment. Return a JSON object with: "compliment", "emoji", "category".`
          },
          { role: 'user', content: `Create an anonymous compliment for ${recipientName || 'someone special'}. ${context ? `Context: ${context}` : ''}` }
        ]);
        break;
      case "emotional-weather":
        result = await callOpenAI(apiKey, [
          {
            role: 'system',
            content: `You are an emotional intelligence AI that analyzes conversations and provides an "emotional weather report". Return a JSON object with: "weather" (sunny|cloudy|rainy|stormy|rainbow|foggy), "temperature" (warm|cool|cold|hot), "emoji", "dominantEmotions" (array of 3), "forecast" (brief prediction), "advice" (suggestion).`
          },
          { role: 'user', content: `Analyze the emotional weather of this conversation:\n\n${conversationText || context || ""}` }
        ]);
        break;
      case "quantum-message":
        result = await callOpenAI(apiKey, [
          {
            role: 'system',
            content: `You are a creative message writer. ${variationPrompts[variationType] || variationPrompts.mood} Return a JSON object with: "variations" (array of objects with "type", "message", "emoji").`
          },
          { role: 'user', content: text || "" }
        ]);
        break;
      case "smart-reply":
        result = await callOpenAI(apiKey, [
          { role: 'system', content: 'You are a smart reply assistant. Based on the conversation context, suggest 3 short, natural reply options. Return only the 3 suggestions, one per line, no numbering or bullets.' },
          { role: 'user', content: `Suggest replies for this conversation:\n\n${context || ""}` }
        ]);
        break;
      case "summarize":
        result = await callOpenAI(apiKey, [
          { role: 'system', content: 'You are a conversation summarizer. Provide a concise summary of the conversation highlighting key points, decisions, and action items. Keep it brief (2-4 sentences).' },
          { role: 'user', content: `Summarize this conversation:\n\n${conversationText || ""}` }
        ]);
        break;
      case "translate":
        result = await callOpenAI(apiKey, [
          { role: 'system', content: `You are a translator. Translate the given text to ${params.targetLanguage || "English"}. Only respond with the translation, nothing else.` },
          { role: 'user', content: text || "" }
        ]);
        break;
      case "time-capsule":
        result = await callOpenAI(apiKey, [
          { role: 'system', content: 'You are a time capsule message creator. Write a heartfelt message to be opened in the future. Return JSON with "message", "reflection_prompts" (array of 3).' },
          { role: 'user', content: text || context || "" }
        ]);
        break;
      case "what-if":
        result = await callOpenAI(apiKey, [
          {
            role: 'system',
            content: `You are a creative "What If" life story generator. Create an engaging alternative life story (300-400 words). Return a JSON object with: "title", "story", "keyMoments" (array of 3).`
          },
          { role: 'user', content: text || context || "" }
        ]);
        break;
      default: throw new Error(`Unknown action: ${action}`);
    }
    
    await supabase
      .from("messenger_ai_credits")
      .update({ credits_remaining: credits.credits_remaining - CREDIT_COST })
      .eq("user_id", user.id);
    
    return new Response(JSON.stringify({ result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    const status = e.message === "Unauthorized" ? 401 : e.message?.includes("credits") ? 402 : 500;
    return new Response(JSON.stringify({ error: e.message }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
