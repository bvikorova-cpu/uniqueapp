import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

import { createClient } from "npm:@supabase/supabase-js@2";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COST = 3;

/**
 * Isolated edge function for the Kids Channel "Learning Posters" section.
 * Generates one printable A4 educational poster from a child-safe prompt and
 * charges 3 credits from the unified `ai_credits` wallet.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { data: authData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = authData.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const rateLimited = await withRateLimit(req, RATE_LIMITS.ai_generation, corsHeaders, user.id);
    if (rateLimited) return rateLimited;

    const body = await req.json().catch(() => ({}));
    const topic = typeof body.topic === "string" ? body.topic.trim().slice(0, 300) : "";
    const ageGroup = typeof body.ageGroup === "string" ? body.ageGroup.trim().slice(0, 40) : "6-10";
    const style = typeof body.style === "string" ? body.style.trim().slice(0, 40) : "playful";

    if (topic.length < 3) {
      return new Response(JSON.stringify({ error: "Please describe what the poster should teach." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { data: credRow, error: creditsError } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    if (creditsError) {
      return new Response(JSON.stringify({ error: `Credits error: ${creditsError.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const balance = credRow?.credits_remaining ?? 0;
    if (!credRow) {
      await supabase
        .from("ai_credits")
        .insert({ user_id: user.id, credits_remaining: 0, total_credits_purchased: 0 });
    }
    if (balance < COST) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits", credits_remaining: balance, cost: COST }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const styleHint =
      style === "teen"
        ? "modern clean infographic look, bold sans-serif headline, pastel gradient background, illustrated teenagers"
        : style === "gentle"
          ? "soft watercolor pastel look, gentle rounded shapes, friendly animal characters"
          : "bright rainbow bubble headline, rounded white cards with pastel colour headers, smiling cartoon children and animals, stars and hearts";

    const prompt = [
      `Educational printable poster for children aged ${ageGroup}, A4 portrait layout.`,
      `Topic: ${topic}.`,
      `Design: ${styleHint}, thick clean outlines, flat vector storybook illustration, well organised grid of labelled cards, plenty of white space, print ready.`,
      "All wording in clear simple English, short labels only, crisp legible typography, correctly spelled.",
      "Strictly child friendly and wholesome: no violence, no scary content, no nudity, no brands or logos, no country flags.",
    ].join(" ");

    const aiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "gpt-image-1", prompt, size: "1024x1536", n: 1 }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Poster AI error:", aiResponse.status, errorText);
      const status = aiResponse.status === 429 ? 429 : 500;
      return new Response(
        JSON.stringify({
          error:
            status === 429
              ? "Too many requests right now. Please try again in a moment."
              : "Could not generate the poster. Please try a different description.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status },
      );
    }

    const aiData = await aiResponse.json();
    const base64Image = aiData.data?.[0]?.b64_json;
    if (!base64Image) {
      return new Response(JSON.stringify({ error: "Failed to generate the poster. Please try again." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const { error: deductError } = await supabase.rpc("deduct_ai_credits", {
      p_user_id: user.id,
      p_amount: COST,
      p_reason: "kids_learning_poster",
      p_source: "kids_learning_posters",
    });
    if (deductError) {
      const status = /insufficient/i.test(deductError.message) ? 402 : 500;
      return new Response(
        JSON.stringify({ error: deductError.message, credits_remaining: balance, cost: COST }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status },
      );
    }

    await supabase.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: "kids_learning_poster",
      credits_used: COST,
      description: `Learning poster: ${topic} (ages ${ageGroup})`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: `data:image/png;base64,${base64Image}`,
        creditsRemaining: balance - COST,
        cost: COST,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    console.error("kids-learning-poster error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
