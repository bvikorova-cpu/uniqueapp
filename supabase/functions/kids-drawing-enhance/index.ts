// Kids Drawing Enhance — turns a child's sketch into polished AI art (style transfer).
// Costs 4 kids_drawing credits per enhancement. Uses Lovable AI Gateway image model.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const COST = 4;
const MODEL = "google/gemini-2.5-flash-image";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

const STYLE_HINTS: Record<string, string> = {
  watercolor: "soft watercolor painting, gentle pastel colors, paper texture",
  cartoon: "bright cheerful cartoon style, bold clean outlines, vivid saturated colors",
  pixar: "3D Pixar-style render, warm cinematic lighting, expressive shapes",
  anime: "studio ghibli / cute anime style, soft cel-shading, dreamy background",
  storybook: "classic children's storybook illustration, ink lines with color wash",
  pencil: "delicate colored pencil drawing with light shading",
  comic: "comic book style with halftone shading and bold outlines",
  oil: "rich oil painting with visible brushstrokes and dramatic light",
  pixel: "cute 16-bit pixel art style, limited palette",
  neon: "vibrant neon glow art, dark background, electric colors",
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
    const sketchBase64 = String(body.sketchBase64 || "").trim();
    const description = String(body.description || "").trim().slice(0, 240);
    const style = String(body.style || "cartoon").toLowerCase();

    if (!sketchBase64 || !sketchBase64.startsWith("data:image/")) {
      return json({ error: "sketchBase64 (data:image/...) required" }, 400);
    }
    if (sketchBase64.length > 8_000_000) {
      return json({ error: "Sketch too large (max ~6MB)" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Ensure & check credits
    const { data: credRow } = await admin
      .from("kids_drawing_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!credRow) {
      await admin.from("kids_drawing_credits").insert({
        user_id: user.id, credits_remaining: 0, total_credits_purchased: 0,
      });
      return json({ error: "Insufficient credits", credits_remaining: 0, cost: COST }, 402);
    }
    const balance = credRow.credits_remaining ?? 0;
    if (balance < COST) {
      return json({ error: "Insufficient credits", credits_remaining: balance, cost: COST }, 402);
    }

    const styleHint = STYLE_HINTS[style] || STYLE_HINTS.cartoon;
    const prompt = `You are an AI art teacher polishing a child's hand-drawn sketch.
Take the sketch in the attached image and transform it into a polished, beautiful artwork that PRESERVES the child's composition, subject, and creative intent — same characters, same poses, same scene, same overall layout.
${description ? `The child says it shows: ${description}.` : ""}
Render it in this style: ${styleHint}.
Rules: keep it kid-friendly (ages 4-12), no text or letters in the image, no scary, violent or adult content, friendly faces, vibrant and inspiring. Output a single full-bleed illustration.`;

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: sketchBase64 } },
          ],
        }],
        modalities: ["image", "text"],
      }),
    });

    if (aiResp.status === 429) return json({ error: "Rate limited, try again shortly" }, 429);
    if (aiResp.status === 402) return json({ error: "AI credits exhausted (workspace)" }, 402);
    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("AI image error", aiResp.status, txt);
      return json({ error: "Enhancement failed" }, 500);
    }

    const aiJson = await aiResp.json();
    const imageUrl: string | undefined =
      aiJson?.choices?.[0]?.message?.images?.[0]?.image_url?.url ||
      aiJson?.choices?.[0]?.message?.images?.[0]?.url;

    if (!imageUrl) {
      console.error("No image in response", JSON.stringify(aiJson).slice(0, 500));
      return json({ error: "No image generated" }, 500);
    }

    const newBalance = balance - COST;
    await admin
      .from("kids_drawing_credits")
      .update({ credits_remaining: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return json({
      enhanced: imageUrl,
      style,
      credits_remaining: newBalance,
      cost: COST,
    });
  } catch (e: any) {
    console.error("kids-drawing-enhance error", e);
    return json({ error: e?.message || "Internal error" }, 500);
  }
});
