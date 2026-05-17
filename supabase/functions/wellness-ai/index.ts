import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COSTS = {
  dream: 10, meditation: 15, mood: 8, sleep: 20,
  decoder: 10, evidence: 15, coach: 8, riskscan: 12,
  weekly_insight: 5, roleplay_score: 6, wall_filter: 2,
  cbt: 6, mh_assess: 6, walking: 6,
} as const;
const SAFETY_ACTIONS = new Set(["decoder", "evidence", "coach", "riskscan", "weekly_insight", "roleplay_score", "wall_filter"]);

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
  if (m.includes("gpt-4o-mini") && m.includes("mini")) return "gpt-4o-mini";
  if (m.includes("gpt-4o-mini")) return "gpt-4o";
  if (m.includes("gemini") && m.includes("pro")) return "gpt-4o";
  if (m.includes("gemini")) return "gpt-4o-mini";
  return m;
}

async function callAI(OPENAI_API_KEY: string, body: any) {
  // Image generation requests are routed differently — caller should use callImage().
  const payload = { ...body, model: mapModel(body?.model) };
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const t = await r.text();
    console.error("OpenAI error:", r.status, t);
    if (r.status === 429) throw new Error("AI rate limit exceeded, please try again shortly.");
    if (r.status === 401) throw new Error("OpenAI API key invalid.");
    if (r.status === 402) throw new Error("OpenAI credits exhausted, please top up.");
    throw new Error("AI request failed");
  }
  return r.json();
}

