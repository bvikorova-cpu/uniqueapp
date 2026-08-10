import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

const COSTS = { dream: 3, meditation: 3, mood: 3, sleep: 3,
  decoder: 3, evidence: 3, coach: 3, riskscan: 3,
  weekly_insight: 3, roleplay_score: 3, wall_filter: 2,
  cbt: 3, mh_assess: 3, walking: 3,
  toxicity: 3, platreport: 3, restorative: 3, pulse: 3, affirmation: 3, bystander: 3 } as const;
const SAFETY_ACTIONS = new Set(["decoder","evidence","coach","riskscan","weekly_insight","roleplay_score","wall_filter","toxicity","platreport","restorative","pulse","affirmation","bystander"]);

function parseJSON(s: string): any {
  try {
    const m = s.match(/```json\s*([\s\S]*?)```/) || s.match(/```\s*([\s\S]*?)```/);
    return JSON.parse(m ? m[1] : s);
  } catch { return null; }
}

// Map legacy model identifiers to OpenAI equivalents.
function mapModel(m: any): string {
  if (typeof m !== "string") return "gpt-4o-mini";
  if (m.startsWith("openai/")) return m.replace("openai/", "");
  if (!m.startsWith("gpt-")) return "gpt-4o-mini";
  return m;
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function callAI(LOVABLE_API_KEY: string, body: any) {
  // Image generation requests are routed differently — caller should use callImage().
  // Requests are transparently rerouted to the Lovable AI Gateway by _shared/aiRedirect.ts.
  // 429 (rate limit) and 5xx are transient — retry with backoff, then fall back to a lighter model.
  const models = [mapModel(body?.model), "gpt-4.1-nano"];
  let lastStatus = 0;
  let lastText = "";

  for (let attempt = 0; attempt < 4; attempt++) {
    const model = models[Math.min(attempt >= 2 ? 1 : 0, models.length - 1)];
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, model }) });

    if (r.ok) return r.json();

    lastStatus = r.status;
    lastText = await r.text();
    console.error("AI gateway error:", r.status, model, lastText);

    if (r.status === 401) throw new Error("AI key invalid.");
    if (r.status === 402) throw new Error("AI credits exhausted, please top up.");
    if (r.status !== 429 && r.status < 500) throw new Error("AI request failed");

    if (attempt < 3) await sleep(600 * Math.pow(2, attempt)); // 0.6s, 1.2s, 2.4s
  }

  if (lastStatus === 429) throw new Error("AI is busy right now — please try again in a few seconds.");
  throw new Error("AI request failed");
}

