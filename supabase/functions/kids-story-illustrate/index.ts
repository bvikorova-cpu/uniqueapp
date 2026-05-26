// Kids Story Illustrate — generates a single AI illustration for one story page.
// Costs 2 kids_story credits per page. Uses Lovable AI Gateway image model.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const COST = 2;
const MODEL = "google/gemini-2.5-flash-image";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

const STYLE_HINTS: Record<string, string> = {
  watercolor: "soft watercolor children's book illustration, gentle pastel colors",
  cartoon: "bright cheerful cartoon style, bold outlines, vivid colors",
  pixar: "3D Pixar-style render, warm cinematic lighting, expressive characters",
  anime: "cute anime / studio ghibli style, soft cel-shading",
  storybook: "classic storybook illustration, hand-drawn ink and color wash",
  pencil: "delicate pencil sketch with light color tint",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization header" }, 401);

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Invalid bearer token" }, 401);
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const pageText = String(body.pageText || "").trim();
    const storyTitle = String(body.storyTitle || "").trim().slice(0, 120);
    const style = String(body.style || "storybook").toLowerCase();
    const characters = String(body.characters || "").trim().slice(0, 200);

    if (!pageText) return json({ error: "pageText required" }, 400);
    if (pageText.length > 1200) return json({ error: "pageText too long" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Ensure & check credits
    const { data: credRow } = await admin
      .from("kids_story_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    const balance = credRow?.credits_remaining ?? 0;
    if (!credRow) {
      await admin.from("kids_story_credits").insert({
        user_id: user.id, credits_remaining: 0, total_credits_purchased: 0,
      });
    }
    if (balance < COST) {
      return json({ error: "Insufficient credits", credits_remaining: balance, cost: COST }, 402);
    }

    const styleHint = STYLE_HINTS[style] || STYLE_HINTS.storybook;
    const prompt = `Children's book illustration for the story "${storyTitle || "A Magical Tale"}".
Scene to depict: ${pageText}
${characters ? `Main characters: ${characters}.` : ""}
Visual style: ${styleHint}. Age-appropriate for kids 4-10, friendly and safe, no text or letters in the image, no scary or violent imagery, vibrant composition, full-bleed illustration.`;

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (aiResp.status === 429) return json({ error: "Rate limited, try again shortly" }, 429);
    if (aiResp.status === 402) return json({ error: "AI credits exhausted (workspace)" }, 402);
    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("AI image error", aiResp.status, txt);
      return json({ error: "Illustration failed" }, 500);
    }

    const aiJson = await aiResp.json();
    const imageUrl: string | undefined =
      aiJson?.choices?.[0]?.message?.images?.[0]?.image_url?.url ||
      aiJson?.choices?.[0]?.message?.images?.[0]?.url;

    if (!imageUrl) {
      console.error("No image in response", JSON.stringify(aiJson).slice(0, 500));
      return json({ error: "No image generated" }, 500);
    }

    // Deduct credits only after success
    const newBalance = balance - COST;
    await admin
      .from("kids_story_credits")
      .update({ credits_remaining: newBalance, last_used_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return json({
      illustration: imageUrl,
      credits_remaining: newBalance,
      cost: COST,
    });
  } catch (e: any) {
    console.error("kids-story-illustrate error", e);
    return json({ error: e?.message || "Internal error" }, 500);
  }
});
