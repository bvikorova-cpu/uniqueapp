// Universal Vision Analyzer — handles all vision/image AI tasks via `task` param.
// Replaces ~40 individual analyze-* / identify-* / photo-* / beauty-* functions.
//
// Body: { task: string, imageUrl?: string, prompt?: string, ...extras }
// The `task` param maps to a system prompt + AI model (vision vs text).
//
// Backed by OpenAI (OPENAI_API_KEY) — no per-tier secrets.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (s: string, d?: unknown) =>
  console.log(`[VISION] ${s}${d ? ` ${JSON.stringify(d)}` : ""}`);

// Per-task system prompts. Add more as needed.
const TASK_PROMPTS: Record<string, { prompt: string; visionRequired?: boolean }> = {
  // Analysis (vision)
  crystal_energy:        { prompt: "You are a crystal-energy expert. Analyze the crystal in the image: type, energetic properties, recommended chakra, healing uses. Be concise.", visionRequired: true },
  emotion:               { prompt: "You are an emotion-recognition expert. Detect the dominant emotion(s) in the image and explain visual cues.", visionRequired: true },
  message:               { prompt: "You analyze written messages for tone, intent, sentiment, and red flags. Provide a structured analysis." },
  profile:               { prompt: "You analyze dating/social profiles. Provide compatibility insights, personality traits, and conversation starters." },
  restaurant_menu:       { prompt: "You are a nutrition expert. Analyze the menu/dish: estimated calories, macros, healthier alternatives.", visionRequired: true },
  resume:                { prompt: "You are a senior recruiter. Analyze the resume: strengths, weaknesses, ATS-readability, suggested improvements." },
  thread:                { prompt: "You analyze conversation threads. Summarize sentiment progression, key topics, and outcome." },
  antique_identify:      { prompt: "You are an antique appraiser. Identify the item: era, origin, materials, estimated value range, authenticity confidence.", visionRequired: true },
  antique_forgery:       { prompt: "You are a forgery-detection expert. Analyze the antique image for signs of forgery vs authenticity. Score 0-100.", visionRequired: true },
  antique_batch:         { prompt: "Appraise multiple antiques. Provide a list with brief valuation for each item." },
  antique_provenance:    { prompt: "Build a plausible provenance/ownership history for the antique based on visual cues.", visionRequired: true },
  antique_market:        { prompt: "Provide current market trends for this antique category. Include recent auction prices when possible.", visionRequired: true },
  antique_price_alert:   { prompt: "Set up a price-alert briefing for this antique: target buy/sell ranges and rationale." },
  antique_certificate:   { prompt: "Generate a formal authenticity certificate text for the antique with all key attributes." },
  antique_museum:        { prompt: "Write a museum-style display description for the antique." },
  antique_consult:       { prompt: "Provide expert antique consultation. Answer the user's specific question with depth." },
  antique_ar:            { prompt: "Suggest AR placement and room context recommendations for displaying the antique." },
  plant_identify:        { prompt: "You are a botanist. Identify the plant: species, common names, care needs, toxicity, native range.", visionRequired: true },
  plant_diagnose:        { prompt: "Diagnose the plant's health: pests, diseases, deficiencies, recommended treatment.", visionRequired: true },
  phobia_detect:         { prompt: "Detect potential phobia triggers in the image and rate severity 1-10.", visionRequired: true },
  food_scan:             { prompt: "Identify the food and provide nutritional breakdown: calories, protein, carbs, fats.", visionRequired: true },
  beauty_skin:           { prompt: "You are a dermatologist. Analyze skin: type, concerns, recommended routine. Avoid medical claims.", visionRequired: true },
  photo_damage:          { prompt: "Detect damage in old photos: scratches, fading, tears. Suggest restoration steps.", visionRequired: true },

  // Image-generation tasks (delegate to text recommendation if no image gen yet)
  photo_upscale:         { prompt: "Describe upscaling recommendations and ideal output specs for this photo.", visionRequired: true },
  photo_bg_remove:       { prompt: "Confirm subject and describe background-removal output for this photo.", visionRequired: true },
  photo_colorize:        { prompt: "Suggest a realistic colorization palette for this B&W photo.", visionRequired: true },
  photo_face_enhance:    { prompt: "Suggest face-enhancement adjustments preserving identity.", visionRequired: true },
  photo_restore:         { prompt: "Plan a step-by-step restoration of this old photo.", visionRequired: true },
  virtual_tryon:         { prompt: "Describe how the garment would fit/look on the user. Suggest size and styling tips.", visionRequired: true },
  beauty_transform:      { prompt: "Describe a beauty transformation recommendation for this face.", visionRequired: true },
  beauty_celebrity:      { prompt: "Match the face to celebrity look-alikes and explain similarity.", visionRequired: true },
  beauty_nail_art:       { prompt: "Recommend nail-art designs matching the user's style/skin tone." },
  home_staging:          { prompt: "Suggest virtual-staging recommendations for the room: furniture, lighting, palette.", visionRequired: true },
  home_palette:          { prompt: "Generate a coordinated color palette for this room.", visionRequired: true },
  home_furniture:        { prompt: "Recommend specific furniture pieces that fit the room's style and dimensions.", visionRequired: true },
  outfit_recommend:      { prompt: "Recommend a complete outfit based on the user's preferences and context.", visionRequired: false },
  capsule_wardrobe:      { prompt: "Build a capsule wardrobe (10-15 pieces) for the user's lifestyle." },
  beauty_recommend:      { prompt: "Recommend beauty products based on the user's profile and goals." },
  beauty_tutorial:       { prompt: "Write a step-by-step beauty tutorial for the requested look." },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const task = body?.task as string | undefined;
    const imageUrl = body?.imageUrl as string | undefined;
    const userPrompt = body?.prompt as string | undefined;
    const extras = body?.extras as Record<string, unknown> | undefined;

    if (!task) return json({ error: "Missing 'task' parameter" }, 400);

    const cfg = TASK_PROMPTS[task];
    if (!cfg) return json({ error: `Unknown task: ${task}` }, 400);

    if (cfg.visionRequired && !imageUrl) {
      return json({ error: `Task '${task}' requires imageUrl` }, 400);
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return json({ error: "AI service not configured" }, 503);

    log("invoke", { task, hasImage: !!imageUrl });

    // Build chat completion payload — vision uses image_url content blocks
    const userContent: any[] = [];
    if (userPrompt) userContent.push({ type: "text", text: userPrompt });
    if (extras) userContent.push({ type: "text", text: `Context: ${JSON.stringify(extras)}` });
    if (imageUrl) userContent.push({ type: "image_url", image_url: { url: imageUrl } });
    if (userContent.length === 0) userContent.push({ type: "text", text: "Proceed with the analysis." });

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: cfg.prompt },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (aiRes.status === 429) return json({ error: "Rate limit exceeded. Try again shortly." }, 429);
    if (aiRes.status === 402) return json({ error: "AI credits exhausted. Please add credits to continue." }, 402);
    if (!aiRes.ok) {
      const errText = await aiRes.text();
      log("ai-error", { status: aiRes.status, errText });
      return json({ error: "AI request failed" }, 502);
    }

    const data = await aiRes.json();
    const result = data?.choices?.[0]?.message?.content ?? "";

    return json({ result, text: result, task });
  } catch (e: any) {
    log("error", { msg: e?.message });
    return json({ error: e?.message ?? "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
