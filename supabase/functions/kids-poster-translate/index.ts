import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

import { createClient } from "npm:@supabase/supabase-js@2";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";
import { tryVertexChat } from "../_shared/vertexDirect.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COST = 2;

/**
 * Isolated edge function for the Kids Channel "Learning Posters" section.
 * Reads and translates one existing poster, including each text position, and
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

    // Step 1 — collect and translate every visible English string. The source
    // pixels remain the only visual specification for the edit.
    let plan: {
      regions?: Array<{
        en: string;
        tr: string;
        x: number;
        y: number;
        w: number;
        h: number;
        background: string;
        color: string;
        align?: "left" | "center" | "right";
        weight?: "normal" | "bold";
      }>;
      title?: string;
      description?: string;
    } | null = null;

    const klpParseJson = (raw: string): any | null => {
      const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
      try {
        return JSON.parse(json);
      } catch (_e) {
        return null;
      }
    };

    for (let attempt = 0; attempt < 2 && !plan; attempt++) {
      try {
        const look = await tryVertexChat({
          model: "openai/gpt-6-astra",
          messages: [{
            role: "user",
            content: [
              { type: "image_url", image_url: { url: sourceImage } },
              {
                type: "text",
                text: [
                  "Act as an OCR and translation engine for a Canva-style text replacement. Do not redesign the image.",
                  `Find every visible English text region and translate it to ${language} with correct spelling, grammar and diacritics. Max 40 regions.`,
                  "For each region return its tight rectangle on a 1000x1000 normalized image grid, its dominant background color and text color as #RRGGBB, alignment, and weight.",
                  "Coordinates must cover the complete original lettering but as little surrounding artwork as possible. Split visually separate labels into separate regions.",
                  `Also translate the poster title and description into ${language}. Poster: ${title} (children aged ${ages}). ${description}`,
                  'Answer ONLY with compact JSON: {"title":"...","description":"...","regions":[{"en":"...","tr":"...","x":0,"y":0,"w":100,"h":40,"background":"#FFFFFF","color":"#111111","align":"center","weight":"bold"}]}',
                ].join(" "),
              },
            ],
          }],
          temperature: 0.2,
          response_format: { type: "json_object" },
        });
        const parsed = klpParseJson(String(look?.choices?.[0]?.message?.content ?? ""));
        if (parsed && Array.isArray(parsed.regions) && parsed.regions.length) plan = parsed;
      } catch (e) {
        console.warn("poster reading step failed:", e instanceof Error ? e.message : String(e));
      }
    }

    if (!plan) {
      return new Response(JSON.stringify({ error: "Translation is temporarily unavailable. Please try again." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const regions = (plan.regions ?? [])
      .filter((region: any) =>
        typeof region?.en === "string" && typeof region?.tr === "string" && region.tr.trim()
        && [region.x, region.y, region.w, region.h].every((value) => Number.isFinite(Number(value)))
      )
      .slice(0, 40)
      .map((region: any) => ({
        en: String(region.en).trim().slice(0, 120),
        tr: String(region.tr).trim().slice(0, 160),
        x: Math.max(0, Math.min(1000, Number(region.x))),
        y: Math.max(0, Math.min(1000, Number(region.y))),
        w: Math.max(8, Math.min(1000, Number(region.w))),
        h: Math.max(8, Math.min(1000, Number(region.h))),
        background: /^#[0-9a-f]{6}$/i.test(String(region.background)) ? String(region.background) : "#FFFFFF",
        color: /^#[0-9a-f]{6}$/i.test(String(region.color)) ? String(region.color) : "#111111",
        align: ["left", "center", "right"].includes(region.align) ? region.align : "center",
        weight: region.weight === "normal" ? "normal" : "bold",
      }));

    if (!regions.length) {
      return new Response(JSON.stringify({ error: "No editable text was found on this poster." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 422,
      });
    }

    const headTitle = typeof plan.title === "string" && plan.title.trim()
      ? plan.title.trim().slice(0, 160)
      : title;
    const headDescription = typeof plan.description === "string" && plan.description.trim()
      ? plan.description.trim().slice(0, 400)
      : description;

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
      description: `Poster text translated to ${language}: ${title}`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        language,
        title: headTitle,
        description: headDescription,
        regions,
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
