import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth");

    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { text, voiceId = "EXAVITQu4vr4xnSDxMaL" } = await req.json();
    if (!text || typeof text !== "string") throw new Error("Text required");
    if (text.length > 500) throw new Error("Text too long (max 500 chars)");

    // Generate audio via ElevenLabs
    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.4, use_speaker_boost: true },
        }),
      }
    );
    if (!ttsRes.ok) {
      const err = await ttsRes.text();
      throw new Error(`ElevenLabs error: ${err}`);
    }
    const audioBuffer = await ttsRes.arrayBuffer();

    // Upload to storage
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const path = `${user.id}/voice-intro-${Date.now()}.mp3`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("voice-intros")
      .upload(path, audioBuffer, { contentType: "audio/mpeg", upsert: true });
    if (upErr) throw upErr;

    const { data: pub } = supabaseAdmin.storage.from("voice-intros").getPublicUrl(path);
    const audioUrl = pub.publicUrl;
    const duration = Math.ceil(text.length / 15); // rough estimate

    // Upsert record
    const { error: dbErr } = await supabaseAdmin
      .from("profile_voice_intros")
      .upsert({
        user_id: user.id,
        audio_url: audioUrl,
        transcript: text,
        duration_seconds: duration,
      }, { onConflict: "user_id" });
    if (dbErr) throw dbErr;

    return new Response(JSON.stringify({ audio_url: audioUrl, transcript: text, duration_seconds: duration }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[generate-voice-intro]", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
