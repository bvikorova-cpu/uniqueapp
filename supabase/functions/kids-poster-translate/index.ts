import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

import { createClient } from "npm:@supabase/supabase-js@2";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";
import { tryVertexChat, tryVertexImage } from "../_shared/vertexDirect.ts";
import { tryGatewayImage } from "../_shared/imageFallback.ts";


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

    // Step 1 — read the poster: describe its exact visual style and collect
    // every visible English string with its translation.
    let plan: {
      style?: string;
      layout?: string;
      texts?: Array<{ en: string; tr: string }>;
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
                  "You prepare a faithful re-creation of this children's educational poster in another language.",
                  "style: one detailed paragraph describing the illustration style, palette, outlines, background, characters and typography so an image model can reproduce the same look.",
                  "layout: one paragraph describing the exact arrangement of the title, sections, illustrations, grids, rows and footer.",
                  `texts: every visible English string, in reading order, with its ${language} translation (correct spelling, grammar and diacritics). Max 40 items.`,
                  `Also translate the poster title and description into ${language}. Poster: ${title} (children aged ${ages}). ${description}`,
                  'Answer ONLY with compact JSON: {"style":"...","layout":"...","title":"...","description":"...","texts":[{"en":"...","tr":"..."}]}',
                ].join(" "),
              },
            ],
          }],
          temperature: 0.2,
          response_format: { type: "json_object" },
        });
        const parsed = klpParseJson(String(look?.choices?.[0]?.message?.content ?? ""));
        if (parsed && Array.isArray(parsed.texts) && parsed.texts.length) plan = parsed;
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

    const texts = (plan.texts ?? [])
      .filter((t: any) => typeof t?.en === "string" && typeof t?.tr === "string" && t.tr.trim())
      .slice(0, 40)
      .map((t: any) => ({ en: String(t.en).trim().slice(0, 120), tr: String(t.tr).trim().slice(0, 160) }));

    const headTitle = typeof plan.title === "string" && plan.title.trim()
      ? plan.title.trim().slice(0, 160)
      : title;
    const headDescription = typeof plan.description === "string" && plan.description.trim()
      ? plan.description.trim().slice(0, 400)
      : description;

    // Step 2 — generate a brand new poster in the same style, with every word
    // written in the target language only.
    const wordList = texts.map((t) => `"${t.tr}"`).join(", ");
    const prompt = [
      `Create a children's educational poster titled "${headTitle}" for children aged ${ages}.`,
      `ALL text on the poster must be written in ${language} only — no English anywhere.`,
      `Use exactly these ${language} words and phrases, spelled character for character with correct diacritics: ${wordList}.`,
      `Visual style to reproduce: ${String(plan.style ?? "").slice(0, 1400)}`,
      `Layout to reproduce: ${String(plan.layout ?? "").slice(0, 1400)}`,
      "Same friendly printable look, clean flat vector illustration, crisp readable lettering, no watermark, no extra invented words, no misspellings.",
    ].join("\n");

    const generated = await tryVertexImage(prompt, "1024x1536", 1, sourceImage)
      .catch(() => null);
    let b64: string | null = generated?.data?.[0]?.b64_json ?? null;
    if (!b64) b64 = await tryGatewayImage(prompt, "1024x1536", sourceImage);

    if (!b64) {
      return new Response(JSON.stringify({ error: "Translation is temporarily unavailable. Please try again." }), {
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
      description: `Poster re-created in ${language}: ${title}`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        language,
        title: headTitle,
        description: headDescription,
        image: `data:image/png;base64,${b64}`,
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
