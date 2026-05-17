// Lie Detector AI Router — consolidates 18 lie-detector-* functions into one
// Routes via { action: "polygraph" | "cross-exam" | "voice" | ... } in body
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (b: any, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const OPENAI = () => Deno.env.get("OPENAI_API_KEY");
const SUPA_URL = () => Deno.env.get("SUPABASE_URL")!;
const SUPA_KEY = () => Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function getUserClient(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth) return { err: json({ error: "Unauthorized" }, 401) };
  const supabase = createClient(SUPA_URL(), SUPA_KEY(), { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { err: json({ error: "Unauthorized" }, 401) };
  return { supabase, user };
}

async function checkCredits(supabase: any, userId: string, cost: number) {
  const { data: cr } = await supabase.from("lie_detector_credits").select("credits_remaining").eq("user_id", userId).maybeSingle();
  if (!cr || (cr.credits_remaining ?? 0) < cost) {
    return { err: json({ error: "Insufficient credits", required: cost, have: cr?.credits_remaining ?? 0 }, 402) };
  }
  return { cr };
}

async function deductCredits(supabase: any, userId: string, cr: any, cost: number) {
  await supabase.from("lie_detector_credits").update({ credits_remaining: (cr.credits_remaining ?? 0) - cost }).eq("user_id", userId);
}

async function callOpenAI(messages: any[], json_mode = true) {
  const key = OPENAI();
  if (!key) return { err: json({ error: "OPENAI_API_KEY not configured" }, 500) };
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      ...(json_mode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!resp.ok) return { err: json({ error: "AI failed", details: await resp.text() }, 500) };
  const aj = await resp.json();
  const content = aj.choices[0].message.content;
  return { result: json_mode ? JSON.parse(content) : content };
}

async function awardXp(supabase: any, uid: string, xp: number) {
  const { data: r } = await supabase.from("lie_detective_ranks").select("xp,total_analyses").eq("user_id", uid).maybeSingle();
  const newXp = (r?.xp ?? 0) + xp;
  const tier = newXp >= 5000 ? "Master Interrogator" : newXp >= 2000 ? "Senior Detective" : newXp >= 500 ? "Detective" : newXp >= 100 ? "Investigator" : "Rookie";
  if (r) await supabase.from("lie_detective_ranks").update({ xp: newXp, rank_tier: tier, total_analyses: (r.total_analyses ?? 0) + 1 }).eq("user_id", uid);
  else await supabase.from("lie_detective_ranks").insert({ user_id: uid, xp: newXp, rank_tier: tier, total_analyses: 1 });
}

function chunks<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

// ============ ACTION HANDLERS ============

async function actionPolygraph(supabase: any, user: any, body: any) {
  const COST = 2;
  const { text } = body;
  if (!text || typeof text !== "string" || text.length < 10) return json({ error: "text required (min 10 chars)" }, 400);
  const cc = await checkCredits(supabase, user.id, COST); if (cc.err) return cc.err;
  const ai = await callOpenAI([
    { role: "system", content: "You are a polygraph signal generator. Break the text into 12-20 sentence-level chunks and assign each a stress reading (0-100) based on linguistic deception markers. Return JSON only." },
    { role: "user", content: `Text:\n"""${text}"""\n\nReturn JSON: { stress_curve: [{t:number, stress:number, snippet:string}], peak_moments: [{t:number, reason:string}], overall_stress: number, truthfulness_score: number, summary: string }` },
  ]);
  if (ai.err) return ai.err;
  const r = ai.result;
  await supabase.from("lie_polygraph_sessions").insert({
    user_id: user.id, source_text: text.slice(0, 4000),
    stress_curve: r.stress_curve || [], peak_moments: r.peak_moments || [],
    overall_stress: r.overall_stress, truthfulness_score: r.truthfulness_score, credits_used: COST,
  });
  await deductCredits(supabase, user.id, cc.cr, COST);
  await awardXp(supabase, user.id, 5);
  return json({ ...r, credits_charged: COST });
}

async function actionCrossExam(supabase: any, user: any, body: any) {
  const COST = 8;
  const { subject_text, qa_thread } = body;
  const action = body.sub_action ?? body.subAction ?? body.op ?? "question";
  if (!subject_text || typeof subject_text !== "string") return json({ error: "subject_text required" }, 400);
  const cc = await checkCredits(supabase, user.id, COST); if (cc.err) return cc.err;
  const thread = Array.isArray(qa_thread) ? qa_thread : [];
  const threadStr = thread.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
  const sys = action === "verdict"
    ? "You are a prosecutor delivering the final verdict after cross-examination."
    : "You are a sharp prosecutor cross-examining a witness. Ask one piercing follow-up question that exposes contradictions or evasion. Be tough but fair.";
  const userMsg = action === "verdict"
    ? `Subject statement:\n"""${subject_text}"""\n\nFull cross-examination Q&A:\n${threadStr}\n\nReturn JSON: { contradictions: [{quote:string, conflict:string}], verdict: string, credibility_score: number, key_lies: string[], summary: string }`
    : `Subject's statement:\n"""${subject_text}"""\n\nPrior Q&A:\n${threadStr || "(none yet)"}\n\nReturn JSON: { question: string, target_contradiction: string, intensity: "low"|"medium"|"high" }`;
  const ai = await callOpenAI([{ role: "system", content: sys }, { role: "user", content: userMsg }]);
  if (ai.err) return ai.err;
  const r = ai.result;
  if (action === "verdict") {
    await supabase.from("lie_cross_examinations").insert({
      user_id: user.id, subject_text: subject_text.slice(0, 4000),
      qa_thread: thread, contradictions: r.contradictions || [],
      verdict: r.verdict, credits_used: COST,
    });
    await deductCredits(supabase, user.id, cc.cr, COST);
  }
  return json({ ...r, credits_charged: action === "verdict" ? COST : 0 });
}

async function actionVoice(supabase: any, user: any, body: any) {
  const COST = 15;
  const { audio_base64, audio_path, mime } = body;
  if (!audio_base64 && !audio_path) return json({ error: "audio required" }, 400);
  const cc = await checkCredits(supabase, user.id, COST); if (cc.err) return cc.err;
  const key = OPENAI(); if (!key) return json({ error: "OPENAI_API_KEY not configured" }, 500);

  let audioBlob: Blob;
  let audioUrl: string | null = null;
  if (audio_base64) {
    const bin = Uint8Array.from(atob(audio_base64), (c) => c.charCodeAt(0));
    audioBlob = new Blob([bin], { type: mime || "audio/webm" });
    const path = `${user.id}/${crypto.randomUUID()}.${(mime || "audio/webm").split("/")[1].split(";")[0]}`;
    const { data: up } = await supabase.storage.from("lie-detector-evidence").upload(path, audioBlob, { contentType: mime });
    if (up) audioUrl = path;
  } else {
    const { data: dl } = await supabase.storage.from("lie-detector-evidence").download(audio_path);
    if (!dl) return json({ error: "audio not found" }, 404);
    audioBlob = dl; audioUrl = audio_path;
  }

  const fd = new FormData();
  fd.append("file", audioBlob, "audio.webm");
  fd.append("model", "whisper-1");
  fd.append("response_format", "verbose_json");
  const wresp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST", headers: { Authorization: `Bearer ${key}` }, body: fd,
  });
  if (!wresp.ok) return json({ error: "Transcription failed", details: await wresp.text() }, 500);
  const wjson = await wresp.json();
  const transcript = wjson.text || "";
  const duration = wjson.duration || 0;

  const ai = await callOpenAI([
    { role: "system", content: "You are a forensic linguistics + voice deception expert. Analyze the transcript and the implicit speech patterns (hesitations, fillers, repetitions, contradictions, hedging). Score 0-100. Output strict JSON." },
    { role: "user", content: `Audio duration: ${duration}s\nTranscript: """${transcript}"""\n\nReturn JSON with keys: truthfulness_score (0-100), stress_score (0-100), hesitation_score (0-100), confidence_level (low/medium/high), deception_indicators (string[]), micro_pause_signals (string[]), filler_words_count (number), recommended_followup_questions (string[]), summary (string).` },
  ]);
  if (ai.err) return ai.err;
  const results = ai.result;

  await deductCredits(supabase, user.id, cc.cr, COST);
  const { data: saved } = await supabase.from("lie_detector_voice_analyses").insert({
    user_id: user.id, audio_url: audioUrl, transcript, duration_sec: duration,
    stress_score: results.stress_score, hesitation_score: results.hesitation_score,
    truthfulness_score: results.truthfulness_score, results, credits_used: COST,
  }).select().single();

  return json({ analysis: saved, results, transcript });
}

