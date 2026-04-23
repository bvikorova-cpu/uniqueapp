import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;

    if (!user) throw new Error("Unauthorized");

    // Rate limit check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.ai_generation, corsHeaders, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { journalContent, mood } = await req.json();

    console.log("[ANALYZE-JOURNAL] Analyzing journal with OpenAI");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an empathetic journal therapist. Analyze journal entries and provide supportive insights.
            
Return ONLY a valid JSON object:
{
  "insights": "detailed analysis of the emotional content and themes",
  "emotions": ["emotion1", "emotion2", "emotion3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4"],
  "affirmations": ["affirmation1", "affirmation2"]
}`
          },
          {
            role: "user",
            content: `Analyze this journal entry. Current mood: ${mood || "unspecified"}\n\nJournal content:\n${journalContent}`
          }
        ],
        max_completion_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ANALYZE-JOURNAL] OpenAI error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;

    let insightsData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      insightsData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error("[ANALYZE-JOURNAL] Parse error:", e);
      insightsData = {
        insights: content,
        emotions: ["reflection", "growth"],
        suggestions: ["Continue journaling regularly"],
        affirmations: ["You are on the right path."]
      };
    }

    return new Response(
      JSON.stringify(insightsData),
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