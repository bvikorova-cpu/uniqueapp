import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COST = 25;
const CHUNK = 20;

type TranslateItem = { id: string; title: string; description: string };

/**
 * Isolated edge function for the Kids Channel "Learning Posters" section.
 * Translates every poster title/description plus the book chapter texts into a
 * target language so the browser can build the translated encyclopedia PDF.
 * Charges 25 credits from the unified `ai_credits` wallet.
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

    const body = await req.json().catch(() => ({}));
    const language = typeof body.language === "string" ? body.language.trim().slice(0, 40) : "";
    const rawItems = Array.isArray(body.items) ? body.items : [];
    const items: TranslateItem[] = rawItems
      .slice(0, 200)
      .map((item: Record<string, unknown>) => ({
        id: String(item?.id ?? "").slice(0, 80),
        title: String(item?.title ?? "").slice(0, 160),
        description: String(item?.description ?? "").slice(0, 400),
      }))
      .filter((item: TranslateItem) => item.id && item.title);

    if (!language || items.length === 0) {
      return new Response(JSON.stringify({ error: "Missing language or texts to translate." }), {
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const translations: Record<string, { title: string; description: string }> = {};

    for (let i = 0; i < items.length; i += CHUNK) {
      const batch = items.slice(i, i + CHUNK);
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Lovable-API-Key": LOVABLE_API_KEY,
          "Content-Type": "application/json",
          "X-Lovable-AIG-SDK": "fetch",
        },
        body: JSON.stringify({
          model: "google/gemini-3.8-flash",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You translate short educational titles and descriptions for a children's poster book. Keep them short, natural and age appropriate. Reply with JSON only.",
            },
            {
              role: "user",
              content: `Translate every title and description into ${language}. Return JSON in the shape {"items":[{"id":"...","title":"...","description":"..."}]} with the same ids. Source JSON:\n${JSON.stringify(batch)}`,
            },
          ],
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error("Encyclopedia translate AI error:", aiResponse.status, errorText);
        const status = aiResponse.status === 429 ? 429 : aiResponse.status === 402 ? 402 : 500;
        return new Response(
          JSON.stringify({
            error:
              status === 429
                ? "Too many requests right now. Please try again in a moment."
                : "Could not translate the encyclopedia. Please try again.",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status },
        );
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content ?? "{}";
      let parsed: { items?: TranslateItem[] } = {};
      try {
        parsed = JSON.parse(content);
      } catch {
        const match = String(content).match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : {};
      }
      for (const entry of parsed.items ?? []) {
        if (!entry?.id) continue;
        translations[entry.id] = {
          title: String(entry.title ?? "").trim(),
          description: String(entry.description ?? "").trim(),
        };
      }
    }

    if (Object.keys(translations).length === 0) {
      return new Response(JSON.stringify({ error: "Translation came back empty. Please try again." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const { error: deductError } = await supabase.rpc("deduct_ai_credits", {
      p_user_id: user.id,
      p_amount: COST,
      p_reason: "kids_encyclopedia_translate",
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
      usage_type: "kids_encyclopedia_translate",
      credits_used: COST,
      description: `Learning encyclopedia translated to ${language}`,
    });

    return new Response(
      JSON.stringify({ success: true, language, translations, creditsRemaining: balance - COST, cost: COST }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    console.error("kids-encyclopedia-translate error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
