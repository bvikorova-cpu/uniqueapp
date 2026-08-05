import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callOpenAI, callOpenAIJSON } from "../_shared/openai.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

// Unified AI credit costs per Messenger action (matches the UI labels).
const ACTION_COSTS: Record<string, number> = {
  translate: 2,
  "smart-reply": 2,
  summarize: 5,
  "time-capsule": 5,
  "emotional-weather": 3,
  "quantum-message": 10,
  "anonymous-compliment": 2,
  "what-if": 15,
};
const DEFAULT_COST = 2;

const styles: Record<string, string> = { heartfelt: "Write with genuine warmth and emotional depth.",
  poetic: "Use poetic language and metaphors.",
  funny: "Be witty, clever, and humorous.",
  professional: "Keep it respectful and professionally warm." };

const variationPrompts: Record<string, string> = { mood: "Create variations of the message in different emotional tones.",
  formality: "Create variations ranging from casual to formal.",
  length: "Create short, medium, and long versions.",
  style: "Create variations in different writing styles." };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { action, style, recipientName, context, conversationText, text, variationType, ...params } = await req.json();
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const cost = ACTION_COSTS[String(action)] ?? DEFAULT_COST;

    // Unified balance — real credits for every user (ai_credits + ledger).
    const { data: balanceRow } = await admin
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!balanceRow || (balanceRow.credits_remaining ?? 0) < cost) {
      return new Response(JSON.stringify({ error: "Insufficient credits", required: cost, balance: balanceRow?.credits_remaining ?? 0 }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    let result: string;
    switch (action) {
      case "anonymous-compliment": {
        const json = await callOpenAIJSON({
          system: `You are a master of writing beautiful, anonymous compliments that make people feel special.\n            ${styles[style] || styles.heartfelt}\n            Create a unique, memorable compliment. Return a JSON object with: "compliment", "emoji", "category".`,
          user: `Create an anonymous compliment for ${recipientName || 'someone special'}. ${context ? `Context: ${context}` : ''}`,
          model: "gpt-4o-mini",
        });
        result = JSON.stringify(json);
        break;
      }
      case "emotional-weather": {
        const json = await callOpenAIJSON({
          system: `You are an emotional intelligence AI that analyzes conversations and provides an "emotional weather report". Return a JSON object with: "weather" (sunny|cloudy|rainy|stormy|rainbow|foggy), "temperature" (warm|cool|cold|hot), "emoji", "dominantEmotions" (array of 3), "forecast" (brief prediction), "advice" (suggestion).`,
          user: `Analyze the emotional weather of this conversation:\n\n${conversationText || context || ""}`,
          model: "gpt-4o-mini",
        });
        result = JSON.stringify(json);
        break;
      }
      case "quantum-message": {
        const json = await callOpenAIJSON({
          system: `You are a creative message writer. ${variationPrompts[variationType] || variationPrompts.mood} Return a JSON object with: "variations" (array of objects with "type", "message", "emoji").`,
          user: text || "",
          model: "gpt-4o-mini",
        });
        result = JSON.stringify(json);
        break;
      }
      case "smart-reply":
        result = await callOpenAI({
          system: 'You are a smart reply assistant. Based on the conversation context, suggest 3 short, natural reply options. Return only the 3 suggestions, one per line, no numbering or bullets.',
          user: `Suggest replies for this conversation:\n\n${context || ""}`,
          model: "gpt-4o-mini",
        });
        break;
      case "summarize":
        result = await callOpenAI({
          system: 'You are a conversation summarizer. Provide a concise summary of the conversation highlighting key points, decisions, and action items. Keep it brief (2-4 sentences).',
          user: `Summarize this conversation:\n\n${conversationText || ""}`,
          model: "gpt-4o-mini",
        });
        break;
      case "translate":
        result = await callOpenAI({
          system: `You are a translator. Translate the given text to ${params.targetLanguage || "English"}. Only respond with the translation, nothing else.`,
          user: text || "",
          model: "gpt-4o-mini",
        });
        break;
      case "time-capsule": {
        const json = await callOpenAIJSON({
          system: 'You are a time capsule message creator. Write a heartfelt message to be opened in the future. Return JSON with "message", "reflection_prompts" (array of 3).',
          user: text || context || "",
          model: "gpt-4o-mini",
        });
        result = JSON.stringify(json);
        break;
      }
      case "what-if": {
        const json = await callOpenAIJSON({
          system: `You are a creative "What If" life story generator. Create an engaging alternative life story (300-400 words). Return a JSON object with: "title", "story", "keyMoments" (array of 3).`,
          user: text || context || "",
          model: "gpt-4o-mini",
        });
        result = JSON.stringify(json);
        break;
      }
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
