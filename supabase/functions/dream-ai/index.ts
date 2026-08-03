import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

// Credit cost per action (matches the UI labels in DreamJournal.tsx).
const ACTION_COSTS: Record<string, number> = { "dictionary": 1,
  "lucid-coach": 1,
  "mood-correlation": 1,
  "pattern-analysis": 1,
  "sleep-analyzer": 1,
  "sleep-ritual": 1,
  "soundscapes": 2,
  "visualizer": 3 };

async function aiChat(messages: any[]) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("AI not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({ model: "google/gemini-3.6-flash", messages }),
  });
  if (res.status === 429) throw new Error("Rate limit reached, please try again shortly");
  if (res.status === 402) throw new Error("Insufficient AI credits on the platform");
  if (!res.ok) {
    const t = await res.text();
    console.error("gateway error", res.status, t);
    throw new Error("AI service temporarily unavailable");
  }
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content ?? "";
  try { return JSON.parse(content); } catch { return { result: content }; }
}

function extractImageUrl(data: any): string | null {
  const b64 = data?.data?.[0]?.b64_json;
  if (typeof b64 === "string" && b64) return `data:image/png;base64,${b64}`;
  const directUrl = data?.data?.[0]?.url;
  if (typeof directUrl === "string" && directUrl) return directUrl;
  const msg = data?.choices?.[0]?.message;
  const fromImages = msg?.images?.[0]?.image_url?.url || msg?.images?.[0]?.url;
  if (typeof fromImages === "string" && fromImages) return fromImages;
  const content = msg?.content;
  if (Array.isArray(content)) {
    for (const part of content) {
      const url = part?.image_url?.url || part?.url;
      if (typeof url === "string" && url) return url;
      if (typeof part?.b64_json === "string" && part.b64_json) return `data:image/png;base64,${part.b64_json}`;
    }
  }
  const inline = data?.candidates?.[0]?.content?.parts?.find((p: any) => p?.inlineData?.data)?.inlineData?.data;
  if (typeof inline === "string" && inline) return `data:image/png;base64,${inline}`;
  return null;
}