async function actionVoiceHeatmap(supabase: any, user: any, body: any) {
  const COST = 10;
  const { audio_base64, mime } = body;
  if (!audio_base64 || !mime) return json({ error: "audio_base64 and mime required" }, 400);
  const cc = await checkCredits(supabase, user.id, COST); if (cc.err) return cc.err;
  const key = OPENAI(); if (!key) return json({ error: "OPENAI_API_KEY not configured" }, 500);

  const bin = Uint8Array.from(atob(audio_base64), (c) => c.charCodeAt(0));
  const fd = new FormData();
  fd.append("file", new Blob([bin], { type: mime }), `a.${mime.split("/")[1] || "webm"}`);
  fd.append("model", "whisper-1");
  fd.append("response_format", "verbose_json");
  fd.append("timestamp_granularities[]", "segment");
  const wResp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST", headers: { Authorization: `Bearer ${key}` }, body: fd,
  });
  if (!wResp.ok) return json({ error: "Whisper failed", details: await wResp.text() }, 500);
  const wj = await wResp.json();
  const transcript = wj.text || "";
  const segs = (wj.segments || []).slice(0, 40).map((s: any) => ({ start: s.start, end: s.end, text: s.text }));

  const ai = await callOpenAI([
    { role: "system", content: "You are a voice stress analyst. Score each transcribed segment for stress/deception 0-100 based on linguistic markers and disfluencies." },
    { role: "user", content: `Segments JSON:\n${JSON.stringify(segs)}\n\nReturn JSON: { segments: [{start, end, text, stress_score, color: "green"|"yellow"|"orange"|"red", marker: string}], overall_score: number, summary: string }` },
  ]);
  if (ai.err) return ai.err;
  const r = ai.result;
  await supabase.from("lie_voice_heatmaps").insert({
    user_id: user.id, audio_duration_sec: wj.duration || null,
    segments: r.segments || [], transcript, overall_score: r.overall_score, credits_used: COST,
  });
  await deductCredits(supabase, user.id, cc.cr, COST);
  return json({ ...r, transcript, credits_charged: COST });
}

