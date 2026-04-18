// Voice lie detection — transcribes audio (Whisper) and analyzes for stress/hesitations/deception (gpt-4o-mini)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COST = 15;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: auth } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { audio_base64, audio_path, mime } = await req.json();
    if (!audio_base64 && !audio_path) return json({ error: "audio required" }, 400);

    // credit check
    const { data: cr } = await supabase
      .from("lie_detector_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!cr || (cr.credits_remaining ?? 0) < COST) {
      return json({ error: "Insufficient credits", required: COST, have: cr?.credits_remaining ?? 0 }, 402);
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY not configured" }, 500);

    // Build audio blob from base64
    let audioBlob: Blob;
    let audioUrl: string | null = null;
    if (audio_base64) {
      const bin = Uint8Array.from(atob(audio_base64), (c) => c.charCodeAt(0));
      audioBlob = new Blob([bin], { type: mime || "audio/webm" });
      // upload to storage for record
      const path = `${user.id}/${crypto.randomUUID()}.${(mime || "audio/webm").split("/")[1].split(";")[0]}`;
      const { data: up } = await supabase.storage.from("lie-detector-evidence").upload(path, audioBlob, { contentType: mime });
      if (up) audioUrl = path;
    } else {
      const { data: dl } = await supabase.storage.from("lie-detector-evidence").download(audio_path);
      if (!dl) return json({ error: "audio not found" }, 404);
      audioBlob = dl;
      audioUrl = audio_path;
    }

    // 1) Whisper transcription
    const fd = new FormData();
    fd.append("file", audioBlob, "audio.webm");
    fd.append("model", "whisper-1");
    fd.append("response_format", "verbose_json");
    const wresp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: fd,
    });
    if (!wresp.ok) {
      const t = await wresp.text();
      return json({ error: "Transcription failed", details: t }, 500);
    }
    const wjson = await wresp.json();
    const transcript = wjson.text || "";
    const duration = wjson.duration || 0;

    // 2) GPT analysis with structured output
    const analysisResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a forensic linguistics + voice deception expert. Analyze the transcript and the implicit speech patterns (hesitations, fillers, repetitions, contradictions, hedging). Score 0-100. Output strict JSON.",
          },
          {
            role: "user",
            content: `Audio duration: ${duration}s\nTranscript: """${transcript}"""\n\nReturn JSON with keys: truthfulness_score (0-100), stress_score (0-100), hesitation_score (0-100), confidence_level (low/medium/high), deception_indicators (string[]), micro_pause_signals (string[]), filler_words_count (number), recommended_followup_questions (string[]), summary (string).`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!analysisResp.ok) {
      const t = await analysisResp.text();
      return json({ error: "Analysis failed", details: t }, 500);
    }
    const aj = await analysisResp.json();
    const results = JSON.parse(aj.choices[0].message.content);

    // 3) deduct credits
    await supabase
      .from("lie_detector_credits")
      .update({ credits_remaining: (cr.credits_remaining ?? 0) - COST })
      .eq("user_id", user.id);

    // 4) save analysis
    const { data: saved } = await supabase
      .from("lie_detector_voice_analyses")
      .insert({
        user_id: user.id,
        audio_url: audioUrl,
        transcript,
        duration_sec: duration,
        stress_score: results.stress_score,
        hesitation_score: results.hesitation_score,
        truthfulness_score: results.truthfulness_score,
        results,
        credits_used: COST,
      })
      .select()
      .single();

    return json({ analysis: saved, results, transcript });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
