import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callOpenAI, callOpenAIJSON } from "../_shared/openai.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

// Unified AI credit costs per Messenger action (3-5 credits, matches the UI labels).
const ACTION_COSTS: Record<string, number> = {
  translate: 3,
  "smart-reply": 3,
  summarize: 4,
  "time-capsule": 4,
  "emotional-weather": 3,
  "quantum-message": 5,
  "anonymous-compliment": 3,
  "what-if": 5,
};
const DEFAULT_COST = 3;

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
          user: `Create 3-4 variations of this message: ${params.originalMessage || text || ""}`,
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
        const scenario = params.scenario || text || context || "";
        const system = `You are a creative "What If" life story generator. Create an engaging alternative life story of about 180-220 words. Return ONLY a JSON object with: "title" (string), "story" (string), "keyMoments" (array of exactly 3 short strings), "lifeLesson" (string).`;
        try {
          const json = await callOpenAIJSON({
            system,
            user: scenario,
            model: "gpt-4o-mini",
            max_completion_tokens: 6000,
          });
          result = JSON.stringify(json);
        } catch (err) {
          console.error("what-if JSON attempt failed, falling back to text", (err as Error)?.message);
          const plain = await callOpenAI({
            system: `You are a creative "What If" life story generator. Write an engaging alternative life story of about 180 words. Plain text only, start with a short title line.`,
            user: scenario,
            model: "gpt-4o-mini",
            max_completion_tokens: 6000,
          });
          if (!plain) throw err;
          const [firstLine, ...rest] = plain.split("\n").filter(Boolean);
          result = JSON.stringify({
            title: firstLine.replace(/^#+\s*/, "").slice(0, 120),
            story: rest.join("\n\n") || plain,
            keyMoments: [],
            lifeLesson: "",
          });
        }
        break;
      }

      default: throw new Error(`Unknown action: ${action}`);
    }

    const { error: deductErr } = await admin.rpc("deduct_ai_credits", {
      p_user_id: user.id,
      p_amount: cost,
      p_reason: `messenger_${String(action).replace(/-/g, "_")}`,
      p_source: "messenger",
    });
    if (deductErr) {
      const msg = deductErr.message || "";
      if (/insufficient|no credit/i.test(msg)) {
        return new Response(JSON.stringify({ error: "Insufficient credits", required: cost }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      console.error("messenger-ai deduct failed", msg);
    }

    const { data: after } = await admin
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    return new Response(JSON.stringify({ result, creditsUsed: cost, creditsRemaining: after?.credits_remaining ?? 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("messenger-ai failed", e?.message, e?.status);
    const status = e.message === "Unauthorized" ? 401 : e.message?.includes("credits") ? 402 : 500;
    return new Response(JSON.stringify({ error: e.message || "AI request failed" }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