async function actionBodyLanguage(supabase: any, user: any, body: any) {
  const COST = 25;
  const { frames_base64, mime, context } = body;
  if (!Array.isArray(frames_base64) || frames_base64.length < 2) return json({ error: "frames_base64 array (min 2 keyframes) required" }, 400);
  if (frames_base64.length > 8) return json({ error: "max 8 keyframes" }, 400);
  const cc = await checkCredits(supabase, user.id, COST); if (cc.err) return cc.err;
  const key = OPENAI(); if (!key) return json({ error: "OPENAI_API_KEY not configured" }, 500);

  const imageMessages = frames_base64.map((b64: string) => ({
    type: "image_url",
    image_url: { url: `data:${mime || "image/jpeg"};base64,${b64}`, detail: "low" },
  }));
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a body-language and micro-expression analyst. Inspect the frames for facial tension, blink anomalies, gaze aversion, lip compression, asymmetric expressions, posture shifts. Be careful and never claim certainty." },
        { role: "user", content: [
          { type: "text", text: `Analyze ${frames_base64.length} frames. Context: ${context || "none"}.\n\nReturn JSON: { micro_expressions: [{frame:number, expression:string, indicates:string}], blink_rate: "low"|"normal"|"elevated", gaze_pattern: string, deception_indicators: string[], congruence_notes: string, overall_score: number, summary: string }` },
          ...imageMessages,
        ]},
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!resp.ok) return json({ error: "AI failed", details: await resp.text() }, 500);
  const aj = await resp.json();
  const r = JSON.parse(aj.choices[0].message.content);
  await supabase.from("lie_body_language_scans").insert({
    user_id: user.id,
    micro_expressions: r.micro_expressions || [],
    blink_rate: r.blink_rate === "elevated" ? 25 : r.blink_rate === "low" ? 8 : 17,
    gaze_pattern: r.gaze_pattern, deception_indicators: r.deception_indicators || [],
    overall_score: r.overall_score, credits_used: COST,
  });
  await deductCredits(supabase, user.id, cc.cr, COST);
  return json({ ...r, credits_charged: COST });
}

async function actionComparison(supabase: any, user: any, body: any) {
  const COST = 6;
  const { source_a, source_b, title } = body;
  if (!source_a || !source_b) return json({ error: "source_a and source_b required" }, 400);
  const cc = await checkCredits(supabase, user.id, COST); if (cc.err) return cc.err;
  const ai = await callOpenAI([
    { role: "system", content: "You compare two statements/stories side-by-side. Find every contradiction, omission, embellishment, and tonal shift. Score each for credibility independently." },
    { role: "user", content: `STATEMENT A:\n"""${source_a}"""\n\nSTATEMENT B:\n"""${source_b}"""\n\nReturn JSON: { score_a:number, score_b:number, diff_findings:[{topic:string, in_a:string, in_b:string, conflict_type:"contradiction"|"omission"|"embellishment"|"tone_shift", severity:"low"|"medium"|"high"}], more_credible:"A"|"B"|"tie", verdict:string, summary:string }` },
  ]);
  if (ai.err) return ai.err;
  const r = ai.result;
  await supabase.from("lie_comparisons").insert({
    user_id: user.id, title: title || "Comparison",
    source_a: source_a.slice(0, 4000), source_b: source_b.slice(0, 4000),
    diff_findings: r.diff_findings || [], verdict: r.verdict, credits_used: COST,
  });
  await deductCredits(supabase, user.id, cc.cr, COST);
  return json({ ...r, credits_charged: COST });
}

