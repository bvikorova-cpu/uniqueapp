import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CREDIT_COSTS = {
  social_post: 1,
  blog_article: 3,
  video_script: 2,
  cv: 2,
  cover_letter: 1,
  business_document: 2,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use ANON KEY - RLS policies will enforce access control
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } }, auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Rate limit check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.ai_generation, corsHeaders, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { contentType, prompt, title, metadata } = await req.json();
    
    const creditsNeeded = CREDIT_COSTS[contentType as keyof typeof CREDIT_COSTS] || 1;

    // Check and deduct credits
    const { data: creditData } = await supabaseClient
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .single();

    if (!creditData || creditData.credits_remaining < creditsNeeded) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // NOTE: credits are deducted AFTER successful AI response (see below) so
    // upstream OpenAI/save failures do not consume the user's balance.


    // Generate content based on type
    const systemPrompts = {
      social_post: "You are a social media expert. Create engaging, viral-worthy social media posts with emojis and hashtags.",
      blog_article: "You are a professional content writer. Create well-structured, SEO-optimized blog articles with headings and clear paragraphs.",
      video_script: "You are a video scriptwriter. Create engaging video scripts with clear scenes, dialogue, and visual descriptions.",
      cv: "You are a professional CV writer. Create professional, ATS-friendly CV content highlighting skills and experience.",
      cover_letter: "You are a career consultant. Write compelling, personalized cover letters that highlight candidate strengths.",
      business_document: "You are a business writer. Create professional, clear business documents with proper structure.",
    };

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }

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
            content: systemPrompts[contentType as keyof typeof systemPrompts] || "You are a helpful assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error("Failed to generate content");
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      throw new Error("No content generated");
    }

    // ✅ Deduct credits only after successful AI generation
    await supabaseClient
      .from("ai_credits")
      .update({
        credits_remaining: creditData.credits_remaining - creditsNeeded,
        last_used_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    await supabaseClient.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: `content_${contentType}`,
      credits_used: creditsNeeded,
      description: `Generated ${contentType}: ${title}`,
    });



    // Save generated content
    const { data: savedContent, error: saveError } = await supabaseClient
      .from("ai_generated_content")
      .insert({
        user_id: user.id,
        content_type: contentType,
        title,
        prompt,
        generated_text: generatedText,
        metadata: metadata || {},
        status: "generated",
        credits_used: creditsNeeded,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save error:", saveError);
      throw saveError;
    }

    return new Response(
      JSON.stringify({
        content: savedContent,
        creditsRemaining: creditData.credits_remaining - creditsNeeded,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});