async function callImage(OPENAI_API_KEY: string, prompt: string): Promise<string | null> {
  try {
    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "dall-e-3", prompt: prompt.slice(0, 3900), size: "1024x1024", quality: "standard", n: 1 }),
    });
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
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("No authorization header");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (authErr || !user) throw new Error("Unauthorized");

    const body = await req.json();
    const action = body.action as keyof typeof COSTS;
    if (!action || !(action in COSTS)) throw new Error("Invalid action. Use: dream | meditation | mood | sleep");

    const COST = COSTS[action];
    const isSafety = SAFETY_ACTIONS.has(action);
    const creditTable = isSafety ? "safety_ai_credits" : "ai_credits";

    let credRow: any = null;
    {
      const { data } = await supabase.from(creditTable).select("credits_remaining").eq("user_id", user.id).maybeSingle();
      credRow = data;
      if (!credRow && isSafety) {
        const { data: created } = await supabase.from("safety_ai_credits")
          .insert({ user_id: user.id, credits_remaining: 20, total_credits_purchased: 20 }).select().single();
        credRow = created;
      }
    }
    const remaining = credRow?.credits_remaining || 0;
    if (remaining < COST) throw new Error(`Insufficient credits. Need ${COST}, have ${remaining}.`);

    let result: any = {};

    // ===== SAFETY ACTIONS =====
    if (action === "decoder") {
      const { input_text } = body;
      if (!input_text || input_text.length < 5) throw new Error("Message too short");
      const aiData = await callAI(OPENAI_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You analyze bullying messages. Output ONLY JSON: {"severity":"low|medium|high|critical","bully_type":"verbal|cyber|social|physical-threat|sexual|discriminatory","emotional_impact":"<2 sentences>","suggested_response":"<safe assertive reply>","action_steps":[{"step":"...","priority":"high|medium|low"}],"red_flags":["..."]}` },
          { role: "user", content: `Analyze: """${input_text}"""` },
        ],
      });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || {};
      const { data: saved } = await supabase.from("safety_bully_decoder").insert({
        user_id: user.id, input_text, severity: parsed.severity, bully_type: parsed.bully_type,
        emotional_impact: parsed.emotional_impact, suggested_response: parsed.suggested_response,
        action_steps: parsed.action_steps || [], red_flags: parsed.red_flags || [], credits_used: COST,
      }).select().single();
      result = saved;
    } else if (action === "evidence") {
      const { title, incidents } = body;
      if (!title || !Array.isArray(incidents) || incidents.length === 0) throw new Error("Title + incidents required");
      const aiData = await callAI(OPENAI_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `Build a formal bullying evidence pack. Output ONLY JSON: {"incident_summary":"...","timeline":[{"date":"YYYY-MM-DD","event":"...","severity":"low|medium|high"}],"recommended_recipients":[{"name":"...","reason":"..."}],"formal_report":"<~400 word neutral report>"}` },
          { role: "user", content: `Title: ${title}\nIncidents:\n${incidents.map((i: any, n: number) => `${n + 1}. ${i.date || "unknown"} — ${i.description}`).join("\n")}` },
        ],
      });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || {};
      const { data: saved } = await supabase.from("safety_evidence_packs").insert({
        user_id: user.id, title, incident_summary: parsed.incident_summary,
        timeline: parsed.timeline || [], recommended_recipients: parsed.recommended_recipients || [],
        formal_report: parsed.formal_report, credits_used: COST,
      }).select().single();
      result = saved;
    } else if (action === "coach") {
      const { scenario, user_response } = body;
      if (!scenario || !user_response) throw new Error("Scenario + response required");
      const aiData = await callAI(OPENAI_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `Score a roleplay bullying response. Output ONLY JSON: {"assertiveness_score":0-100,"empathy_score":0-100,"safety_score":0-100,"feedback":"...","improved_response":"...","next_steps":["..."]}` },
          { role: "user", content: `Scenario: ${scenario}\nResponse: ${user_response}` },
        ],
      });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || {};
      const { data: saved } = await supabase.from("safety_response_coach_sessions").insert({
        user_id: user.id, scenario, user_response,
        assertiveness_score: parsed.assertiveness_score, empathy_score: parsed.empathy_score,
        safety_score: parsed.safety_score, feedback: parsed.feedback,
        improved_response: parsed.improved_response, next_steps: parsed.next_steps || [], credits_used: COST,
      }).select().single();
      result = saved;
    } else if (action === "riskscan") {
      const { scan_input } = body;
      if (!scan_input || scan_input.length < 10) throw new Error("Input too short");
      const aiData = await callAI(OPENAI_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `Cyberbullying risk analyst. Output ONLY JSON: {"risk_level":"safe|caution|elevated|severe","overall_score":0-100,"threat_patterns":[{"pattern":"...","frequency":"low|medium|high","example":"..."}],"flagged_phrases":["..."],"safety_recommendations":[{"action":"...","why":"..."}]}` },
          { role: "user", content: `Scan: """${scan_input.slice(0, 5000)}"""` },
        ],
      });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || {};
      const { data: saved } = await supabase.from("safety_cyberbullying_scans").insert({
        user_id: user.id, scan_input: scan_input.slice(0, 5000), risk_level: parsed.risk_level,
        overall_score: parsed.overall_score, threat_patterns: parsed.threat_patterns || [],
        flagged_phrases: parsed.flagged_phrases || [], safety_recommendations: parsed.safety_recommendations || [],
        credits_used: COST,
      }).select().single();
      result = saved;
    } else if (action === "weekly_insight") {
      const { entries, mood_logs } = body;
      if (!Array.isArray(entries)) throw new Error("entries[] required");
      const aiData = await callAI(OPENAI_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a compassionate safety coach. Analyze 7 days of journal + mood logs. Output ONLY JSON: {"trend":"improving|stable|declining|critical","insight_text":"<3-4 supportive sentences>","recommendations":[{"title":"...","action":"...","priority":"high|medium|low"}]}` },
          { role: "user", content: `Journal entries:\n${JSON.stringify(entries).slice(0, 4000)}\n\nMood logs:\n${JSON.stringify(mood_logs || []).slice(0, 2000)}` },
        ],
      });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || {};
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const wsStr = weekStart.toISOString().slice(0, 10);
      const { data: saved } = await supabase.from("safety_journal_insights").upsert({
        user_id: user.id, week_start: wsStr, insight_text: parsed.insight_text || "Stay strong.",
        trend: parsed.trend, recommendations: parsed.recommendations || [], credits_used: COST,
      }, { onConflict: "user_id,week_start" }).select().single();
      result = saved;
    } else if (action === "roleplay_score") {
      const { scenario_id, scenario, user_response, difficulty = "easy", mode = "text" } = body;
      if (!scenario || !user_response) throw new Error("Scenario + response required");
      const aiData = await callAI(OPENAI_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `Score a bullying-response roleplay. Difficulty: ${difficulty}. Output ONLY JSON: {"total_score":0-100,"assertiveness":0-100,"empathy":0-100,"safety":0-100,"feedback":"...","next_line_from_bully":"<what bully says next, in character>"}` },
          { role: "user", content: `Scenario: ${scenario}\nUser response: ${user_response}` },
        ],
      });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || {};
      const { data: saved } = await supabase.from("safety_roleplay_sessions").insert({
        user_id: user.id, scenario_id: scenario_id || "custom", difficulty, mode,
        total_score: parsed.total_score || 0, steps_completed: 1,
        ai_feedback: parsed.feedback,
        transcript: [{ role: "user", text: user_response }, { role: "bully", text: parsed.next_line_from_bully }],
        credits_used: COST,
      }).select().single();
      result = { ...saved, ...parsed };
    } else if (action === "wall_filter") {
      const { message } = body;
      if (!message) throw new Error("Message required");
      const aiData = await callAI(OPENAI_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `Safety filter for a peer support wall. Output ONLY JSON: {"safe":true|false,"reason":"...","suggested_rewrite":"<if unsafe, supportive rewrite>"}` },
          { role: "user", content: message.slice(0, 1000) },
        ],
      });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || { safe: true };
      result = parsed;
    } else
    if (action === "dream") {
      const { dream_text } = body;
      if (!dream_text || dream_text.length < 10) throw new Error("Please describe your dream in at least 10 characters.");

      const { data: row, error: insErr } = await supabase.from("wellness_dream_interpretations")
        .insert({ user_id: user.id, dream_text, status: "processing", credits_used: COST }).select().single();
      if (insErr) throw insErr;

      const aiData = await callAI(OPENAI_API_KEY, {
        model: "gpt-4o-mini",
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

      const illustrationUrl = await callImage(
        OPENAI_API_KEY,
        `Surreal dreamlike illustration: ${parsed.illustration_prompt}. Soft pastel colors, ethereal mist, no text.`
      );

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

      const aiData = await callAI(OPENAI_API_KEY, {
        model: "gpt-4o-mini",
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

      const aiData = await callAI(OPENAI_API_KEY, {
        model: "gpt-4o-mini",
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

      const aiData = await callAI(OPENAI_API_KEY, {
        model: "gpt-4o-mini",
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
    } else if (action === "cbt") {
      const { situation, negative_thought, emotion, intensity_before } = body;
      if (!situation || !negative_thought) throw new Error("Situation + negative_thought required");
      const aiData = await callAI(OPENAI_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a CBT therapist. Output ONLY JSON: {"distortions":["catastrophizing","mind-reading",...],"reframe":"<gentle reframe>","balanced_thought":"<balanced thought>","action_step":"<one small action>"}` },
          { role: "user", content: `Situation: ${situation}\nThought: ${negative_thought}\nEmotion: ${emotion || "n/a"}` },
        ],
      });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || {};
      const { data: saved } = await supabase.from("wellness_cbt_reframes").insert({
        user_id: user.id, situation, negative_thought, emotion, intensity_before,
        distortions: parsed.distortions || [], reframe: parsed.reframe,
        balanced_thought: parsed.balanced_thought, action_step: parsed.action_step, credits_used: COST,
      }).select().single();
      result = saved;
    } else if (action === "mh_assess") {
      const { assessment_type, answers, total_score } = body;
      if (!assessment_type || !Array.isArray(answers)) throw new Error("assessment_type + answers[] required");
      const aiData = await callAI(OPENAI_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `Mental health screening interpreter (${assessment_type}). Be supportive, never diagnostic. Output ONLY JSON: {"severity":"minimal|mild|moderate|moderately-severe|severe","insight":"<2-3 supportive sentences>","actions":[{"title":"...","why":"..."}]}` },
          { role: "user", content: `Score: ${total_score}\nAnswers: ${JSON.stringify(answers)}` },
        ],
      });
      const parsed = parseJSON(aiData.choices?.[0]?.message?.content || "") || {};
      const { data: saved } = await supabase.from("wellness_mh_assessments").insert({
        user_id: user.id, assessment_type, answers, total_score,
        severity: parsed.severity, ai_insight: parsed.insight,
        recommended_actions: parsed.actions || [], credits_used: COST,
      }).select().single();
      result = saved;
    } else if (action === "walking") {
      const { intention, environment, duration_minutes = 10, voice_id = "EXAVITQu4vr4xnSDxMaL" } = body;
      if (!intention) throw new Error("Intention required");
      const { data: row } = await supabase.from("wellness_walking_meditations").insert({
        user_id: user.id, intention, environment, duration_minutes, voice_id,
        status: "processing", credits_used: COST,
      }).select().single();
      const aiData = await callAI(OPENAI_API_KEY, {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You write guided walking meditation scripts. ~${duration_minutes} minutes. Second person. Calm cues for steps, breath, senses. Use "..." for pauses.` },
          { role: "user", content: `Intention: ${intention}\nEnvironment: ${environment || "anywhere"}` },
        ],
      });
      const script = aiData.choices?.[0]?.message?.content || "";
      const audioUrl = await ttsUpload(supabase, ELEVENLABS_API_KEY, voice_id, script, `${user.id}/walk-${row.id}.mp3`,
        { stability: 0.75, similarity_boost: 0.7, style: 0.25, use_speaker_boost: true, speed: 0.9 });
      await supabase.from("wellness_walking_meditations").update({
        script, audio_url: audioUrl, status: "completed",
      }).eq("id", row.id);
      result = { id: row.id, script, audio_url: audioUrl };
    }

    // Deduct credits from correct table
    await supabase.from(creditTable).update({
      credits_remaining: remaining - COST, last_used_at: new Date().toISOString(),
    }).eq("user_id", user.id);

    if (!isSafety) {
      await supabase.from("ai_usage_history").insert({
        user_id: user.id, usage_type: `wellness_${action}`, credits_used: COST,
        description: `Wellness AI: ${action}`,
      });
    }

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