async function actionBulk(supabase: any, user: any, body: any) {
  const { items, job_type } = body;
  if (!Array.isArray(items) || items.length < 1) return json({ error: "items array required" }, 400);
  if (items.length > 200) return json({ error: "max 200 items per batch" }, 400);
  const COST = Math.max(items.length, 1);
  const cc = await checkCredits(supabase, user.id, COST); if (cc.err) return cc.err;
  const key = OPENAI(); if (!key) return json({ error: "OPENAI_API_KEY not configured" }, 500);

  const { data: job } = await supabase.from("lie_bulk_jobs").insert({
    user_id: user.id, job_type: job_type || "messages", total_items: items.length, status: "processing", credits_used: COST,
  }).select().single();

  const batched = chunks(items, 20);
  const allResults: any[] = [];
  for (const batch of batched) {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You score multiple messages for truthfulness. Output JSON only." },
          { role: "user", content: `Messages:\n${batch.map((m: string, i: number) => `[${i}] ${String(m).slice(0,500)}`).join("\n")}\n\nReturn JSON: { results: [{index:number, truthfulness:number, red_flags:string[], summary:string}] }` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (resp.ok) {
      const aj = await resp.json();
      const parsed = JSON.parse(aj.choices[0].message.content);
      allResults.push(...(parsed.results || []));
    }
  }
  await supabase.from("lie_bulk_jobs").update({ status: "completed", results: allResults, completed_at: new Date().toISOString() }).eq("id", job.id);
  await deductCredits(supabase, user.id, cc.cr, COST);
  return json({ job_id: job.id, results: allResults, credits_charged: COST });
}

async function actionApiKeys(supabase: any, user: any, body: any) {
  const sub = body.sub_action ?? body.subAction ?? body.op;
  const { label, key_id } = body;
  if (sub === "create") {
    const apiKey = `lk_${crypto.randomUUID().replace(/-/g, "")}`;
    const { data } = await supabase.from("lie_api_keys").insert({ user_id: user.id, label: label || "Untitled", api_key: apiKey }).select().single();
    return json({ key: data });
  }
  if (sub === "revoke") {
    await supabase.from("lie_api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", key_id).eq("user_id", user.id);
    return json({ ok: true });
  }
  return json({ error: "invalid sub_action (expected create|revoke)" }, 400);
}

async function actionMonitor(supabase: any, user: any, body: any) {
  const sub = body.sub_action ?? body.subAction ?? body.op;
  const { job_id, target_url, target_type, frequency, title } = body;
  if (sub === "create") {
    const { data } = await supabase.from("lie_monitoring_jobs").insert({
      user_id: user.id, title: title || "Monitor", target_url, target_type: target_type || "url",
      frequency: frequency || "daily", is_active: true,
    }).select().single();
    return json({ job: data });
  }
  if (sub === "toggle") {
    const { data: cur } = await supabase.from("lie_monitoring_jobs").select("is_active").eq("id", job_id).eq("user_id", user.id).maybeSingle();
    await supabase.from("lie_monitoring_jobs").update({ is_active: !cur?.is_active }).eq("id", job_id);
    return json({ ok: true });
  }
  if (sub === "delete") {
    await supabase.from("lie_monitoring_jobs").delete().eq("id", job_id).eq("user_id", user.id);
    return json({ ok: true });
  }
  return json({ error: "invalid sub_action (expected create|toggle|delete)" }, 400);
}

async function actionSocialCard(supabase: any, user: any, body: any) {
  const { quote, truth_score, source_type, source_id } = body;
  if (!quote) return json({ error: "quote required" }, 400);
  const { data } = await supabase.from("lie_social_cards").insert({
    user_id: user.id, quote: quote.slice(0, 500),
    truth_score: truth_score ?? null, source_type: source_type || "manual", source_id: source_id || null,
  }).select().single();
  return json({ card: data });
}

async function actionReport(supabase: any, user: any, body: any) {
  const COST = 5;
  const { source_type, source_id, payload, title } = body;
  if (!source_type || !payload) return json({ error: "source_type and payload required" }, 400);
  const cc = await checkCredits(supabase, user.id, COST); if (cc.err) return cc.err;
  const ai = await callOpenAI([
    { role: "system", content: "You produce a one-page truth report in JSON. Be concise, professional, evidence-based." },
    { role: "user", content: `Source: ${source_type}\nData: ${JSON.stringify(payload).slice(0, 6000)}\n\nReturn JSON: { headline:string, executive_summary:string, key_findings:string[], red_flags:string[], green_flags:string[], confidence_band:"low"|"medium"|"high", final_score:number, watermark_text:string }` },
  ]);
  if (ai.err) return ai.err;
  const r = ai.result;
  const { data: rep } = await supabase.from("lie_truth_reports").insert({
    user_id: user.id, title: title || r.headline || "Truth Report",
    source_type, source_id: source_id || null, report_data: r, credits_used: COST,
  }).select().single();
  await deductCredits(supabase, user.id, cc.cr, COST);
  return json({ report: rep, ...r, credits_charged: COST });
}

async function actionScreenshot(supabase: any, user: any, body: any) {
  const COST = 8;
  const { image_base64, mime } = body;
  if (!image_base64) return json({ error: "image_base64 required" }, 400);
  const cc = await checkCredits(supabase, user.id, COST); if (cc.err) return cc.err;
  const key = OPENAI(); if (!key) return json({ error: "OPENAI_API_KEY not configured" }, 500);

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{
        role: "user", content: [
          { type: "text", text: "Forensic screenshot analysis. Detect signs of editing, splicing, font inconsistencies, timestamp issues, manipulation. Return JSON: { is_authentic:boolean, confidence:number, manipulation_signals:string[], extracted_text:string, summary:string }" },
          { type: "image_url", image_url: { url: `data:${mime || "image/png"};base64,${image_base64}`, detail: "high" } },
        ],
      }],
      response_format: { type: "json_object" },
    }),
  });
  if (!resp.ok) return json({ error: "AI failed", details: await resp.text() }, 500);
  const aj = await resp.json();
  const r = JSON.parse(aj.choices[0].message.content);
  await supabase.from("lie_detector_screenshot_analyses").insert({
    user_id: user.id, is_authentic: r.is_authentic, confidence: r.confidence,
    manipulation_signals: r.manipulation_signals || [], extracted_text: r.extracted_text, summary: r.summary, credits_used: COST,
  });
  await deductCredits(supabase, user.id, cc.cr, COST);
  return json({ ...r, credits_charged: COST });
}