async function aiImage(prompt: string) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("AI not configured");
  const models = ["google/gemini-3.1-flash-image", "google/gemini-2.5-flash-image"];
  let lastErr = "";
  for (const model of models) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
        modalities: ["image", "text"],
      }),
    });
    if (res.status === 429) throw new Error("Rate limit reached, please try again shortly");
    if (res.status === 402) throw new Error("Insufficient AI credits on the platform");
    if (!res.ok) {
      lastErr = `status ${res.status}`;
      console.error("image gateway error", model, res.status, await res.text().catch(() => ""));
      continue;
    }
    const json = await res.json().catch(() => null);
    const url = extractImageUrl(json);
    if (url) return url;
    lastErr = "response did not contain an image";
    console.error("no image returned", model, JSON.stringify(json).slice(0, 500));
  }
  throw new Error(`Image generation failed (${lastErr})`);
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    // ── Auth check ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = userData.user.id;

    const body = await req.json();
    const { action, symbol, context, experience, goal, dreams, moods, sleepHours, quality, wakeUps, notes, duration, sleepGoal, challenges, dreamTheme, mood, ...params } = body;

    if (!action || !ACTION_COSTS[action]) {
      return new Response(JSON.stringify({ error: `Unknown or missing action` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Credit deduction (uses service role to bypass RLS for atomic decrement) ──
    const cost = ACTION_COSTS[action];
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const { data: creditsRow } = await adminClient
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", userId)
      .maybeSingle();
    const remaining = creditsRow?.credits_remaining ?? 0;
    if (remaining < cost) {
      return new Response(JSON.stringify({ error: "Insufficient credits", required: cost, remaining }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let result: any;
    switch (action) {
      case "dictionary":
        result = await aiChat([
          { role: "system", content: "You are a world-class dream analyst combining Jungian psychology, Freudian analysis, cultural mythology, and modern neuroscience. Provide comprehensive dream symbol interpretations with: Universal Meaning, Psychological Analysis, Cultural Variations, Emotional Significance, Personal Context Analysis, Common Dream Scenarios, Shadow Aspect, Action Guidance, Related Symbols. Use markdown." },
          { role: "user", content: `Interpret this dream symbol: "${symbol}"${context ? `. Personal context: "${context}"` : ""}` }
        ]);
        break;
      case "lucid-coach":
        result = await aiChat([
          { role: "system", content: "You are an expert lucid dreaming coach. Provide: Reality Check Techniques, MILD/WILD Techniques, Dream Journal Tips, Sleep Hygiene, Tonight's Exercise, Weekly Plan. Use markdown." },
          { role: "user", content: `Experience level: ${experience}\nGoal/Dream: ${goal}` },
        ]);
        break;
      case "mood-correlation":
        result = await aiChat([
          { role: "system", content: "You are a dream psychology data analyst. Analyze dream-mood correlations. Provide: Correlation Overview, Mood→Dream Mapping, Stress Impact, Positive/Negative Patterns, Temporal Patterns, Recurring Themes, Predictive Insights, Recommendations, Wellness Score. Use markdown." },
          { role: "user", content: `Analyze correlations:\nDREAM ENTRIES:\n${JSON.stringify(dreams || [], null, 2)}\nMOOD RECORDS:\n${JSON.stringify(moods || [], null, 2)}` }
        ]);
        break;
      case "pattern-analysis":
        result = await aiChat([
          { role: "system", content: "You are an expert dream analyst for pattern recognition. Provide: Recurring Themes, Emotional Arc, Symbol Dictionary, Dream Connections, Psychological Insights, Predictive Patterns, Recommendations. Use markdown." },
          { role: "user", content: `Analyze these ${(dreams || []).length} dreams for patterns:\n\n${(dreams || []).map((d: any) => `${d.title || "Dream"}: ${d.description || d.content || ""}`).join("\n\n")}` },
        ]);
        break;
      case "sleep-analyzer":
        result = await aiChat([
          { role: "system", content: "You are an expert sleep scientist. Provide: Sleep Score (1-100), Analysis, Sleep Architecture, Issues, Improvement Plan, Optimal Schedule, Dream Enhancement tips. Use markdown." },
          { role: "user", content: `Sleep Data:\n- Hours: ${sleepHours}\n- Quality: ${quality}\n- Night wake-ups: ${wakeUps}\n- Notes: ${notes || "None"}` },
        ]);
        break;
      case "sleep-ritual":
        result = await aiChat([
          { role: "system", content: "You are a sleep scientist and meditation expert. Create personalized bedtime rituals with: Ritual Overview, Environment Setup, Step-by-Step Timeline, Breathing Exercises, Body Scan, Visualization, Sleep Affirmations, Wake-Up Protocol, Weekly Progression, Scientific References. Use markdown." },
          { role: "user", content: `Create a ${duration}-minute bedtime ritual for goal: "${sleepGoal}".${challenges ? ` Sleep challenges: "${challenges}"` : ""}` }
        ]);
        break;
      case "soundscapes":
        result = await aiChat([
          { role: "system", content: "You are an expert sound designer. Create dream-inspired ambient soundscapes with: Soundscape Name, Core Layers, Binaural Beat Prescription, Guided Visualization Script, Listening Schedule, Science, DIY Tips. Use markdown." },
          { role: "user", content: `Create a dream soundscape for theme: "${dreamTheme}". Desired mood: ${mood}.` }
        ]);
        break;
      case "visualizer":
        result = await aiChat([
          { role: "system", content: "You are a dream visualization expert. Create a vivid visual description of the dream that could be used as an art prompt. Include colors, atmosphere, key imagery, and emotional tone. Use markdown." },
          { role: "user", content: `Visualize this dream: ${params.dreamDescription || ""}` }
        ]);
        break;
    }

    // ── Deduct credits AFTER successful AI call (atomic + ledger row) ──
    const { error: deductErr } = await adminClient.rpc("deduct_ai_credits_atomic", {
      _user_id: userId,
      _amount: cost,
    });
    if (deductErr) {
      const msg = deductErr.message || "";
      return new Response(JSON.stringify({ error: msg }), {
        status: msg.includes("INSUFFICIENT_CREDITS") ? 402 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ...result, credits_used: cost, credits_remaining: remaining - cost }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("dream-ai error:", e);
    const status = e.message?.includes("Unauthorized") ? 401
      : e.message?.includes("Insufficient") ? 402
      : e.message?.includes("Rate limit") ? 429
      : 500;
    return new Response(JSON.stringify({ error: e.message }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
