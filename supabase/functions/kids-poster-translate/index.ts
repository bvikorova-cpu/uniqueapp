import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

import { createClient } from "npm:@supabase/supabase-js@2";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";
import { tryVertexImage } from "../_shared/vertexDirect.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COST = 2;

/**
 * Isolated edge function for the Kids Channel "Learning Posters" section.
 * Edits one existing poster by replacing only its wording in another language and
 * charges 2 credits from the unified `ai_credits` wallet.
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
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
    const description = typeof body.description === "string" ? body.description.trim().slice(0, 300) : "";
    const ages = typeof body.ages === "string" ? body.ages.trim().slice(0, 40) : "6-10 years";
    const language = typeof body.language === "string" ? body.language.trim().slice(0, 40) : "";
    const sourceImage = typeof body.sourceImage === "string" ? body.sourceImage : "";

    const validSourceImage = /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(sourceImage)
      && sourceImage.length <= 8_000_000;
    if (title.length < 2 || language.length < 2 || !validSourceImage) {
      return new Response(JSON.stringify({ error: "Missing or invalid poster image or language." }), {
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
    if (balance < COST) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits", credits_remaining: balance, cost: COST }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 },
      );
    }

    const prompt = [
      "Perform a minimal text-only edit of the supplied educational poster.",
      `Translate every visible word from English into ${language}, using correct spelling, grammar and diacritics.`,
      `The poster topic is ${title}, for children aged ${ages}. Context: ${description}`,
      "ABSOLUTE PRESERVATION RULE: keep the source image's exact composition, dimensions, crop, background, illustrations, characters, objects, poses, shapes, borders, colours, shadows, decorative elements, spacing and visual style.",
      "Do not redesign, redraw, restyle, simplify, add, remove, move or resize anything except where text length makes a tiny text-size adjustment unavoidable.",
      "Replace only the existing English lettering in the same locations, matching each original font style, colour, alignment and hierarchy as closely as possible.",
      "Do not leave English text. Output only the edited poster image.",
    ].join(" ");

    const aiData = await tryVertexImage(prompt, "1024x1536", 1, [sourceImage]);
    const base64Image = aiData?.data?.[0]?.b64_json;
    if (!base64Image) {
      return new Response(JSON.stringify({ error: "Image editing is temporarily unavailable. Please try again." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const { error: deductError } = await supabase.rpc("deduct_ai_credits", {
      p_user_id: user.id,
      p_amount: COST,
      p_reason: "kids_poster_translate",
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
      usage_type: "kids_poster_translate",
      credits_used: COST,
      description: `Poster translated to ${language}: ${title}`,
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
    console.error("kids-poster-translate error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