async function actionTimeline(supabase: any, user: any, body: any) {
  const COST = 6;
  const { messages, title } = body;
  if (!Array.isArray(messages) || messages.length < 2) return json({ error: "messages (min 2) required" }, 400);
  const cc = await checkCredits(supabase, user.id, COST); if (cc.err) return cc.err;
  const ai = await callOpenAI([
    { role: "system", content: "You build a credibility timeline from a conversation thread. Score each message and find inconsistencies between them." },
    { role: "user", content: `Messages:\n${messages.map((m: string, i: number) => `[${i}] ${String(m).slice(0,400)}`).join("\n")}\n\nReturn JSON: { timeline:[{idx:number, score:number, flag:string|null, summary:string}], shifts:[{from:number, to:number, reason:string}], overall_credibility:number, summary:string }` },
  ]);
  if (ai.err) return ai.err;
  const r = ai.result;
  const { data: t } = await supabase.from("lie_detector_timelines").insert({
    user_id: user.id, title: title || "Timeline",
    messages, timeline_data: r, overall_credibility: r.overall_credibility, credits_used: COST,
  }).select().single();
  await deductCredits(supabase, user.id, cc.cr, COST);
  return json({ timeline: t, ...r, credits_charged: COST });
}

async function actionCoach(supabase: any, user: any, body: any) {
  const COST = 4;
  const { transcript, scenario } = body;
  if (!transcript) return json({ error: "transcript required" }, 400);
  const cc = await checkCredits(supabase, user.id, COST); if (cc.err) return cc.err;
  const ai = await callOpenAI([
    { role: "system", content: "You are a confidence-and-credibility coach. Identify weak phrases, hedges, suggest improvements." },
    { role: "user", content: `Scenario: ${scenario || "general"}\nTranscript:\n"""${transcript}"""\n\nReturn JSON: { weak_phrases:string[], rewrites:[{from:string, to:string}], confidence_tips:string[], score:number, summary:string }` },
  ]);
  if (ai.err) return ai.err;
  await deductCredits(supabase, user.id, cc.cr, COST);
  return json({ ...ai.result, credits_charged: COST });
}

async function actionDeepfake(supabase: any, user: any, body: any) {
  const COST = 12;
  const { image_base64, mime } = body;
  if (!image_base64) return json({ error: "image_base64 required" }, 400);
  const cc = await checkCredits(supabase, user.id, COST); if (cc.err) return cc.err;
  const key = OPENAI(); if (!key) return json({ error: "OPENAI_API_KEY not configured" }, 500);

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{
        role: "user", content: [
          { type: "text", text: "Deepfake detection. Analyze face for AI-generation artifacts: eye asymmetry, ear/teeth distortion, hair edges, lighting mismatch, skin texture. Return JSON: { likely_ai:boolean, confidence:number, artifacts:string[], verdict:string }" },
          { type: "image_url", image_url: { url: `data:${mime || "image/jpeg"};base64,${image_base64}`, detail: "high" } },
        ],
      }],
      response_format: { type: "json_object" },
    }),
  });
  if (!resp.ok) return json({ error: "AI failed", details: await resp.text() }, 500);
  const aj = await resp.json();
  const r = JSON.parse(aj.choices[0].message.content);
  await supabase.from("lie_deepfake_scans").insert({
    user_id: user.id, likely_ai: r.likely_ai, confidence: r.confidence,
    artifacts: r.artifacts || [], verdict: r.verdict, credits_used: COST,
  });
  await deductCredits(supabase, user.id, cc.cr, COST);
  return json({ ...r, credits_charged: COST });
}

async function actionMultiPerson(supabase: any, user: any, body: any) {
  const COST = 10;
  const { statements } = body;
  if (!Array.isArray(statements) || statements.length < 2) return json({ error: "statements (min 2) required" }, 400);
  const cc = await checkCredits(supabase, user.id, COST); if (cc.err) return cc.err;
  const ai = await callOpenAI([
    { role: "system", content: "You analyze multiple witness statements about the same event. Find contradictions across people." },
    { role: "user", content: `Statements:\n${statements.map((s: any, i: number) => `[${s.name || `Witness ${i}`}]: ${String(s.text || s).slice(0,800)}`).join("\n\n")}\n\nReturn JSON: { per_person:[{name:string, score:number, key_claims:string[]}], cross_contradictions:[{topic:string, conflicting:[{name:string, claim:string}]}], most_credible:string, summary:string }` },
  ]);
  if (ai.err) return ai.err;
  await deductCredits(supabase, user.id, cc.cr, COST);
  return json({ ...ai.result, credits_charged: COST });
}

