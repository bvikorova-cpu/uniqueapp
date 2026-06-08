// Kids Drawing Enhance — turns a child's sketch into polished AI art.
// Costs 4 kids_drawing credits per enhancement. Uses OpenAI gpt-image-1 (supports image input).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const COST = 4;
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

function dataUrlToBlob(dataUrl: string): { blob: Blob; ext: string } {
  const m = dataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
  if (!m) throw new Error("Invalid data URL");
  const mime = m[1];
  const ext = mime.split("/")[1] || "png";
  const bytes = Uint8Array.from(atob(m[2]), c => c.charCodeAt(0));
  return { blob: new Blob([bytes], { type: mime }), ext };
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
    const mode = String(body.mode || body.action || "enhance").toLowerCase();

    // ============ TUTORIAL MODE ============
    if (mode === "tutorial") {
      const topic = String(body.topic || "").trim().slice(0, 100);
      const difficulty = String(body.difficulty || "easy").toLowerCase();
      if (!topic) return json({ error: "topic required" }, 400);

      const adminT = createClient(SUPABASE_URL, SERVICE_KEY);
      const { data: credRowT } = await adminT
        .from("kids_drawing_credits")
        .select("credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!credRowT) {
        await adminT.from("kids_drawing_credits").insert({
          user_id: user.id, credits_remaining: 0, total_credits_purchased: 0,
        });
        return json({ error: "Insufficient credits", credits_remaining: 0, cost: COST }, 402);
      }
      const balanceT = credRowT.credits_remaining ?? 0;
      if (balanceT < COST) {
        return json({ error: "Insufficient credits", credits_remaining: balanceT, cost: COST }, 402);
      }

      const stepCount = difficulty === "hard" ? 6 : difficulty === "medium" ? 5 : 4;
      const tRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: `You create kid-friendly step-by-step drawing tutorials for ages 4-12. Return STRICT JSON: {"title": string, "steps": [{"instruction": string}]}. Each instruction <20 words, encouraging, simple shapes (circle, oval, line, curve, triangle). No scary content.` },
            { role: "user", content: `Create a ${difficulty} ${stepCount}-step drawing tutorial for: ${topic}.` },
          ],
          max_completion_tokens: 800,
        }),
      });
      if (!tRes.ok) {
        console.error("OpenAI tutorial error:", await tRes.text());
        return json({ error: "AI tutorial generation failed" }, 502);
      }
      const tData = await tRes.json();
      const content = tData.choices?.[0]?.message?.content || "{}";
      let parsed: any = {};
      try { parsed = JSON.parse(content); } catch { parsed = {}; }
      const title = String(parsed.title || `How to draw ${topic}`).slice(0, 80);
      const steps = Array.isArray(parsed.steps) && parsed.steps.length > 0
        ? parsed.steps.map((s: any) => ({ instruction: String(s?.instruction || "").slice(0, 200) })).filter((s: any) => s.instruction)
        : [{ instruction: `Start by drawing the outline of a ${topic}.` }];

      await adminT.from("kids_drawing_credits")
        .update({ credits_remaining: balanceT - COST })
        .eq("user_id", user.id);

      return json({ title, steps, topic, difficulty });
    }

    // ============ ENHANCE MODE (default) ============
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
    const prompt = `Polish this child's hand-drawn sketch into a beautiful artwork. PRESERVE composition, subject, poses, and creative intent.
${description ? `The child says it shows: ${description}.` : ""}
Render in style: ${styleHint}.
Kid-friendly (ages 4-12), no text or letters, no scary or violent content, friendly faces, vibrant.`;

    const { blob, ext } = dataUrlToBlob(sketchBase64);
    const form = new FormData();
    form.append("model", "gpt-image-1");
    form.append("prompt", prompt.slice(0, 4000));
    form.append("n", "1");
    form.append("size", "1024x1024");
    form.append("image", blob, `sketch.${ext}`);

    const aiResp = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
    });

    if (aiResp.status === 429) return json({ error: "Rate limited, try again shortly" }, 429);
    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("OpenAI image edit error", aiResp.status, txt);
      return json({ error: "Enhancement failed" }, 500);
    }

    const aiJson = await aiResp.json();
    const b64 = aiJson?.data?.[0]?.b64_json;
    const url = aiJson?.data?.[0]?.url;
    const imageUrl = b64 ? `data:image/png;base64,${b64}` : url;

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
