import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COSTS = { dream: 10, meditation: 15, mood: 8, sleep: 20 } as const;

async function callAI(LOVABLE_API_KEY: string, body: any) {
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text();
    console.error("AI gateway error:", r.status, t);
    if (r.status === 429) throw new Error("AI rate limit exceeded, please try again shortly.");
    if (r.status === 402) throw new Error("AI credits exhausted, please top up.");
    throw new Error("AI request failed");
  }
  return r.json();
}

async function ttsUpload(
  supabase: any,
  ELEVENLABS_API_KEY: string | undefined,
  voice_id: string,
  text: string,
  filePath: string,
  voiceSettings: any
): Promise<string | null> {
  if (!ELEVENLABS_API_KEY) return null;
  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 5000), model_id: "eleven_turbo_v2_5", voice_settings: voiceSettings }),
    });
    if (!r.ok) { console.error("ElevenLabs error:", await r.text()); return null; }
    const buf = await r.arrayBuffer();
    const { error: upErr } = await supabase.storage.from("wellness-ai").upload(filePath, buf, { contentType: "audio/mpeg", upsert: true });
    if (upErr) { console.error("Upload error:", upErr); return null; }
    const { data: pub } = supabase.storage.from("wellness-ai").getPublicUrl(filePath);
    return pub.publicUrl;
  } catch (e) { console.error("TTS failed:", e); return null; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("No authorization header");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (authErr || !user) throw new Error("Unauthorized");

    const body = await req.json();
    const action = body.action as keyof typeof COSTS;
    if (!action || !(action in COSTS)) throw new Error("Invalid action. Use: dream | meditation | mood | sleep");

    const COST = COSTS[action];
    const { data: credits } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).single();
    const remaining = credits?.credits_remaining || 0;
    if (remaining < COST) throw new Error(`Insufficient credits. Need ${COST}, have ${remaining}.`);

    let result: any = {};

    if (action === "dream") {
      const { dream_text } = body;
      if (!dream_text || dream_text.length < 10) throw new Error("Please describe your dream in at least 10 characters.");

      const { data: row, error: insErr } = await supabase.from("wellness_dream_interpretations")
        .insert({ user_id: user.id, dream_text, status: "processing", credits_used: COST }).select().single();
      if (insErr) throw insErr;

      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a compassionate dream analyst combining Jungian psychology, modern neuroscience, and gentle spiritual insight." },
          { role: "user", content: `Interpret this dream: ${dream_text}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "interpret_dream",
            parameters: {
              type: "object",
              properties: {
                interpretation: { type: "string" },
                symbols: { type: "array", items: { type: "object", properties: { symbol: { type: "string" }, meaning: { type: "string" } }, required: ["symbol", "meaning"] } },
                emotional_themes: { type: "array", items: { type: "string" } },
                illustration_prompt: { type: "string" },
              },
              required: ["interpretation", "symbols", "emotional_themes", "illustration_prompt"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "interpret_dream" } },
      });
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      const parsed = toolCall ? JSON.parse(toolCall.function.arguments) : {};

      let illustrationUrl: string | null = null;
      try {
        const imgData = await callAI(LOVABLE_API_KEY, {
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: `Surreal dreamlike illustration: ${parsed.illustration_prompt}. Soft pastel colors, ethereal mist, no text.` }],
          modalities: ["image", "text"],
        });
        illustrationUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
      } catch (e) { console.error("Illustration failed:", e); }

      await supabase.from("wellness_dream_interpretations").update({
        interpretation: parsed.interpretation, symbols: parsed.symbols || [],
        emotional_themes: parsed.emotional_themes || [], illustration_url: illustrationUrl, status: "completed",
      }).eq("id", row.id);

      result = { id: row.id, ...parsed, illustration_url: illustrationUrl };

    } else if (action === "meditation") {
      const { topic, duration_minutes = 5, voice_id = "EXAVITQu4vr4xnSDxMaL" } = body;
      if (!topic || topic.length < 3) throw new Error("Topic required (min 3 chars)");

      const { data: row, error: insErr } = await supabase.from("wellness_personalized_meditations")
        .insert({ user_id: user.id, topic, duration_minutes, voice_id, status: "processing", credits_used: COST }).select().single();
      if (insErr) throw insErr;

      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You are a master meditation teacher. Write a ${duration_minutes}-minute guided meditation script. Use calm language. Include "..." for natural pauses. No SSML, no labels. Speak in second person.` },
          { role: "user", content: `Topic: ${topic}` },
        ],
      });
      const script = aiData.choices?.[0]?.message?.content || "";
      if (!script) throw new Error("No script generated");

      const audioUrl = await ttsUpload(supabase, ELEVENLABS_API_KEY, voice_id, script, `${user.id}/meditation-${row.id}.mp3`,
        { stability: 0.7, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true, speed: 0.9 });

      await supabase.from("wellness_personalized_meditations").update({
        meditation_script: script, audio_url: audioUrl, status: "completed",
      }).eq("id", row.id);

      result = { id: row.id, meditation_script: script, audio_url: audioUrl };

    } else if (action === "mood") {
      const { selfie_data_url } = body;
      if (!selfie_data_url || !selfie_data_url.startsWith("data:image/")) throw new Error("Valid selfie image required");

      let selfieUrl: string | null = null;
      try {
        const matches = selfie_data_url.match(/^data:(image\/\w+);base64,(.+)$/);
        if (matches) {
          const bin = Uint8Array.from(atob(matches[2]), c => c.charCodeAt(0));
          const filePath = `${user.id}/selfie-${Date.now()}.${matches[1].split("/")[1]}`;
          const { error: upErr } = await supabase.storage.from("wellness-ai").upload(filePath, bin, { contentType: matches[1], upsert: true });
          if (!upErr) {
            const { data: pub } = supabase.storage.from("wellness-ai").getPublicUrl(filePath);
            selfieUrl = pub.publicUrl;
          }
        }
      } catch (e) { console.error("Selfie upload failed:", e); }

      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "google/gemini-2.5-flash",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Analyze this person's facial expression and visible signs of stress, fatigue, mood. Be supportive, never diagnostic." },
            { type: "image_url", image_url: { url: selfie_data_url } },
          ],
        }],
        tools: [{
          type: "function",
          function: {
            name: "analyze_mood",
            parameters: {
              type: "object",
              properties: {
                detected_mood: { type: "string" },
                stress_level: { type: "integer", minimum: 0, maximum: 100 },
                fatigue_level: { type: "integer", minimum: 0, maximum: 100 },
                emotion_breakdown: {
                  type: "object",
                  properties: {
                    happiness: { type: "integer" }, calm: { type: "integer" },
                    energy: { type: "integer" }, tension: { type: "integer" },
                  },
                  required: ["happiness", "calm", "energy", "tension"],
                },
                ai_insight: { type: "string" },
                recommendations: {
                  type: "array",
                  items: { type: "object", properties: { tool: { type: "string" }, reason: { type: "string" } }, required: ["tool", "reason"] },
                },
              },
              required: ["detected_mood", "stress_level", "fatigue_level", "emotion_breakdown", "ai_insight", "recommendations"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "analyze_mood" } },
      });
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No analysis returned");
      const parsed = JSON.parse(toolCall.function.arguments);

      const { data: row, error: insErr } = await supabase.from("wellness_mood_mirror").insert({
        user_id: user.id, selfie_url: selfieUrl,
        detected_mood: parsed.detected_mood, stress_level: parsed.stress_level, fatigue_level: parsed.fatigue_level,
        emotion_breakdown: parsed.emotion_breakdown, recommendations: parsed.recommendations,
        ai_insight: parsed.ai_insight, credits_used: COST,
      }).select().single();
      if (insErr) throw insErr;

      result = { id: row.id, ...parsed, selfie_url: selfieUrl };

    } else if (action === "sleep") {
      const { theme, protagonist = "you", setting, duration_minutes = 10, voice_id = "XrExE9yKIg1WjnnlVkGX" } = body;
      if (!theme || theme.length < 3) throw new Error("Theme required");

      const { data: row, error: insErr } = await supabase.from("wellness_ai_sleep_stories").insert({
        user_id: user.id, title: `${theme} — A Sleep Story`,
        theme, protagonist, setting, duration_minutes, voice_id,
        status: "processing", credits_used: COST,
      }).select().single();
      if (insErr) throw insErr;

      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You are a soothing sleep story writer. Write a ~${duration_minutes}-minute calm bedtime story (~${duration_minutes * 130} words). Slow, dreamy, descriptive. No conflict. Use "..." for pauses. End with sleep.` },
          { role: "user", content: `Theme: ${theme}\nProtagonist: ${protagonist}\nSetting: ${setting || "AI's choice"}` },
        ],
      });
      const story = aiData.choices?.[0]?.message?.content || "";
      if (!story) throw new Error("No story generated");
      const title = story.split("\n")[0].replace(/^#\s*/, "").slice(0, 80) || `${theme} — A Sleep Story`;

      const audioUrl = await ttsUpload(supabase, ELEVENLABS_API_KEY, voice_id, story, `${user.id}/sleep-${row.id}.mp3`,
        { stability: 0.85, similarity_boost: 0.7, style: 0.2, use_speaker_boost: true, speed: 0.85 });

      await supabase.from("wellness_ai_sleep_stories").update({
        title, story_text: story, audio_url: audioUrl, status: "completed",
      }).eq("id", row.id);

      result = { id: row.id, title, story_text: story, audio_url: audioUrl };
    }

    // Deduct credits + log
    await supabase.from("ai_credits").update({
      credits_remaining: remaining - COST, last_used_at: new Date().toISOString(),
    }).eq("user_id", user.id);

    await supabase.from("ai_usage_history").insert({
      user_id: user.id, usage_type: `wellness_${action}`, credits_used: COST,
      description: `Wellness AI: ${action}`,
    });

    return new Response(JSON.stringify({ ...result, creditsRemaining: remaining - COST }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("wellness-ai error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