async function actionDailyChallenge(supabase: any, user: any, body: any) {
  // Router uses `action` for top-level dispatch; sub-action arrives as `sub_action`.
  const sub = body.sub_action ?? body.subAction ?? body.op ?? "get";
  const { answer, challenge_id } = body;
  if (sub === "get") {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase.from("lie_daily_challenges").select("*").eq("challenge_date", today).maybeSingle();
    if (data) return json({ challenge: data });
    const ai = await callOpenAI([
      { role: "system", content: "Generate today's lie-detection puzzle: a short statement with hidden deception markers. Output JSON only." },
      { role: "user", content: `Return JSON: { statement:string, correct_verdict:"truth"|"lie", explanation:string, difficulty:"easy"|"medium"|"hard" }` },
    ]);
    if (ai.err) return ai.err;
    const r = ai.result;
    const { data: ins } = await supabase.from("lie_daily_challenges").insert({
      challenge_date: today, statement: r.statement, correct_verdict: r.correct_verdict,
      explanation: r.explanation, difficulty: r.difficulty,
    }).select().single();
    return json({ challenge: ins });
  }
  if (sub === "submit") {
    const { data: ch } = await supabase.from("lie_daily_challenges").select("*").eq("id", challenge_id).maybeSingle();
    if (!ch) return json({ error: "challenge not found" }, 404);
    const correct = ch.correct_verdict === answer;
    await supabase.from("lie_challenge_attempts").insert({
      user_id: user.id, challenge_id, answer, is_correct: correct,
    });
    if (correct) await awardXp(supabase, user.id, 10);
    return json({ correct, correct_verdict: ch.correct_verdict, explanation: ch.explanation });
  }
  return json({ error: "invalid action" }, 400);
}

async function actionVerifyReport(supabase: any, user: any, body: any) {
  const { report_id } = body;
  if (!report_id) return json({ error: "report_id required" }, 400);
  const { data: rep } = await supabase.from("lie_truth_reports").select("*").eq("id", report_id).maybeSingle();
  if (!rep) return json({ valid: false, error: "Report not found" }, 404);
  return json({
    valid: true, report_id: rep.id, title: rep.title,
    issued_at: rep.created_at, source_type: rep.source_type,
    watermark: (rep.report_data as any)?.watermark_text || "VERIFIED",
  });
}

// ============ PARITY PACK (6 credits each AI) ============
const PARITY_COST = 6;

async function actionChatImport(supabase: any, user: any, body: any) {
  const { raw_text, source_app } = body;
  if (!raw_text || typeof raw_text !== "string" || raw_text.length < 30) return json({ error: "raw_text required (min 30 chars)" }, 400);
  const cc = await checkCredits(supabase, user.id, PARITY_COST); if (cc.err) return cc.err;
  const truncated = String(raw_text).slice(0, 12000);
  const msgCount = (truncated.match(/\n/g) || []).length + 1;
  const ai = await callOpenAI([
    { role: "system", content: "You are a forensic linguist analyzing exported chat history (WhatsApp/iMessage/Telegram). Detect deception patterns across the whole conversation." },
    { role: "user", content: `App: ${source_app || "whatsapp"}\nTranscript:\n"""${truncated}"""\n\nReturn JSON: { overall_score:number, deception_clusters:[{lines:string, reason:string, severity:"low"|"medium"|"high"}], suspicious_participants:string[], red_flag_phrases:string[], summary:string, recommended_actions:string[] }` },
  ]);
  if (ai.err) return ai.err;
  const r = ai.result;
  await supabase.from("lie_chat_imports").insert({
    user_id: user.id, source_app: source_app || "whatsapp", raw_text: truncated,
    message_count: msgCount, analysis: r, overall_score: r.overall_score, credits_used: PARITY_COST,
  });
  await deductCredits(supabase, user.id, cc.cr, PARITY_COST);
  await awardXp(supabase, user.id, 5);
  return json({ ...r, credits_charged: PARITY_COST });
}

async function actionEmailScan(supabase: any, user: any, body: any) {
  const { subject, sender, body: emailBody } = body;
  if (!emailBody || typeof emailBody !== "string" || emailBody.length < 20) return json({ error: "body required" }, 400);
  const cc = await checkCredits(supabase, user.id, PARITY_COST); if (cc.err) return cc.err;
  const ai = await callOpenAI([
    { role: "system", content: "You are a phishing/social-engineering and deception analyst for email messages." },
    { role: "user", content: `From: ${sender || "unknown"}\nSubject: ${subject || "n/a"}\nBody:\n"""${String(emailBody).slice(0,6000)}"""\n\nReturn JSON: { truthfulness_score:number, phishing_risk:"low"|"medium"|"high", urgency_pressure_tactics:string[], deception_markers:string[], grammar_anomalies:string[], suspicious_links_or_asks:string[], recommended_response:string, summary:string }` },
  ]);
  if (ai.err) return ai.err;
  const r = ai.result;
  await supabase.from("lie_email_scans").insert({
    user_id: user.id, subject, sender, body: String(emailBody).slice(0,6000),
    analysis: r, truthfulness_score: r.truthfulness_score, credits_used: PARITY_COST,
  });
  await deductCredits(supabase, user.id, cc.cr, PARITY_COST);
  return json({ ...r, credits_charged: PARITY_COST });
}

async function actionSentimentTimeline(supabase: any, user: any, body: any) {
  const { messages, title } = body;
  if (!Array.isArray(messages) || messages.length < 3) return json({ error: "messages (min 3) required" }, 400);
  const cc = await checkCredits(supabase, user.id, PARITY_COST); if (cc.err) return cc.err;
  const ai = await callOpenAI([
    { role: "system", content: "Plot emotional arc of a conversation. For each message rate sentiment (-100..100), trust (0..100), tension (0..100)." },
    { role: "user", content: `Messages:\n${messages.map((m: string, i: number) => `[${i}] ${String(m).slice(0,300)}`).join("\n")}\n\nReturn JSON: { points:[{idx:number, sentiment:number, trust:number, tension:number, label:string}], turning_points:[{idx:number, reason:string}], summary:string }` },
  ]);
  if (ai.err) return ai.err;
  const r = ai.result;
  await supabase.from("lie_sentiment_timelines_v2").insert({
    user_id: user.id, title: title || "Sentiment Timeline",
    points: r.points || [], summary: r.summary, credits_used: PARITY_COST,
  });
  await deductCredits(supabase, user.id, cc.cr, PARITY_COST);
  return json({ ...r, credits_charged: PARITY_COST });
}