async function callImage(LOVABLE_API_KEY: string, prompt: string): Promise<string | null> {
  try {
    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "dall-e-3", prompt: prompt.slice(0, 3900), size: "1024x1024", quality: "standard", n: 1 }) });
    if (!r.ok) { console.error("DALL-E error:", await r.text()); return null; }
    const d = await r.json();
    return d?.data?.[0]?.url || null;
  } catch (e) { console.error("Image gen failed:", e); return null; }
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
      body: JSON.stringify({ text: text.slice(0, 5000), model_id: "eleven_turbo_v2_5", voice_settings: voiceSettings }) });
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
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: { user }, error: authErr } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (authErr || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json();
    const action = body.action as keyof typeof COSTS;
    if (!action || !(action in COSTS)) return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const COST = COSTS[action];
    const isSafety = SAFETY_ACTIONS.has(action);
    // Unified credit pool for the whole platform (ai_credits + ledger).
    const creditTable = "ai_credits";

    let credRow: any = null;
    {
      const { data } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
      credRow = data;
    }
    const remaining = credRow?.credits_remaining || 0;
    if (remaining < COST) {
      return new Response(JSON.stringify({
        error: `Insufficient credits. Need ${COST}, have ${remaining}.`,
        code: "INSUFFICIENT_CREDITS", need: COST, have: remaining }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }


    let result: any = {};

    // ===== SAFETY ACTIONS =====
    if (action === "decoder") {
      const { input_text } = body;
      if (!input_text || input_text.length < 5) throw new Error("Message too short");
      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are an expert anti-bullying analyst. Analyze the message in depth. Output ONLY JSON: {"severity":"low|medium|high|critical","bully_type":"verbal|cyber|social|physical-threat|sexual|discriminatory","emotional_impact":"<detailed 4-5 sentence analysis of the psychological and emotional toll on the recipient>","suggested_response":"<a well-crafted 3-4 sentence assertive, safe reply that de-escalates and sets a firm boundary>","action_steps":[{"step":"<specific actionable step>","priority":"high|medium|low","why":"<why this step matters>"}],"red_flags":["<each flag with brief explanation>"],"long_term_strategy":"<2-3 sentence advice on handling this pattern ongoing>","support_resources":"<2-3 relevant support resources or people to contact>"}` },
          { role: "user", content: `Analyze in detail: """${input_text}"""` },
        ] });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || {};
      const { data: saved } = await supabase.from("safety_bully_decoder").insert({ user_id: user.id, input_text, severity: parsed.severity, bully_type: parsed.bully_type,
        emotional_impact: parsed.emotional_impact, suggested_response: parsed.suggested_response,
        action_steps: parsed.action_steps || [], red_flags: parsed.red_flags || [], credits_used: COST }).select().single();
      result = { ...saved, ...parsed };
    } else if (action === "evidence") {
      const { title, incidents } = body;
      if (!title || !Array.isArray(incidents) || incidents.length === 0) throw new Error("Title + incidents required");
      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `Build a comprehensive, formal bullying evidence pack suitable for school, HR, or legal proceedings. Output ONLY JSON: {"incident_summary":"<detailed 4-5 sentence overview of the pattern of behaviour>","timeline":[{"date":"YYYY-MM-DD","event":"<detailed event description with context>","severity":"low|medium|high","witnesses":"<if any>"}],"recommended_recipients":[{"name":"<recipient title/role>","reason":"<2-3 sentence explanation of why they should receive this>","suggested_action":"<what to ask them to do>"}],"formal_report":"<600-800 word neutral, professional, fact-based report with clear sections: Background, Pattern of Incidents, Impact on Victim, and Requested Actions>","legal_considerations":"<2-3 sentence note on any legal angle if applicable>","emotional_impact_summary":"<3-4 sentence description of documented emotional/psychological impact>"}` },
          { role: "user", content: `Title: ${title}\nIncidents:\n${incidents.map((i: any, n: number) => `${n + 1}. ${i.date || "unknown"} — ${i.description}`).join("\n")}` },
        ] });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || {};
      const { data: saved } = await supabase.from("safety_evidence_packs").insert({ user_id: user.id, title, incident_summary: parsed.incident_summary,
        timeline: parsed.timeline || [], recommended_recipients: parsed.recommended_recipients || [],
        formal_report: parsed.formal_report, credits_used: COST }).select().single();
      result = { ...saved, ...parsed };
    } else if (action === "coach") {
      const { scenario, user_response } = body;
      if (!scenario || !user_response) throw new Error("Scenario + response required");
      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are an expert communication coach specializing in bullying response training. Score the response and give detailed, constructive feedback. Output ONLY JSON: {"assertiveness_score":0-100,"empathy_score":0-100,"safety_score":0-100,"overall_assessment":"<3-4 sentence overall summary of how the response handled the situation>","feedback":"<detailed 4-5 sentence breakdown of strengths and areas for improvement, referencing specific words or tone choices>","improved_response":"<a polished 3-4 sentence improved version with clear reasoning for changes>","next_steps":[{"step":"<specific practice step>","goal":"<what it builds>"}],"confidence_tip":"<2 sentence tip on building confidence for similar situations>"}` },
          { role: "user", content: `Scenario: ${scenario}\nResponse: ${user_response}` },
        ] });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || {};
      const { data: saved } = await supabase.from("safety_response_coach_sessions").insert({ user_id: user.id, scenario, user_response,
        assertiveness_score: parsed.assertiveness_score, empathy_score: parsed.empathy_score,
        safety_score: parsed.safety_score, feedback: parsed.feedback,
        improved_response: parsed.improved_response, next_steps: parsed.next_steps || [], credits_used: COST }).select().single();
      result = { ...saved, ...parsed };
    } else if (action === "riskscan") {
      const { scan_input } = body;
      if (!scan_input || scan_input.length < 10) throw new Error("Input too short");
      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a cyberbullying risk analyst with expertise in online safety. Conduct a thorough analysis. Output ONLY JSON: {"risk_level":"safe|caution|elevated|severe","overall_score":0-100,"analysis_summary":"<4-5 sentence detailed explanation of the overall risk landscape in the content>","threat_patterns":[{"pattern":"<named pattern>","frequency":"low|medium|high","example":"<quote from content>","impact":"<1-2 sentence explanation of why this is harmful>"}],"flagged_phrases":[{"phrase":"<exact phrase>","category":"<hate|harassment|threat|insult|other>","concern":"<1 sentence why this is flagged>"}],"safety_recommendations":[{"action":"<specific action>","why":"<2-3 sentence explanation>","urgency":"immediate|short-term|long-term"}],"digital_safety_tips":"<3-4 practical tips for protecting online presence>"}` },
          { role: "user", content: `Scan: """${scan_input.slice(0, 5000)}"""` },
        ] });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || {};
      const { data: saved } = await supabase.from("safety_cyberbullying_scans").insert({ user_id: user.id, scan_input: scan_input.slice(0, 5000), risk_level: parsed.risk_level,
        overall_score: parsed.overall_score, threat_patterns: parsed.threat_patterns || [],
        flagged_phrases: parsed.flagged_phrases || [], safety_recommendations: parsed.safety_recommendations || [],
        credits_used: COST }).select().single();
      result = { ...saved, ...parsed };
    } else if (action === "weekly_insight") {
      const { entries, mood_logs } = body;
      if (!Array.isArray(entries)) throw new Error("entries[] required");
      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a compassionate safety coach and wellbeing analyst. Analyze 7 days of journal + mood logs with depth and care. Output ONLY JSON: {"trend":"improving|stable|declining|critical","insight_text":"<6-8 supportive, insightful sentences that identify patterns, acknowledge feelings, and connect the week's events meaningfully>","recommendations":[{"title":"<clear title>","action":"<specific, detailed action>","why":"<2-3 sentence explanation>","priority":"high|medium|low"}],"encouragement":"<3-4 sentence warm closing message affirming their strength and progress>","self_care_suggestions":["<3-4 specific self-care activities tailored to the week's pattern>"]}` },
          { role: "user", content: `Journal entries:\n${JSON.stringify(entries).slice(0, 4000)}\n\nMood logs:\n${JSON.stringify(mood_logs || []).slice(0, 2000)}` },
        ] });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || {};
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const wsStr = weekStart.toISOString().slice(0, 10);
      const { data: saved } = await supabase.from("safety_journal_insights").upsert({ user_id: user.id, week_start: wsStr, insight_text: parsed.insight_text || "Stay strong.",
        trend: parsed.trend, recommendations: parsed.recommendations || [], credits_used: COST }, { onConflict: "user_id,week_start" }).select().single();
      result = { ...saved, ...parsed };
    } else if (action === "roleplay_score") {
      const { scenario_id, scenario, user_response, difficulty = "easy", mode = "text" } = body;
      if (!scenario || !user_response) throw new Error("Scenario + response required");
      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are an expert roleplay facilitator for bullying-response training. Difficulty: ${difficulty}. Score the response with nuance. Output ONLY JSON: {"total_score":0-100,"assertiveness":0-100,"empathy":0-100,"safety":0-100,"feedback":"<detailed 5-6 sentence analysis covering tone, word choice, body language cues, and emotional intelligence>","strengths":["<2-3 specific things the user did well>"],"areas_to_improve":["<2-3 specific suggestions with examples>"],"next_line_from_bully":"<what bully says next, in character, 1-2 sentences that escalate appropriately>","coaching_tip":"<2-3 sentence tip for the next round>"}` },
          { role: "user", content: `Scenario: ${scenario}\nUser response: ${user_response}` },
        ] });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || {};
      const { data: saved } = await supabase.from("safety_roleplay_sessions").insert({
        user_id: user.id, scenario_id: scenario_id || "custom", difficulty, mode,
        total_score: parsed.total_score || 0, steps_completed: 1,
        ai_feedback: parsed.feedback,
        transcript: [{ role: "user", text: user_response }, { role: "bully", text: parsed.next_line_from_bully }],
        credits_used: COST }).select().single();
      result = { ...saved, ...parsed };
    } else if (action === "wall_filter") {
      const { message } = body;
      if (!message) throw new Error("Message required");
      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `Safety filter for a peer support wall. Output ONLY JSON: {"safe":true|false,"reason":"...","suggested_rewrite":"<if unsafe, supportive rewrite>"}` },
          { role: "user", content: message.slice(0, 1000) },
        ] });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || { safe: true };
      result = parsed;
    } else
    if (action === "dream") {
      const { dream_text } = body;
      if (!dream_text || dream_text.length < 10) throw new Error("Please describe your dream in at least 10 characters.");

      const { data: row, error: insErr } = await supabase.from("wellness_dream_interpretations")
        .insert({ user_id: user.id, dream_text, status: "processing", credits_used: COST }).select().single();
      if (insErr) throw insErr;

      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a compassionate dream analyst combining Jungian psychology, modern neuroscience, and gentle spiritual insight. Provide a rich, multi-layered interpretation. Use the interpret_dream function.` },
          { role: "user", content: `Interpret this dream in depth, exploring symbolism, emotional themes, and how it might connect to the dreamer's waking life. Be thorough and insightful: ${dream_text}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "interpret_dream",
            parameters: {
              type: "object",
              properties: {
                interpretation: { type: "string", description: "A rich, multi-paragraph interpretation (at least 150 words) exploring the dream's symbolism, emotional resonance, and possible waking-life connections" },
                symbols: { type: "array", items: { type: "object", properties: { symbol: { type: "string" }, meaning: { type: "string", description: "2-3 sentence explanation of the symbol's significance" } }, required: ["symbol", "meaning"] } },
                emotional_themes: { type: "array", items: { type: "string", description: "Each theme with a brief 1-2 sentence exploration" } },
                waking_life_connection: { type: "string", description: "3-4 sentence reflection on how this dream might connect to the dreamer's waking concerns or emotional state" },
                illustration_prompt: { type: "string" } },
              required: ["interpretation", "symbols", "emotional_themes", "waking_life_connection", "illustration_prompt"] } } }],
        tool_choice: { type: "function", function: { name: "interpret_dream" } } });
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      const parsed = toolCall ? JSON.parse(toolCall.function.arguments) : {};

      const illustrationUrl = await callImage(
        LOVABLE_API_KEY,
        `Surreal dreamlike illustration: ${parsed.illustration_prompt}. Soft pastel colors, ethereal mist, no text.`
      );

      await supabase.from("wellness_dream_interpretations").update({ interpretation: parsed.interpretation, symbols: parsed.symbols || [],
        emotional_themes: parsed.emotional_themes || [], illustration_url: illustrationUrl, status: "completed" }).eq("id", row.id);

      result = { id: row.id, ...parsed, illustration_url: illustrationUrl };

    } else if (action === "meditation") {
      const { topic, duration_minutes = 5, voice_id = "EXAVITQu4vr4xnSDxMaL" } = body;
      if (!topic || topic.length < 3) throw new Error("Topic required (min 3 chars)");

      const { data: row, error: insErr } = await supabase.from("wellness_personalized_meditations")
        .insert({ user_id: user.id, topic, duration_minutes, voice_id, status: "processing", credits_used: COST }).select().single();
      if (insErr) throw insErr;

      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a master meditation teacher. Write a ${duration_minutes}-minute guided meditation script. Use calm language. Include "..." for natural pauses. No SSML, no labels. Speak in second person.` },
          { role: "user", content: `Topic: ${topic}` },
        ] });
      const script = aiData.choices?.[0]?.message?.content || "";
      if (!script) throw new Error("No script generated");

      const audioUrl = await ttsUpload(supabase, ELEVENLABS_API_KEY, voice_id, script, `${user.id}/meditation-${row.id}.mp3`,
        { stability: 0.7, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true, speed: 0.9 });

      await supabase.from("wellness_personalized_meditations").update({ meditation_script: script, audio_url: audioUrl, status: "completed" }).eq("id", row.id);

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
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Analyze this person's facial expression and visible signs of stress, fatigue, and mood in depth. Be supportive, never diagnostic. Provide a rich, detailed analysis with actionable, personalized recommendations." },
            { type: "image_url", image_url: { url: selfie_data_url } },
          ] }],
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
                    energy: { type: "integer" }, tension: { type: "integer" } },
                  required: ["happiness", "calm", "energy", "tension"] },
                ai_insight: { type: "string", description: "A detailed 5-6 sentence insight explaining the analysis, offering context, and suggesting how the user might feel supported" },
                recommendations: {
                  type: "array",
                  items: { type: "object", properties: { tool: { type: "string" }, reason: { type: "string", description: "2-3 sentence explanation of why this tool is recommended" } }, required: ["tool", "reason"] } },
                daily_practices: { type: "array", items: { type: "string", description: "Specific daily practices tailored to the detected mood" } } },
              required: ["detected_mood", "stress_level", "fatigue_level", "emotion_breakdown", "ai_insight", "recommendations", "daily_practices"] } } }],
        tool_choice: { type: "function", function: { name: "analyze_mood" } } });
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No analysis returned");
      const parsed = JSON.parse(toolCall.function.arguments);

      const { data: row, error: insErr } = await supabase.from("wellness_mood_mirror").insert({ user_id: user.id, selfie_url: selfieUrl,
        detected_mood: parsed.detected_mood, stress_level: parsed.stress_level, fatigue_level: parsed.fatigue_level,
        emotion_breakdown: parsed.emotion_breakdown, recommendations: parsed.recommendations,
        ai_insight: parsed.ai_insight, credits_used: COST }).select().single();
      if (insErr) throw insErr;

      result = { id: row.id, ...parsed, selfie_url: selfieUrl };

    } else if (action === "sleep") {
      const { theme, protagonist = "you", setting, duration_minutes = 10, voice_id = "XrExE9yKIg1WjnnlVkGX" } = body;
      if (!theme || theme.length < 3) throw new Error("Theme required");

      const { data: row, error: insErr } = await supabase.from("wellness_ai_sleep_stories").insert({
        user_id: user.id, title: `${theme} — A Sleep Story`,
        theme, protagonist, setting, duration_minutes, voice_id,
        status: "processing", credits_used: COST }).select().single();
      if (insErr) throw insErr;

      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a soothing sleep story writer. Write a ~${duration_minutes}-minute calm bedtime story (~${duration_minutes * 130} words). Slow, dreamy, descriptive. No conflict. Use "..." for pauses. End with sleep.` },
          { role: "user", content: `Theme: ${theme}\nProtagonist: ${protagonist}\nSetting: ${setting || "AI's choice"}` },
        ] });
      const story = aiData.choices?.[0]?.message?.content || "";
      if (!story) throw new Error("No story generated");
      const title = story.split("\n")[0].replace(/^#\s*/, "").slice(0, 80) || `${theme} — A Sleep Story`;

      const audioUrl = await ttsUpload(supabase, ELEVENLABS_API_KEY, voice_id, story, `${user.id}/sleep-${row.id}.mp3`,
        { stability: 0.85, similarity_boost: 0.7, style: 0.2, use_speaker_boost: true, speed: 0.85 });

      await supabase.from("wellness_ai_sleep_stories").update({ title, story_text: story, audio_url: audioUrl, status: "completed" }).eq("id", row.id);

      result = { id: row.id, title, story_text: story, audio_url: audioUrl };
    } else if (action === "cbt") {
      const { situation, negative_thought, emotion, intensity_before } = body;
      if (!situation || !negative_thought) throw new Error("Situation + negative_thought required");
      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a skilled CBT therapist. Provide a thorough, compassionate cognitive restructuring. Output ONLY JSON: {"distortions":["<each with brief label>","<e.g. catastrophizing, mind-reading, all-or-nothing thinking>"],"distortion_explanations":[{"distortion":"<name>","how_it_appears":"<2-3 sentence explanation of how this distortion shows in their thinking>"}],"reframe":"<detailed 4-5 sentence gentle reframe that challenges the distortion with evidence and perspective>","balanced_thought":"<a nuanced, realistic 2-3 sentence balanced thought that acknowledges the difficulty while offering clarity>","action_step":"<specific, achievable action with a 2-3 sentence explanation of how it helps>","self_compassion_note":"<2-3 sentence warm reminder that thoughts are not facts and growth takes time>"}` },
          { role: "user", content: `Situation: ${situation}\nThought: ${negative_thought}\nEmotion: ${emotion || "n/a"}` },
        ] });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || {};
      const { data: saved } = await supabase.from("wellness_cbt_reframes").insert({ user_id: user.id, situation, negative_thought, emotion, intensity_before,
        distortions: parsed.distortions || [], reframe: parsed.reframe,
        balanced_thought: parsed.balanced_thought, action_step: parsed.action_step, credits_used: COST }).select().single();
      result = { ...saved, ...parsed };
    } else if (action === "mh_assess") {
      const { assessment_type, answers, total_score } = body;
      if (!assessment_type || !Array.isArray(answers)) throw new Error("assessment_type + answers[] required");
      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `Mental health screening interpreter (${assessment_type}). Be supportive, thorough, and never diagnostic — always recommend professional consultation. Output ONLY JSON: {"severity":"minimal|mild|moderate|moderately-severe|severe","insight":"<5-6 supportive, detailed sentences that contextualize the score, validate their experience, and explain what the severity level typically means without alarming>","score_context":"<2-3 sentence explanation of what the score range indicates in plain language>","actions":[{"title":"<clear action title>","why":"<3-4 sentence detailed explanation of why this action helps and how to start>","how_to_start":"<specific first step>","priority":"high|medium|low"}],"lifestyle_suggestions":["<3-4 specific, evidence-based lifestyle adjustments>"],"professional_guidance":"<3-4 sentence guidance on when to seek professional help and what kind of support to look for>"}` },
          { role: "user", content: `Score: ${total_score}\nAnswers: ${JSON.stringify(answers)}` },
        ] });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || {};
      const { data: saved } = await supabase.from("wellness_mh_assessments").insert({ user_id: user.id, assessment_type, answers, total_score,
        severity: parsed.severity, ai_insight: parsed.insight,
        recommended_actions: parsed.actions || [], credits_used: COST }).select().single();
      result = { ...saved, ...parsed };
    } else if (action === "walking") {
      const { intention, environment, duration_minutes = 10, voice_id = "EXAVITQu4vr4xnSDxMaL" } = body;
      if (!intention) throw new Error("Intention required");
      const { data: row } = await supabase.from("wellness_walking_meditations").insert({ user_id: user.id, intention, environment, duration_minutes, voice_id,
        status: "processing", credits_used: COST }).select().single();
      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You write guided walking meditation scripts. ~${duration_minutes} minutes. Second person. Calm cues for steps, breath, senses. Use "..." for pauses.` },
          { role: "user", content: `Intention: ${intention}\nEnvironment: ${environment || "anywhere"}` },
        ] });
      const script = aiData.choices?.[0]?.message?.content || "";
      const audioUrl = await ttsUpload(supabase, ELEVENLABS_API_KEY, voice_id, script, `${user.id}/walk-${row.id}.mp3`,
        { stability: 0.75, similarity_boost: 0.7, style: 0.25, use_speaker_boost: true, speed: 0.9 });
      await supabase.from("wellness_walking_meditations").update({ script, audio_url: audioUrl, status: "completed" }).eq("id", row.id);
      result = { id: row.id, script, audio_url: audioUrl };
    }

    // ===== SAFETY PARITY PACK =====
    else if (action === "toxicity") {
      const { input_text } = body;
      if (!input_text || input_text.length < 5) throw new Error("Text too short");
      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a toxicity and online harm analyst. Conduct a thorough, nuanced analysis of the text. Output ONLY JSON: {"toxicity_score":0-100,"categories":{"harassment":0-100,"hate":0-100,"threat":0-100,"sexual":0-100,"self_harm":0-100,"insult":0-100},"ai_analysis":"<5-6 sentence detailed analysis explaining the scores, the specific harmful elements identified, and the context in which they appear>","hardest_hitting_phrases":[{"phrase":"<exact phrase>","category":"<which category>","why":"<1-2 sentence explanation>"}],"recommended_actions":[{"action":"<specific action>","why":"<2 sentence explanation>","priority":"immediate|short-term|long-term"}],"de_escalation_advice":"<3-4 sentence advice on responding constructively or choosing not to engage>"}` },
          { role: "user", content: input_text.slice(0, 3000) },
        ] });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || {};
      const { data: saved } = await supabase.from("safety_toxicity_scans").insert({
        user_id: user.id, input_text: input_text.slice(0, 3000),
        toxicity_score: parsed.toxicity_score, categories: parsed.categories || {},
        ai_analysis: parsed.ai_analysis, recommended_actions: parsed.recommended_actions || [],
        credits_used: COST }).select().single();
      result = { ...saved, ...parsed };
    } else if (action === "platreport") {
      const { platform, incident_summary, evidence_urls } = body;
      if (!platform || !incident_summary) throw new Error("Platform + summary required");
      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `Draft a formal report letter to a social platform's trust & safety team. Be neutral, factual, cite their community guidelines where applicable, and make a clear, well-structured case for action. Include: opening identifying the reporter, detailed incident description with dates, reference to specific community guidelines violated, request for specific action, and a professional closing. Output ONLY plain text letter (400-600 words).` },
          { role: "user", content: `Platform: ${platform}\nIncident: ${incident_summary}\nEvidence URLs: ${(evidence_urls||[]).join(", ")}` },
        ] });
      const letter = aiData.choices?.[0]?.message?.content || "";
      const { data: saved } = await supabase.from("safety_platform_reports").insert({ user_id: user.id, platform, incident_summary,
        evidence_urls: evidence_urls || [], generated_letter: letter,
        status: "draft", credits_used: COST }).select().single();
      result = { ...saved, ...parsed };
    } else if (action === "restorative") {
      const { recipient_type, context, tone = "firm" } = body;
      if (!recipient_type || !context) throw new Error("Recipient + context required");
      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `Draft a restorative-justice letter from a bullying victim to a ${recipient_type}. Tone: ${tone}. Express the full impact of the behaviour with specific examples, explain the emotional and practical consequences, ask for specific actions or accountability, and keep the language dignified and constructive. Structure: opening, impact description, specific requests, and a forward-looking closing. 350-500 words, plain text only.` },
          { role: "user", content: context.slice(0, 2000) },
        ] });
      const letter = aiData.choices?.[0]?.message?.content || "";
      const { data: saved } = await supabase.from("safety_restorative_letters").insert({ user_id: user.id, recipient_type, context, tone,
        generated_letter: letter, credits_used: COST }).select().single();
      result = { ...saved, ...parsed };
    } else if (action === "pulse") {
      const { mood_score, anxiety_score, safety_score } = body;
      if ([mood_score, anxiety_score, safety_score].some(v => typeof v !== "number")) throw new Error("Scores required");
      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a wellbeing pulse analyst and mental health coach. Give a thorough, caring, actionable assessment. Output ONLY JSON: {"risk_level":"safe|caution|elevated|severe","advice":"<7-8 supportive, detailed sentences acknowledging their feelings, explaining the risk level, and providing concrete, personalized next steps including at least two specific actions they can take today>","daily_practices":["<3-4 specific, practical daily practices tailored to their scores>","<e.g. grounding exercise, journal prompt, movement suggestion>"],"professional_help_note":"<2-3 sentence guidance on when and how to seek professional support if needed>","encouragement":"<3-4 sentence warm, empowering closing message>"}` },
          { role: "user", content: `Mood: ${mood_score}/10, Anxiety: ${anxiety_score}/10, Safety: ${safety_score}/10` },
        ] });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || {};
      const { data: saved } = await supabase.from("safety_wellbeing_pulse").insert({ user_id: user.id, mood_score, anxiety_score, safety_score,
        ai_risk_level: parsed.risk_level, ai_advice: parsed.advice, credits_used: COST }).select().single();
      result = { ...saved, ...parsed };
    } else if (action === "affirmation") {
      const { theme = "resilience" } = body;
      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `Write a warm, empowering affirmation set for a young person facing bullying. Theme: ${theme}. Output ONLY JSON: {"main_affirmation":"<one powerful sentence, under 25 words>","expanded_reflection":"<3-4 sentence deeper reflection that explains the affirmation and connects it to their inner strength>","morning_mantra":"<short 1-2 sentence mantra to repeat each morning>","evening_reflection":"<2-3 sentence reflection question to close the day with self-compassion>","why_it_matters":"<2-3 sentence explanation of why this theme matters and how it builds resilience>"}` },
          { role: "user", content: "Generate." },
        ] });
      const affirmation = (aiData.choices?.[0]?.message?.content || "").trim();
      const today = new Date().toISOString().slice(0, 10);
      const { data: saved } = await supabase.from("safety_daily_affirmations").upsert({ user_id: user.id, affirmation, theme, for_date: today, credits_used: COST }, { onConflict: "user_id,for_date" }).select().single();
      result = { ...saved, ...parsed };
    } else if (action === "bystander") {
      const { scenario_key, choice } = body;
      if (!scenario_key || !choice) throw new Error("Scenario + choice required");
      const aiData = await callAI(LOVABLE_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a bystander-intervention expert and educator. Score the choice with depth and pedagogical care. Output ONLY JSON: {"score":0-100,"feedback":"<5-6 sentence detailed analysis of why the choice was or was not effective, the potential real-world consequences, and what made it impactful or risky>","what_went_well":"<3-4 sentences on the strengths of the choice>","what_to_improve":"<3-4 sentences with specific alternative actions that could have been taken>","real_world_application":"<3-4 sentences on how this scenario maps to real life and what to watch for>","confidence_builder":"<2-3 sentences on building the courage to act as a bystander>"}` },
          { role: "user", content: `Scenario: ${scenario_key}\nBystander chose: ${choice}` },
        ] });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || {};
      const { data: saved } = await supabase.from("safety_bystander_scores").insert({ user_id: user.id, scenario_key, choice,
        score: parsed.score || 0, feedback: parsed.feedback }).select().single();
      result = { ...saved, ...parsed };
    }

    // Deduct from the unified pool + always write usage history (ledger trigger records reason/source)
    await supabase.from(creditTable).update({ credits_remaining: remaining - COST, last_used_at: new Date().toISOString() }).eq("user_id", user.id);

    await supabase.from("ai_usage_history").insert({
      user_id: user.id, usage_type: `wellness_${action}`, credits_used: COST,
      description: `${isSafety ? "Safety AI" : "Wellness AI"}: ${action}` });


    return new Response(JSON.stringify({ ...result, creditsRemaining: remaining - COST }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("wellness-ai error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
