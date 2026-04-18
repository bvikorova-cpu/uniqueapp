// Voice cloning / deepfake detector — checks audio for signs of AI synthesis
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const COST = 12;

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

    const { audio_base64, mime } = await req.json();
    if (!audio_base64) return json({ error: "audio_base64 required" }, 400);

    const { data: cr } = await supabase
      .from("lie_detector_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!cr || (cr.credits_remaining ?? 0) < COST)
      return json({ error: "Insufficient credits", required: COST, have: cr?.credits_remaining ?? 0 }, 402);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY not configured" }, 500);

    // upload audio
    const bin = Uint8Array.from(atob(audio_base64), (c) => c.charCodeAt(0));
    const audioBlob = new Blob([bin], { type: mime || "audio/webm" });
    const ext = (mime || "audio/webm").split("/")[1].split(";")[0];
    const path = `${user.id}/deepfake-${crypto.randomUUID()}.${ext}`;
    await supabase.storage.from("lie-detector-evidence").upload(path, audioBlob, { contentType: mime });

    // Whisper for transcript + verbose details
    const fd = new FormData();
    fd.append("file", audioBlob, "audio.webm");
    fd.append("model", "whisper-1");
    fd.append("response_format", "verbose_json");
    const wresp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: fd,
    });
    if (!wresp.ok) return json({ error: "Transcription failed", details: await wresp.text() }, 500);
    const wjson = await wresp.json();
    const transcript = wjson.text || "";
    const segments = wjson.segments || [];

    // Heuristic + AI deepfake judgement
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an AI voice forensics expert. Given a Whisper transcript and segment timings, judge whether the audio is likely AI-generated/cloned. Consider unnatural prosody hints in transcript phrasing, perfectly even segment durations, robotic phrasing, missing breaths/fillers. Strict JSON." },
          { role: "user", content: `Transcript: """${transcript}"""\nSegment count: ${segments.length}\nFirst 5 segment durations(s): ${segments.slice(0,5).map((s:any)=>(s.end-s.start).toFixed(2)).join(", ")}\n\nReturn JSON: is_synthetic (boolean), confidence (0-100), indicators (string[]), human_signals (string[]), analysis (string), recommendation (string).` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) return json({ error: "AI failed", details: await resp.text() }, 500);
    const aj = await resp.json();
    const results = JSON.parse(aj.choices[0].message.content);

    await supabase.from("lie_detector_credits")
      .update({ credits_remaining: (cr.credits_remaining ?? 0) - COST })
      .eq("user_id", user.id);

    const { data: saved } = await supabase.from("lie_deepfake_checks").insert({
      user_id: user.id,
      audio_url: path,
      is_synthetic: results.is_synthetic,
      confidence: results.confidence,
      indicators: results.indicators ?? [],
      analysis: results.analysis,
      credits_used: COST,
    }).select().single();

    return json({ check: saved, results, transcript });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
function json(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