async function actionWatchlist(supabase: any, user: any, body: any) {
  const op = body.sub_action || body.op || "list";
  if (op === "list") {
    const { data } = await supabase.from("lie_watchlist_triggers").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    return json({ items: data || [] });
  }
  if (op === "create") {
    const { label, keywords, notify } = body;
    if (!label || !Array.isArray(keywords) || !keywords.length) return json({ error: "label & keywords required" }, 400);
    const { data } = await supabase.from("lie_watchlist_triggers").insert({
      user_id: user.id, label, keywords: keywords.map((k: string) => String(k).toLowerCase()).slice(0, 50), notify: notify !== false,
    }).select().single();
    return json({ item: data });
  }
  if (op === "delete") {
    const { id } = body;
    if (!id) return json({ error: "id required" }, 400);
    await supabase.from("lie_watchlist_triggers").delete().eq("id", id).eq("user_id", user.id);
    return json({ ok: true });
  }
  if (op === "scan") {
    const { text } = body;
    if (!text) return json({ error: "text required" }, 400);
    const { data: triggers } = await supabase.from("lie_watchlist_triggers").select("*").eq("user_id", user.id);
    const lower = String(text).toLowerCase();
    const hits: any[] = [];
    for (const t of triggers || []) {
      for (const kw of (t.keywords || [])) {
        if (lower.includes(String(kw).toLowerCase())) {
          hits.push({ trigger_id: t.id, label: t.label, keyword: kw });
        }
      }
    }
    return json({ hits, total: hits.length });
  }
  return json({ error: "invalid op" }, 400);
}

async function actionRedFlagLookup(supabase: any, user: any, body: any) {
  const { phrase } = body;
  if (!phrase || typeof phrase !== "string") return json({ error: "phrase required" }, 400);
  const cc = await checkCredits(supabase, user.id, PARITY_COST); if (cc.err) return cc.err;
  const ai = await callOpenAI([
    { role: "system", content: "You explain manipulative or evasive phrases used in deceptive conversations. Be educational, neutral, evidence-based." },
    { role: "user", content: `Phrase: "${String(phrase).slice(0,300)}"\n\nReturn JSON: { category:string, manipulation_type:string, why_red_flag:string, typical_intent:string, healthier_alternatives:string[], severity:"low"|"medium"|"high" }` },
  ]);
  if (ai.err) return ai.err;
  const r = ai.result;
  await supabase.from("lie_red_flag_lookups").insert({
    user_id: user.id, phrase: String(phrase).slice(0,300), analysis: r, credits_used: PARITY_COST,
  });
  await deductCredits(supabase, user.id, cc.cr, PARITY_COST);
  return json({ ...r, credits_charged: PARITY_COST });
}

async function actionTruthChat(supabase: any, user: any, body: any) {
  const { session_id, message, context } = body;
  if (!message || typeof message !== "string") return json({ error: "message required" }, 400);
  const cc = await checkCredits(supabase, user.id, PARITY_COST); if (cc.err) return cc.err;

  let session: any = null;
  if (session_id) {
    const { data } = await supabase.from("lie_truth_chat_sessions").select("*").eq("id", session_id).eq("user_id", user.id).maybeSingle();
    session = data;
  }
  const history = (session?.messages || []) as any[];
  const aiMessages = [
    { role: "system", content: "You are Detective Vox, a forensic AI consultant. Help the user investigate suspicious conversations, statements, or behaviors. Be sharp, evidence-based, and never claim absolute certainty. Use markdown formatting." },
    ...(context ? [{ role: "system", content: `Context from user:\n${String(context).slice(0,3000)}` }] : []),
    ...history.map((m: any) => ({ role: m.role, content: m.content })),
    { role: "user", content: String(message).slice(0, 4000) },
  ];
  const ai = await callOpenAI(aiMessages, false);
  if (ai.err) return ai.err;
  const reply = ai.result as string;

  const newMessages = [
    ...history,
    { role: "user", content: String(message).slice(0, 4000), at: new Date().toISOString() },
    { role: "assistant", content: reply, at: new Date().toISOString() },
  ];

  let saved: any;
  if (session) {
    const { data } = await supabase.from("lie_truth_chat_sessions")
      .update({ messages: newMessages, last_message_at: new Date().toISOString(), credits_used: (session.credits_used || 0) + PARITY_COST })
      .eq("id", session.id).select().single();
    saved = data;
  } else {
    const { data } = await supabase.from("lie_truth_chat_sessions").insert({
      user_id: user.id, title: String(message).slice(0, 60), messages: newMessages, credits_used: PARITY_COST,
    }).select().single();
    saved = data;
  }
  await deductCredits(supabase, user.id, cc.cr, PARITY_COST);
  return json({ session: saved, reply, credits_charged: PARITY_COST });
}

