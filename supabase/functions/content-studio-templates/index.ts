import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TEMPLATE_CREDITS: Record<string, number> = {
  email_marketing: 3, facebook_ad: 2, linkedin_post: 2, twitter_thread: 3,
  instagram_caption: 1, press_release: 5, product_description: 2, pitch_deck: 5,
  newsletter: 3, chatbot_script: 3,
};

const TEMPLATE_PROMPTS: Record<string, string> = {
  email_marketing: "Create a professional email marketing campaign with: Subject line, Preview text, Email body with greeting, main content, and CTA button text. Include 3 subject line variations.",
  facebook_ad: "Create a Facebook/Instagram ad with: Primary text (125 chars), Headline (40 chars), Description (30 chars), and CTA. Provide 3 variations.",
  linkedin_post: "Create a LinkedIn thought leadership post with: Hook line, Main content (300 words), relevant hashtags (5-7), and engagement question.",
  twitter_thread: "Create a Twitter/X thread with 5-8 tweets. Include: Hook tweet, numbered content tweets, and closing CTA tweet. Add relevant hashtags.",
  instagram_caption: "Create an Instagram caption with: Hook line, main body (150 words), CTA, and 20 relevant hashtags organized by category.",
  press_release: "Write a professional press release with: Headline, Dateline, Lead paragraph, Body (3-4 paragraphs), Boilerplate, and Contact info placeholder.",
  product_description: "Write a compelling product description with: Headline, Subheadline, 5 key benefits with icons, Technical specs section, and CTA.",
  pitch_deck: "Create scripts for a 10-slide pitch deck: Title, Problem, Solution, Market Size, Business Model, Traction, Team, Competition, Financials, Ask.",
  newsletter: "Create a newsletter with: Header/Banner text, Introduction, 3 content sections with headers, Tips/Highlights section, and Sign-off.",
  chatbot_script: "Create a chatbot dialog flow with: Welcome message, 5 common FAQ responses, Escalation message, and Closing message. Include intent tags.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Not authenticated");

    const { templateType, topic, details } = await req.json();
    const creditCost = TEMPLATE_CREDITS[templateType] || 2;

    // Check credits
    const { data: credits } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .single();

    if (!credits || credits.credits_remaining < creditCost) {
      return new Response(JSON.stringify({ error: "Insufficient credits. Please purchase more." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = TEMPLATE_PROMPTS[templateType] || "Generate professional content.";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Topic: ${topic}\n\nAdditional details: ${details || "None provided"}` },
        ],
      }),
    });

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) throw new Error("Failed to generate content");

    // Deduct credits
    await supabase.from("ai_credits").update({
      credits_remaining: credits.credits_remaining - creditCost,
      last_used_at: new Date().toISOString(),
    }).eq("user_id", user.id);

    // Log usage
    await supabase.from("ai_usage_history").insert({
      user_id: user.id, usage_type: `template_${templateType}`, credits_used: creditCost,
      description: `Template: ${templateType} - ${topic}`,
    });

    return new Response(JSON.stringify({ content, creditsUsed: creditCost }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
