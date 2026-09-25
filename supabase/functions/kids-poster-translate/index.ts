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

const COST = 1;

/**
 * Isolated edge function for the Kids Channel "Learning Posters" section.
 * Reads and translates one existing poster, including each text position, and
 * charges 1 credit from the unified `ai_credits` wallet.
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
    const posterId = typeof body.posterId === "string" ? body.posterId.replace(/[^a-z0-9-]/gi, "").slice(0, 80) : "";
    const langId = typeof body.langId === "string" ? body.langId.replace(/[^a-z]/gi, "").slice(0, 8) : "";

    const readyImage = typeof body.readyImage === "string" ? body.readyImage : "";
    const isDataImage = (value: string) =>
      /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value) && value.length <= 8_000_000;

    const validSourceImage = isDataImage(sourceImage);
    const validReadyImage = isDataImage(readyImage);

    // Pre-rendered translation uploaded by the team: <bucket>/<posterId>/<langId>.<ext>
    let presetPath: string | null = null;
    if (posterId && langId) {
      const { data: listed } = await supabase.storage
        .from("kids-poster-translations")
        .list(posterId, { limit: 100 });
      const match = (listed ?? []).find((f) => f.name.toLowerCase().startsWith(`${langId.toLowerCase()}.`));
      if (match) presetPath = `${posterId}/${match.name}`;
    }

    if (title.length < 2 || language.length < 2 || (!presetPath && !validReadyImage && !validSourceImage)) {
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

    let imagePayload: string | null = null;

    if (validReadyImage) {
      imagePayload = readyImage;
    } else if (presetPath) {
      const { data: signed, error: signError } = await supabase.storage
        .from("kids-poster-translations")
        .createSignedUrl(presetPath, 3600);
      if (signError || !signed?.signedUrl) {
        return new Response(JSON.stringify({ error: "Translated poster could not be loaded. Please try again." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
      imagePayload = signed.signedUrl;
    } else {
      const prompt = [
        `Translate every visible word on this children's educational poster from English into ${language}.`,
        `Return the complete finished poster in ${language}, with correct spelling and diacritics.`,
        "Keep the same educational topic, objects, characters, colors, visual hierarchy, portrait format and cheerful illustrated style.",
        "Do not leave any English text. Do not add a watermark or commentary outside the poster.",
        `Context: ${title}; children aged ${ages}. ${description}`,
      ].join("\n");

      const generated = await tryVertexImage(prompt, "1024x1536", 1, sourceImage, { temperature: 0.2 })
        .catch((error) => {
          console.warn("direct Gemini poster translation failed:", error instanceof Error ? error.message : String(error));
          return null;
        });
      const b64 = generated?.data?.[0]?.b64_json;
      if (typeof b64 !== "string" || !b64) {
        return new Response(JSON.stringify({ error: "Gemini could not create the translated poster. Please try again." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
      imagePayload = `data:image/png;base64,${b64}`;
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
      description: `${(validReadyImage || presetPath) ? "Ready-made" : "Gemini"} poster translation to ${language}: ${title}`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        language,
        title,
        description,
        image: imagePayload,
        preset: validReadyImage || !!presetPath,

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
