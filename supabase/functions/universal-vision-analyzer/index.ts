// Universal Vision Analyzer — handles all vision/image AI tasks via `task` param.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (s: string, d?: unknown) =>
  console.log(`[VISION] ${s}${d ? ` ${JSON.stringify(d)}` : ""}`);

// Per-task credit cost. Vision tasks default to 3 credits; heavy/premium tasks 5.
const TASK_COST: Record<string, number> = {
  antique_identify: 5, antique_forgery: 5, antique_provenance: 5, antique_certificate: 5,
  beauty_skin: 4, beauty_transform: 4, beauty_celebrity: 4, beauty_tutorial: 4, beauty_nail_art: 4, beauty_recommend: 4,
  home_staging: 4, home_palette: 4, home_furniture: 4,
  wine_label: 4, car_identify: 4, coin_identify: 4, landmark_identify: 4,
  math_solve: 4, homework_help: 4,
};
const DEFAULT_TASK_COST = 3;

const TASK_PROMPTS: Record<string, { prompt: string; visionRequired?: boolean }> = {
  // Analysis (vision)
  crystal_energy:        { prompt: "You are a crystal-energy expert. Analyze the crystal in the image: type, energetic properties, recommended chakra, healing uses. Be concise.", visionRequired: true },
  emotion:               { prompt: "You are an emotion-recognition expert. Detect the dominant emotion(s) in the image and explain visual cues.", visionRequired: true },
  message:               { prompt: "You analyze written messages for tone, intent, sentiment, and red flags." },
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
  outfit_recommend:      { prompt: "Recommend a complete outfit based on the user's preferences and context." },
  capsule_wardrobe:      { prompt: "Build a capsule wardrobe (10-15 pieces) for the user's lifestyle." },
  beauty_recommend:      { prompt: "Recommend beauty products based on the user's profile and goals." },
  beauty_tutorial:       { prompt: "Write a step-by-step beauty tutorial for the requested look." },

  // NEW specialized identifiers
  insect_identify:       { prompt: "You are an entomologist. Identify the insect/bug in the image: species, common name, habitat, dangerous? (bites/stings/disease), life cycle, recommended action if found at home.", visionRequired: true },
  coin_identify:         { prompt: "You are a numismatist. Identify the coin/currency: country, denomination, year (if visible), composition, mint mark, condition (Sheldon scale), estimated collector value range in EUR.", visionRequired: true },
  animal_breed:          { prompt: "You are a zoologist & breed expert. Identify the animal: species, breed, age estimate, temperament, care needs, common health issues.", visionRequired: true },
  rock_mineral:          { prompt: "You are a geologist. Identify the rock/mineral/crystal: name, classification (igneous/sedimentary/metamorphic), hardness (Mohs), formation, common locations, value if collectible.", visionRequired: true },
  mushroom_identify:     { prompt: "You are a mycologist. Identify the mushroom: species, edibility (EDIBLE / INEDIBLE / TOXIC / DEADLY — be cautious), look-alikes, habitat. ALWAYS warn never to eat wild mushrooms based on AI alone.", visionRequired: true },
  car_identify:          { prompt: "You are an automotive expert. Identify the vehicle: make, model, generation, estimated year range, trim if guessable, original MSRP, current used market value range in EUR.", visionRequired: true },
  logo_identify:         { prompt: "You are a brand/logo expert. Identify the logo or brand: company name, industry, country of origin, brief brand story, current market position.", visionRequired: true },
  landmark_identify:     { prompt: "You are a travel & history guide. Identify the landmark/place: name, location (city/country), historical significance, year built, architectural style, visitor info.", visionRequired: true },
  wine_label:            { prompt: "You are a sommelier. Identify the wine from the label: producer, region, varietal, vintage, style, tasting notes, estimated retail price range, food pairing.", visionRequired: true },
  calorie_scan:          { prompt: "You are a nutrition AI. Identify all visible foods on the plate. For each: name, portion size estimate, calories, macros (protein/carbs/fats). Provide total meal nutrition and a healthiness score 1-10.", visionRequired: true },
  drawing_identify:      { prompt: "You analyze sketches/drawings/doodles. Identify what the drawing represents, its style, possible meaning/symbolism, and skill level. Be encouraging.", visionRequired: true },
  math_solve:            { prompt: "You are a math tutor. Read the math problem from the image (or text) and solve it step-by-step. Show every step clearly using LaTeX-style formatting where useful, then give the final answer. If multiple problems are visible, solve each.", visionRequired: true },
  homework_help:         { prompt: "You are a patient tutor for any school subject. Read the homework question from the image and: 1) explain what is being asked, 2) walk through the solution step by step, 3) give the final answer, 4) add a brief tip to remember.", visionRequired: true },
  reverse_image_describe:{ prompt: "Describe this image in extreme detail so it can be used for reverse-image search: main subject, key visual features, colors, style, text/logos visible, likely category. Output 4-6 search-friendly keyword phrases at the end as 'Keywords: ...'.", visionRequired: true },
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
    if (cfg.visionRequired && !imageUrl) return json({ error: `Task '${task}' requires imageUrl` }, 400);

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return json({ error: "AI service not configured" }, 503);

    log("invoke", { task, hasImage: !!imageUrl });

    const userContent: any[] = [];
    if (userPrompt) userContent.push({ type: "text", text: userPrompt });
    if (extras) userContent.push({ type: "text", text: `Context: ${JSON.stringify(extras)}` });
    if (imageUrl) userContent.push({ type: "image_url", image_url: { url: imageUrl } });
    if (userContent.length === 0) userContent.push({ type: "text", text: "Proceed with the analysis." });

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: cfg.prompt }, { role: "user", content: userContent }],
      }),
    });

    if (aiRes.status === 429) return json({ error: "Rate limit exceeded. Try again shortly." }, 429);
    if (aiRes.status === 402) return json({ error: "AI credits exhausted." }, 402);
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
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