async function actionTrustScore(supabase: any, user: any, body: any) {
  const op = body.sub_action || body.op || "list";
  if (op === "list") {
    const { data } = await supabase.from("lie_trust_scores").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
    return json({ items: data || [] });
  }
  if (op === "delete") {
    const { id } = body;
    if (!id) return json({ error: "id required" }, 400);
    await supabase.from("lie_trust_scores").delete().eq("id", id).eq("user_id", user.id);
    return json({ ok: true });
  }
  if (op === "score") {
    const { contact_name, sample_text } = body;
    if (!contact_name || !sample_text) return json({ error: "contact_name and sample_text required" }, 400);
    const cc = await checkCredits(supabase, user.id, PARITY_COST); if (cc.err) return cc.err;
    const { data: existing } = await supabase.from("lie_trust_scores").select("*").eq("user_id", user.id).eq("contact_name", contact_name).maybeSingle();
    const ai = await callOpenAI([
      { role: "system", content: "Rate trustworthiness of a single message sample 0-100. Consider consistency, manipulation, evasion." },
      { role: "user", content: `Contact: ${contact_name}\nSample:\n"""${String(sample_text).slice(0,3000)}"""\n\nReturn JSON: { score:number, confidence:"low"|"medium"|"high", evidence:[{quote:string, note:string}], summary:string }` },
    ]);
    if (ai.err) return ai.err;
    const r = ai.result;
    const prevSamples = existing?.sample_count || 0;
    const prevScore = existing?.score ?? 50;
    const newCount = prevSamples + 1;
    const blended = Math.round((prevScore * prevSamples + r.score) / newCount);
    const evidence = [...(existing?.evidence || []), { at: new Date().toISOString(), score: r.score, summary: r.summary, items: r.evidence || [] }].slice(-10);

    let saved: any;
    if (existing) {
      const { data } = await supabase.from("lie_trust_scores").update({
        score: blended, sample_count: newCount, evidence, updated_at: new Date().toISOString(),
      }).eq("id", existing.id).select().single();
      saved = data;
    } else {
      const { data } = await supabase.from("lie_trust_scores").insert({
        user_id: user.id, contact_name, score: r.score, sample_count: 1, evidence,
      }).select().single();
      saved = data;
    }
    await deductCredits(supabase, user.id, cc.cr, PARITY_COST);
    return json({ item: saved, latest_analysis: r, credits_charged: PARITY_COST });
  }
  return json({ error: "invalid op" }, 400);
}

async function actionTacticClassify(supabase: any, user: any, body: any) {
  const { text } = body;
  if (!text || typeof text !== "string" || text.length < 10) return json({ error: "text required" }, 400);
  const cc = await checkCredits(supabase, user.id, PARITY_COST); if (cc.err) return cc.err;
  const ai = await callOpenAI([
    { role: "system", content: "Classify manipulation tactics in a message. Detect: gaslighting, DARVO, love-bombing, guilt-tripping, silent treatment, projection, deflection, blame-shifting, minimization, future-faking." },
    { role: "user", content: `Text:\n"""${String(text).slice(0,4000)}"""\n\nReturn JSON: { tactics:[{name:string, confidence:number, evidence:string, definition:string}], primary_tactic:string, severity:"low"|"medium"|"high", educational_note:string, summary:string }` },
  ]);
  if (ai.err) return ai.err;
  const r = ai.result;
  await supabase.from("lie_tactic_classifications").insert({
    user_id: user.id, text: String(text).slice(0,4000),
    tactics: r.tactics || [], summary: r.summary, credits_used: PARITY_COST,
  });
  await deductCredits(supabase, user.id, cc.cr, PARITY_COST);
  return json({ ...r, credits_charged: PARITY_COST });
}

// ============ ROUTER ============
const HANDLERS: Record<string, (s: any, u: any, b: any) => Promise<Response>> = {
  "polygraph": actionPolygraph,
  "cross-exam": actionCrossExam,
  "voice": actionVoice,
  "voice-heatmap": actionVoiceHeatmap,
  "body-language": actionBodyLanguage,
  "comparison": actionComparison,
  "bulk": actionBulk,
  "api-keys": actionApiKeys,
  "monitor": actionMonitor,
  "social-card": actionSocialCard,
  "report": actionReport,
  "screenshot": actionScreenshot,
  "timeline": actionTimeline,
  "coach": actionCoach,
  "deepfake": actionDeepfake,
  "multi-person": actionMultiPerson,
  "daily-challenge": actionDailyChallenge,
  "verify-report": actionVerifyReport,
  // Parity Pack
  "chat-import": actionChatImport,
  "email-scan": actionEmailScan,
  "sentiment-timeline": actionSentimentTimeline,
  "watchlist": actionWatchlist,
  "red-flag": actionRedFlagLookup,
  "truth-chat": actionTruthChat,
  "trust-score": actionTrustScore,
  "tactic-classify": actionTacticClassify,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await getUserClient(req);
    if (auth.err) return auth.err;
    const body = await req.json();
    const action = body?.action as string;
    const handler = HANDLERS[action];
    if (!handler) return json({ error: `Unknown action: ${action}`, available: Object.keys(HANDLERS) }, 400);
    return await handler(auth.supabase, auth.user, body);
  } catch (e) {
    console.error("[lie-detector-ai]", e);
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
