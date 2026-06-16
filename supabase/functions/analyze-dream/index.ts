import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";

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
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.ai_generation, corsHeaders, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    // Credit check (1 credit) — service role for atomic decrement
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const { data: creditsRow } = await adminClient
      .from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    const remaining = creditsRow?.credits_remaining ?? 0;
    if (remaining < 1) {
      return new Response(JSON.stringify({ error: "Insufficient credits", required: 1, remaining }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { dreamContent } = await req.json();

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert in dream analysis and symbolism. Analyze dreams and provide deep interpretations. Respond in English as JSON."
          },
          {
            role: "user",
            content: `Analyze this dream and provide a detailed interpretation:

"${dreamContent}"

Respond as JSON with the following keys:
- analysis: overall dream analysis (text)
- themes: array of main themes (array of strings)
- emotions: array of identified emotions (array of strings)
- symbols: array of objects with keys "symbol" and "meaning"`
          }
        ],
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error("Failed to analyze dream");
    }

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;

    let analysisData;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysisData = JSON.parse(jsonString);
    } catch {
      analysisData = {
        analysis: content,
        themes: ["Daily experiences", "Emotional processing"],
        emotions: ["Curiosity", "Self-discovery"],
        symbols: [{ symbol: "Dream", meaning: content }]
      };
    }

    // Deduct credit after successful analysis
    await adminClient.from("ai_credits").update({
      credits_remaining: remaining - 1,
      last_used_at: new Date().toISOString(),
    }).eq("user_id", user.id);

    return new Response(
      JSON.stringify({ ...analysisData, credits_remaining: remaining - 1 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
