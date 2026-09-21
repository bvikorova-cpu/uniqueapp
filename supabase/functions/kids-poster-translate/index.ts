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

    // Read every visible English string and its position. The client draws each
    // translation directly below the matching English text without regenerating
    // or changing the original artwork.
    let items: Array<{ en: string; tr: string; x: number; y: number; w: number; h: number }> = [];

    // Tolerant extraction: the model sometimes returns a truncated array, so we
    // salvage every complete object instead of failing the whole response.
    const klpExtractItems = (raw: string): any[] => {
      const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
      try {
        const parsed = JSON.parse(json)?.items;
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch (_e) {
        // fall through to per-object salvage
      }
      const out: any[] = [];
      const objects = raw.match(/\{[^{}]*"en"[^{}]*\}/g) ?? [];
      for (const chunk of objects) {
        try {
          out.push(JSON.parse(chunk));
        } catch (_e) {
          // ignore malformed fragment
        }
      }
      return out;
    };

    for (let attempt = 0; attempt < 2 && !items.length; attempt++) {
      try {
        const ocr = await tryVertexChat({
          model: "openai/gpt-6-astra",
          messages: [{
            role: "user",
            content: [
              { type: "image_url", image_url: { url: sourceImage } },
              {
                type: "text",
                text: [
                  "Find every visible English text string on this children's educational poster, in reading order, without duplicates.",
                  `For each one give its ${language} translation with correct spelling, grammar and diacritics.`,
                  "Also give its bounding box as x, y, w, h integers on a 0-1000 coordinate grid relative to the full image.",
                  "Boxes must tightly cover the matching English text, not its illustration.",
                  "Return at most 40 items. Keep the JSON compact on a single line with no extra commentary.",
                  `Poster topic: ${title} (children aged ${ages}). ${description}`,
                  'Answer ONLY with JSON: {"items":[{"en":"...","tr":"...","x":0,"y":0,"w":100,"h":40}]}',
                ].join(" "),
              },
            ],
          }],
          temperature: 0.2,
          response_format: { type: "json_object" },
        });
        const raw = String(ocr?.choices?.[0]?.message?.content ?? "");
        const parsed = klpExtractItems(raw);
        if (Array.isArray(parsed)) {
          const seen = new Set<string>();
          items = parsed
            .filter((i: any) => typeof i?.en === "string" && typeof i?.tr === "string")
            .map((i: any) => ({
              en: String(i.en).trim().slice(0, 120),
              tr: String(i.tr).trim().slice(0, 160),
              x: Math.max(0, Math.min(1000, Number(i.x) || 0)),
              y: Math.max(0, Math.min(1000, Number(i.y) || 0)),
              w: Math.max(20, Math.min(1000, Number(i.w) || 100)),
              h: Math.max(12, Math.min(300, Number(i.h) || 40)),
            }))
            .filter((i) => {
              const key = i.en.toLowerCase();
              if (!i.en || !i.tr || seen.has(key)) return false;
              seen.add(key);
              return true;
            })
            .slice(0, 80);
        }
      } catch (e) {
        console.warn("poster translation step failed:", e instanceof Error ? e.message : String(e));
      }
    }


    // Translate the poster's own title and description too.
    let headTitle = title;
    let headDescription = description;
    try {
      const head = await tryVertexChat({
        model: "openai/gpt-6-astra",
        messages: [{
          role: "user",
          content:
            `Translate into ${language}. Answer ONLY with JSON {"title":"...","description":"..."}. title: ${title}. description: ${description}`,
        }],
        temperature: 0.2,
      });
      const raw = String(head?.choices?.[0]?.message?.content ?? "");
      const parsed = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
      if (typeof parsed?.title === "string" && parsed.title.trim()) headTitle = parsed.title.trim().slice(0, 160);
      if (typeof parsed?.description === "string" && parsed.description.trim()) {
        headDescription = parsed.description.trim().slice(0, 400);
      }
    } catch (e) {
      console.warn("poster head translation failed:", e instanceof Error ? e.message : String(e));
    }

    if (!items.length) {
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
      description: `Poster translated to ${language}: ${title}`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        language,
        title: headTitle,
        description: headDescription,
        items,
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
