import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { callOpenAIJSON } from "../_shared/openai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmotionAnalysis {
  joy: number;
  love: number;
  motivation: number;
  excitement: number;
  peace: number;
  sadness: number;
  anger: number;
  fear: number;
  dominant_emotion: string;
  emotional_summary: string;
}

const SYSTEM = `You are an emotion analysis AI for the Emotion Economy Network.
Analyze the user's text and return STRICT JSON with these exact keys:
joy, love, motivation, excitement, peace, sadness, anger, fear (each 0-100 integers),
dominant_emotion (one of: joy, love, motivation, excitement, peace, sadness, anger, fear),
emotional_summary (one short sentence in the same language as the input).
No prose, no markdown, JSON only.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization required");
    const supa = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: { user } } = await supa.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) throw new Error("Not authenticated");

    const { content } = await req.json();
    if (typeof content !== "string" || content.trim().length < 2) {
      throw new Error("content required");
    }
    if (content.length > 4000) throw new Error("content too long (max 4000 chars)");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check credits — paid-only model, no free tier
    const { data: credits } = await admin
      .from("emotion_credits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const remaining = credits?.credits_remaining ?? 0;
    if (remaining < 1) {
      return new Response(
        JSON.stringify({ error: "No credits remaining", needs_purchase: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 }
      );
    }

    // Run AI analysis
    let emotions: EmotionAnalysis;
    try {
      emotions = await callOpenAIJSON<EmotionAnalysis>({
        system: SYSTEM,
        user: content,
        temperature: 0.4,
        max_tokens: 300,
      });
    } catch (e) {
      console.error("OpenAI failed", e);
      throw new Error("AI analysis failed");
    }

    // Deduct 1 credit only after successful analysis
    if (credits) {
      await admin
        .from("emotion_credits")
        .update({
          credits_remaining: remaining - 1,
          total_credits_used: (credits.total_credits_used ?? 0) + 1,
        })
        .eq("user_id", user.id);
    } else {
      await admin.from("emotion_credits").insert({
        user_id: user.id,
        credits_remaining: 0,
        total_credits_purchased: 0,
        total_credits_used: 1,
      });
    }

    // Small post reward (server-controlled)
    const emotion_reward = 5;

    return new Response(
      JSON.stringify({
        emotions,
        emotion_reward,
        credits_remaining: remaining - 1,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[analyze-emotion]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
