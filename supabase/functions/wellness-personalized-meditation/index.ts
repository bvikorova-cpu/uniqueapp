import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COST = 15;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("No authorization header");
    const { data: { user }, error } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (error || !user) throw new Error("Unauthorized");

    const { topic, duration_minutes = 5, voice_id = "EXAVITQu4vr4xnSDxMaL" } = await req.json();
    if (!topic || topic.length < 3) throw new Error("Topic required (min 3 chars)");

    const { data: credits } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).single();
    const remaining = credits?.credits_remaining || 0;
    if (remaining < COST) throw new Error(`Insufficient credits. Need ${COST}, have ${remaining}.`);

    const { data: row, error: insErr } = await supabase.from("wellness_personalized_meditations").insert({
      user_id: user.id, topic, duration_minutes, voice_id, status: "processing", credits_used: COST,
    }).select().single();
    if (insErr) throw insErr;

    // Generate meditation script
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You are a master meditation teacher. Write a ${duration_minutes}-minute guided meditation script. Use calm, slow language. Include natural pauses written as "..." (3 dots). No SSML tags, no narrator labels, just the spoken words. Speak directly to the listener in second person ("you").` },
          { role: "user", content: `Topic: ${topic}` },
        ],
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) throw new Error("AI rate limit exceeded.");
      if (aiResp.status === 402) throw new Error("AI credits exhausted.");
      throw new Error("Script generation failed");
    }
    const aiData = await aiResp.json();
    const script = aiData.choices?.[0]?.message?.content || "";
    if (!script) throw new Error("No script generated");

    // Generate voiceover via ElevenLabs (optional - if key configured)
    let audioUrl: string | null = null;
    if (ELEVENLABS_API_KEY) {
      try {
        const ttsResp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}?output_format=mp3_44100_128`, {
          method: "POST",
          headers: { "xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({
            text: script.slice(0, 4500),
            model_id: "eleven_turbo_v2_5",
            voice_settings: { stability: 0.7, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true, speed: 0.9 },
          }),
        });
        if (ttsResp.ok) {
          const audioBuf = await ttsResp.arrayBuffer();
          const filePath = `${user.id}/meditation-${row.id}.mp3`;
          const { error: upErr } = await supabase.storage.from("wellness-ai").upload(filePath, audioBuf, { contentType: "audio/mpeg", upsert: true });
          if (!upErr) {
            const { data: pub } = supabase.storage.from("wellness-ai").getPublicUrl(filePath);
            audioUrl = pub.publicUrl;
          }
        } else {
          console.error("ElevenLabs error:", await ttsResp.text());
        }
      } catch (e) {
        console.error("TTS failed:", e);
      }
    }

    await supabase.from("wellness_personalized_meditations").update({
      meditation_script: script, audio_url: audioUrl, status: "completed",
    }).eq("id", row.id);

    await supabase.from("ai_credits").update({ credits_remaining: remaining - COST, last_used_at: new Date().toISOString() }).eq("user_id", user.id);

    return new Response(JSON.stringify({ id: row.id, meditation_script: script, audio_url: audioUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("wellness-personalized-meditation error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
