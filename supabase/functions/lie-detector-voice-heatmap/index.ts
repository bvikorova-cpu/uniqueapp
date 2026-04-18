// Voice Stress Heatmap — Whisper transcribes + GPT segments with stress scores per chunk
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const COST = 10;
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { audio_base64, mime } = await req.json();
    if (!audio_base64 || !mime) return json({ error: "audio_base64 and mime required" }, 400);
    const { data: cr } = await supabase.from("lie_detector_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!cr || (cr.credits_remaining ?? 0) < COST) return json({ error: "Insufficient credits", required: COST, have: cr?.credits_remaining ?? 0 }, 402);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY not configured" }, 500);

    const bin = Uint8Array.from(atob(audio_base64), (c) => c.charCodeAt(0));
    const fd = new FormData();
    fd.append("file", new Blob([bin], { type: mime }), `a.${mime.split("/")[1] || "webm"}`);
    fd.append("model", "whisper-1");
    fd.append("response_format", "verbose_json");
    fd.append("timestamp_granularities[]", "segment");
    const wResp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST", headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }, body: fd,
    });
    if (!wResp.ok) return json({ error: "Whisper failed", details: await wResp.text() }, 500);
    const wj = await wResp.json();
    const transcript = wj.text || "";
    const segs = (wj.segments || []).slice(0, 40).map((s: any) => ({ start: s.start, end: s.end, text: s.text }));

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a voice stress analyst. Score each transcribed segment for stress/deception 0-100 based on linguistic markers and disfluencies." },
          { role: "user", content: `Segments JSON:\n${JSON.stringify(segs)}\n\nReturn JSON: { segments: [{start, end, text, stress_score, color: "green"|"yellow"|"orange"|"red", marker: string}], overall_score: number, summary: string }` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) return json({ error: "AI failed", details: await resp.text() }, 500);
    const aj = await resp.json();
    const results = JSON.parse(aj.choices[0].message.content);

    await supabase.from("lie_voice_heatmaps").insert({
      user_id: user.id, audio_duration_sec: wj.duration || null,
      segments: results.segments || [], transcript, overall_score: results.overall_score, credits_used: COST,
    });
    await supabase.from("lie_detector_credits").update({ credits_remaining: (cr.credits_remaining ?? 0) - COST }).eq("user_id", user.id);
    return json({ ...results, transcript, credits_charged: COST });
  } catch (e) { return json({ error: e instanceof Error ? e.message : "Unknown" }, 500); }
});
function json(b: any, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
