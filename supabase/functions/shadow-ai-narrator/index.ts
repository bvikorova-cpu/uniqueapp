import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NARRATOR_COST = 6;
const MAX_CHARS = 2000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!apiKey) throw new Error("ELEVENLABS_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(supabaseUrl, serviceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { text, voiceId = "kPtEHAvRnjUJFv7SK9WI", voiceLabel = "Glitch", storyId = null } = await req.json();
    if (!text || typeof text !== "string") return new Response(JSON.stringify({ error: "Missing text" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (text.length > MAX_CHARS) return new Response(JSON.stringify({ error: `Text too long (max ${MAX_CHARS} chars)` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: credits } = await supabase.from("shadow_arena_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!credits || credits.credits_remaining < NARRATOR_COST) {
      return new Response(JSON.stringify({ error: "Insufficient credits", required: NARRATOR_COST }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Call ElevenLabs TTS
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.6, similarity_boost: 0.8, style: 0.6, use_speaker_boost: true, speed: 0.92 },
      }),
    });

    if (!ttsResponse.ok) {
      const errText = await ttsResponse.text();
      console.error("ElevenLabs error:", ttsResponse.status, errText);
      if (ttsResponse.status === 429) return new Response(JSON.stringify({ error: "ElevenLabs rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("ElevenLabs TTS error");
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioBase64 = base64Encode(new Uint8Array(audioBuffer));

    // Save narration
    const { data: saved } = await supabase.from("shadow_narrations").insert({
      user_id: user.id,
      story_id: storyId,
      story_text: text,
      audio_base64: audioBase64,
      voice_id: voiceId,
      voice_label: voiceLabel,
      credits_used: NARRATOR_COST,
    }).select("id").single();

    // Deduct credits
    await supabase.from("shadow_arena_credits").update({
      credits_remaining: credits.credits_remaining - NARRATOR_COST,
      last_used_at: new Date().toISOString(),
    }).eq("user_id", user.id);

    return new Response(JSON.stringify({
      audioBase64,
      narrationId: saved?.id,
      creditsRemaining: credits.credits_remaining - NARRATOR_COST,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("narrator error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
