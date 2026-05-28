// generate-story-video — full pipeline: scenes (text) -> illustrations -> TTS audio
// Deducts kids_story credits: 1 (write) + 2/scene (image) + 1/scene (audio)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

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

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Invalid bearer token" }, 401);
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const theme = String(body.theme || "").trim().slice(0, 500);
    const language = String(body.language || "English").slice(0, 40);
    const sceneCount = Math.max(2, Math.min(8, Number(body.sceneCount) || 4));
    const wantAudio = body.audio !== false;

    if (!theme) return json({ error: "theme required" }, 400);

    if (!OPENAI_API_KEY) return json({ error: "AI service not configured" }, 500);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Compute cost
    const cost = 1 + sceneCount * 2 + (wantAudio ? sceneCount * 1 : 0);

    // Ensure credit row
    const { data: credRow } = await admin
      .from("kids_story_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!credRow) {
      await admin.from("kids_story_credits").insert({
        user_id: user.id, credits_remaining: 0, total_credits_purchased: 0,
      });
    }
    const balance = credRow?.credits_remaining ?? 0;
    if (balance < cost) {
      return json({ error: "Insufficient credits", credits_remaining: balance, cost }, 402);
    }

    // 1) Generate scenes via OpenAI chat
    const sceneRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a children's story writer. Output ONLY a JSON array of ${sceneCount} short scene descriptions in ${language}, each 2-3 sentences, warm, magical, safe for kids 4-10. No markdown.` },
          { role: "user", content: `Theme: ${theme}` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!sceneRes.ok) {
      const t = await sceneRes.text();
      console.error("scene gen failed", sceneRes.status, t);
      return json({ error: "Story generation failed" }, 500);
    }
    const sceneJson = await sceneRes.json();
    const raw = sceneJson.choices?.[0]?.message?.content || "{}";
    let scenes: string[] = [];
    try {
      const parsed = JSON.parse(raw);
      scenes = Array.isArray(parsed) ? parsed : (parsed.scenes || parsed.story || []);
      if (!Array.isArray(scenes)) scenes = [];
      scenes = scenes.map((s: any) => typeof s === "string" ? s : (s?.text || s?.scene || "")).filter(Boolean).slice(0, sceneCount);
    } catch {
      scenes = [raw];
    }
    if (scenes.length === 0) return json({ error: "No scenes produced" }, 500);

    // 2) Generate illustrations in parallel
    const imagePromises = scenes.map(async (scene) => {
      const r = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: `Children's storybook illustration. Scene: ${scene}. Soft warm watercolor style, age-appropriate, friendly, no text, no letters, vibrant, full-bleed.`.slice(0, 4000),
          n: 1,
          size: "1024x1024",
          response_format: "b64_json",
        }),
      });
      if (!r.ok) {
        const t = await r.text();
        console.error("image fail", r.status, t.slice(0, 200));
        return "";
      }
      const j = await r.json();
      const b64 = j?.data?.[0]?.b64_json;
      return b64 ? `data:image/png;base64,${b64}` : (j?.data?.[0]?.url || "");
    });

    // 3) Generate TTS in parallel (optional)
    const audioPromises = wantAudio ? scenes.map(async (scene) => {
      const r = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "tts-1",
          voice: "nova",
          input: scene.slice(0, 4000),
          response_format: "mp3",
        }),
      });
      if (!r.ok) {
        console.error("tts fail", r.status);
        return "";
      }
      const buf = new Uint8Array(await r.arrayBuffer());
      // base64 encode
      let bin = "";
      for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
      return `data:audio/mp3;base64,${btoa(bin)}`;
    }) : [];

    const [images, audioFiles] = await Promise.all([
      Promise.all(imagePromises),
      Promise.all(audioPromises),
    ]);

    // Deduct credits
    await admin
      .from("kids_story_credits")
      .update({ credits_remaining: balance - cost, last_used_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return json({
      scenes,
      images,
      audioFiles: wantAudio ? audioFiles : undefined,
      credits_remaining: balance - cost,
      cost,
    });
  } catch (e: any) {
    console.error("generate-story-video error", e);
    return json({ error: e?.message || "Internal error" }, 500);
  }
});
