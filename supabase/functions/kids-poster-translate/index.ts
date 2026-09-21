import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

import { createClient } from "npm:@supabase/supabase-js@2";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";
import { tryVertexImage, tryVertexChat } from "../_shared/vertexDirect.ts";

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

    // Step 1 — read every visible English string off the poster and translate it,
    // so the image edit gets an explicit word-for-word mapping instead of having
    // to translate on its own (which left most lettering in English).
    let mapping = "";
    try {
      const ocr = await tryVertexChat({
        model: "google/gemini-2.5-flash",
        messages: [{
          role: "user",
          content: [
            { type: "image_url", image_url: { url: sourceImage } },
            {
              type: "text",
              text: [
                "List every visible text string on this children's educational poster, in reading order.",
                `For each one give its ${language} translation (correct spelling, grammar, diacritics; keep the same capitalisation style and keep it short so it fits the same space).`,
                'Answer ONLY with JSON: {"items":[{"en":"...","tr":"..."}]}',
              ].join(" "),
            },
          ],
        }],
        temperature: 0.2,
      });
      const raw = String(ocr?.choices?.[0]?.message?.content ?? "");
      const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
      const items = JSON.parse(json)?.items;
      if (Array.isArray(items)) {
        mapping = items
          .filter((i: any) => typeof i?.en === "string" && typeof i?.tr === "string")
          .slice(0, 60)
          .map((i: any) => `"${String(i.en).slice(0, 60)}" -> "${String(i.tr).slice(0, 80)}"`)
          .join("; ");
      }
    } catch (e) {
      console.warn("poster OCR/translate step failed:", e instanceof Error ? e.message : String(e));
    }

    const buildPrompt = (strict: boolean) => [
      `TASK: rewrite the lettering of this poster into ${language}. This is a localisation job: the artwork stays, the words change.`,
      mapping
        ? `Replace the text exactly like this: ${mapping}.`
        : `Translate every visible English word into ${language} with correct spelling, grammar and diacritics.`,
      "The finished image must contain ZERO English words — title, headings, labels, captions and tiny decorative text all included.",
      `Poster topic: ${title} (children aged ${ages}). ${description}`,
      "KEEP IDENTICAL: composition, dimensions, crop, background, illustrations, characters, poses, shapes, frames, borders, colours, shadows, decorations, spacing and art style. Do not redraw, restyle, simplify, add, remove, move or resize any graphic element.",
      "Every translated word sits in the exact place of the English it replaces, in the same font style, weight, colour, alignment and size hierarchy; shrink the text slightly only when a longer word would not fit.",
      strict
        ? "A previous attempt left English text in the image. This time you MUST paint over every English string and letter it in the target language instead."
        : "",
      "Output only the edited poster image.",
    ].filter(Boolean).join(" ");

    const stillEnglish = async (b64: string) => {
      try {
        const check = await tryVertexChat({
          model: "google/gemini-2.5-flash",
          messages: [{
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } },
              {
                type: "text",
                text:
                  `Is any visible text on this poster still written in English rather than ${language}? Answer with one word: YES or NO.`,
              },
            ],
          }],
          temperature: 0,
        });
        return /yes/i.test(String(check?.choices?.[0]?.message?.content ?? ""));
      } catch {
        return false;
      }
    };

    let aiData = await tryVertexImage(buildPrompt(false), undefined, 1, [sourceImage]);
    let candidate = aiData?.data?.[0]?.b64_json;
    if (candidate && await stillEnglish(candidate)) {
      const retry = await tryVertexImage(buildPrompt(true), undefined, 1, [sourceImage]);
      const retryImage = retry?.data?.[0]?.b64_json;
      if (retryImage && !(await stillEnglish(retryImage))) {
        aiData = retry;
      } else if (retryImage) {
        aiData = retry;
      }
    }


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
