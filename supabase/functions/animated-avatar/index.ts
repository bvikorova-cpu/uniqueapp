import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const ELEVEN = Deno.env.get("ELEVENLABS_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");
    if (!ELEVEN) throw new Error("ELEVENLABS_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth");

    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { description, text, voiceId = "EXAVITQu4vr4xnSDxMaL" } = await req.json();
    if (!description || !text) throw new Error("description and text required");
    if (text.length > 250) throw new Error("Text too long (max 250 chars)");

    // 1) Pixar-style avatar via Nano banana
    const imgRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        messages: [{
          role: "user",
          content: `Pixar 3D animated character portrait of: ${description}. Friendly expressive face, big eyes, cinematic studio lighting, clean background. NO real person, NO trademark, NO text.`,
        }],
        modalities: ["image", "text"],
      }),
    });
    if (!imgRes.ok) {
      const t = await imgRes.text();
      if (imgRes.status === 429) throw new Error("Rate limit, try again shortly");
      if (imgRes.status === 402) throw new Error("AI credits exhausted");
      throw new Error(`Image AI error: ${t}`);
    }
    const imgData = await imgRes.json();
    const dataUrl: string | undefined = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!dataUrl) throw new Error("No image returned");
    const base64 = dataUrl.split(",")[1];
    const imgBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    // 2) ElevenLabs voiceover for the avatar
    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": ELEVEN, "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.55, use_speaker_boost: true },
        }),
      }
    );
    if (!ttsRes.ok) throw new Error("TTS failed: " + (await ttsRes.text()));
    const audioBuf = await ttsRes.arrayBuffer();

    // 3) Upload both to storage
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const ts = Date.now();
    const imgPath = `${user.id}/avatar-${ts}.png`;
    const audPath = `${user.id}/voice-${ts}.mp3`;
    const { error: e1 } = await admin.storage.from("animated-avatars").upload(imgPath, imgBytes, { contentType: "image/png", upsert: true });
    if (e1) throw e1;
    const { error: e2 } = await admin.storage.from("animated-avatars").upload(audPath, audioBuf, { contentType: "audio/mpeg", upsert: true });
    if (e2) throw e2;

    const { data: imgPub } = admin.storage.from("animated-avatars").getPublicUrl(imgPath);
    const { data: audPub } = admin.storage.from("animated-avatars").getPublicUrl(audPath);

    await admin.from("profiles").update({
      animated_avatar_url: imgPub.publicUrl,
      animated_avatar_audio_url: audPub.publicUrl,
    }).eq("id", user.id);

    return new Response(JSON.stringify({
      image_url: imgPub.publicUrl,
      audio_url: audPub.publicUrl,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[animated-avatar]", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
