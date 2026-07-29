import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";
import { askAI, UnifiedAIError } from "../_shared/unifiedAI.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

const CREDIT_COSTS = { social_post: 1,
  blog_article: 3,
  video_script: 2,
  cv: 2,
  cover_letter: 1,
  business_document: 2 };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")
      ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")
      ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Auth client (validates the caller's JWT)
    const authClient = createClient(supabaseUrl, anonKey || serviceKey, {
      auth: { persistSession: false } });
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    const user = userData?.user;

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Data client (service role, scoped manually to the authenticated user)
    const supabaseClient = createClient(supabaseUrl, serviceKey || anonKey, {
      auth: { persistSession: false } });


    // Rate limit check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.ai_generation, corsHeaders, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { contentType, prompt, title, metadata } = await req.json();
    
    const creditsNeeded = CREDIT_COSTS[contentType as keyof typeof CREDIT_COSTS] || 1;

    // Check credits (auto-create the row if the user has none yet)
    let { data: creditData } = await supabaseClient
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!creditData) {
      const { data: created } = await supabaseClient
        .from("ai_credits")
        .insert({ user_id: user.id, credits_remaining: 10 })
        .select("credits_remaining")
        .maybeSingle();
      creditData = created ?? { credits_remaining: 0 };
    }

    if ((creditData.credits_remaining ?? 0) < creditsNeeded) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }


    // NOTE: credits are deducted AFTER successful AI response (see below) so
    // upstream OpenAI/save failures do not consume the user's balance.


    // Generate content based on type
    const systemPrompts = { social_post: "You are a social media expert. Create engaging, viral-worthy social media posts with emojis and hashtags.",
      blog_article: "You are a professional content writer. Create well-structured, SEO-optimized blog articles with headings and clear paragraphs.",
      video_script: "You are a video scriptwriter. Create engaging video scripts with clear scenes, dialogue, and visual descriptions.",
      cv: "You are a professional CV writer. Create professional, ATS-friendly CV content highlighting skills and experience.",
      cover_letter: "You are a career consultant. Write compelling, personalized cover letters that highlight candidate strengths.",
      business_document: "You are a business writer. Create professional, clear business documents with proper structure." };

    let generatedText: string;
    try {
      generatedText = await askAI(
        systemPrompts[contentType as keyof typeof systemPrompts] || "You are a helpful assistant.",
        prompt,
        { model: "gpt-4o-mini" },
      );
    } catch (e) {
      const status = e instanceof UnifiedAIError ? e.status : 500;
      console.error("Unified AI error:", status, e instanceof Error ? e.message : String(e));
      return new Response(
        JSON.stringify({ error: status === 429
          ? "AI is busy right now. Please try again in a moment."
          : "AI service is temporarily unavailable. Please try again." }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!generatedText) {
      throw new Error("No content generated");
    }

    // ✅ Deduct credits only after successful AI generation
    await supabaseClient
      .from("ai_credits")
      .update({ credits_remaining: creditData.credits_remaining - creditsNeeded,
        last_used_at: new Date().toISOString() })
      .eq("user_id", user.id);

    await supabaseClient.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: `content_${contentType}`,
      credits_used: creditsNeeded,
      description: `Generated ${contentType}: ${title}` });



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
        credits_used: creditsNeeded })
      .select()
      .single();

    if (saveError) {
      console.error("Save error:", saveError);
      throw saveError;
    }

    return new Response(
      JSON.stringify({ content: savedContent,
        creditsRemaining: creditData.credits_remaining - creditsNeeded }),
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