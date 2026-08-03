import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Self-contained astrology/numerology AI handler.
// Lovable AI Gateway only. Unified ai_credits ledger.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const CREDIT_COSTS: Record<string, number> = {
  daily_horoscope: 1,
  horoscope: 1,
  weekly_horoscope: 3,
  monthly_horoscope: 8,
  yearly_horoscope: 25,
  tarot: 3,
  tarot_3: 3,
  tarot_5: 5,
  tarot_10: 10,
  tarot_premium: 15,
  dream: 5,
  numerology: 3,
  palmistry: 10,
  compatibility: 7,
  yes_no: 2,
  rune: 1,
  birth_chart: 20,
  daily_ritual: 3,
  natal_chart: 20,
  transit: 3,
};

const SYSTEMS: Record<string, { system: string; json: boolean }> = {
  daily_horoscope: { system: "You are an expert astrologer. Give a vivid daily horoscope (4-6 sentences) covering love, career, energy, lucky color & number.", json: false },
  weekly_horoscope: { system: "You are an expert astrologer. Give a 7-day weekly horoscope (6-10 sentences). Cover love, career, health, advice.", json: false },
  monthly_horoscope: { system: "You are an expert astrologer. Give a 30-day monthly horoscope (8-12 sentences). Phases, milestones, advice.", json: false },
  yearly_horoscope: { system: "You are an expert astrologer. Give a yearly forecast (10-15 sentences). Major themes per quarter, love, career, health.", json: false },
  natal_chart: { system: "You are a professional astrologer. Interpret the natal chart. Return JSON: {sun, moon, rising, dominant_planets[], life_themes[], strengths[], challenges[], spiritual_path}.", json: true },
  birth_chart: { system: "You are a professional astrologer. Interpret the natal chart. Return JSON: {sun, moon, rising, dominant_planets[], life_themes[], strengths[], challenges[], spiritual_path, summary}.", json: true },
  compatibility: { system: "You are a relationship astrologer. Analyze compatibility between the two signs in depth. Return JSON with EXACTLY these keys: {\"compatibilityScore\":number 0-100, \"analysis\":string, \"strengths\":[string], \"challenges\":[string], \"emotional\":string, \"intellectual\":string, \"physical\":string, \"communication\":string, \"longTermPotential\":string, \"advice\":string}. 'analysis' must be 6-9 rich sentences describing the elemental dynamic, attraction, daily life together and growth. Give 4-5 detailed strengths and 4-5 detailed challenges (each a full sentence, not a single word). 'emotional', 'intellectual', 'physical', 'communication' and 'longTermPotential' are each 2-3 sentences. 'advice' is 3-4 practical sentences. English only.", json: true },
  transit: { system: "You are a transit astrologer. Describe current planetary transits and their effects. 4-6 sentences.", json: false },
  tarot: { system: "You are a tarot reader. Draw 3 cards (past/present/future) and interpret. Return JSON: {cards:[{name, position, meaning}], overall_message}.", json: true },
  numerology: { system: "You are an expert numerologist. Using the provided numbers, write a warm, detailed reading. Return JSON: {interpretation, life_path_meaning, destiny_meaning, soul_urge_meaning, personality_meaning, lucky_numbers:[numbers], summary}. 'interpretation' must be 6-10 sentences of flowing text in English.", json: true },
  dream: { system: "You are a dream interpreter combining Jungian and mystical traditions. Interpret the dream symbolically. Return JSON: {symbols:[{symbol,meaning}], emotional_theme, message, advice}.", json: true },
  palmistry: { system: "You are a palmistry reader. Look carefully at the provided palm photo and interpret the visible lines. Return JSON: {life_line, heart_line, head_line, fate_line, summary}.", json: true },
  yes_no: { system: "You are a mystical oracle. Answer YES or NO with a 1-2 sentence cosmic reasoning. Return JSON: {answer:'yes'|'no'|'maybe', reasoning, confidence_0_100}.", json: true },
  rune: { system: "You are a Norse rune reader. Draw 1 rune and interpret. Return JSON: {rune_name, symbol, meaning, advice}.", json: true },
  daily_ritual: { system: "You are a mystical guide creating a daily ritual. Return JSON with EXACTLY these keys: {\"cardOfTheDay\":{\"name\":string,\"meaning\":string},\"luckyNumber\":number,\"affirmation\":string,\"cosmicEnergy\":string,\"elementOfTheDay\":string,\"moonPhase\":string}. cosmicEnergy is 1-3 words (e.g. 'High & Expansive'), moonPhase is the real current moon phase name, affirmation is one inspiring sentence.", json: true },
};

async function callGateway(system: string, user: string, wantJson: boolean, imageUrl?: string): Promise<string> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  let lastErr = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: wantJson ? `${system}\nRespond with valid JSON only.` : system },
          imageUrl
            ? {
                role: "user",
                content: [
                  { type: "text", text: user },
                  { type: "image_url", image_url: { url: imageUrl } },
                ],
              }
            : { role: "user", content: user },
        ],
        ...(wantJson ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content) return content as string;
      lastErr = "Empty AI response";
    } else {
      lastErr = await res.text();
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits.");
      if (res.status !== 429 && res.status < 500) throw new Error(lastErr || "AI request failed");
    }
    await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
  }
  throw new Error(lastErr || "AI request failed");
}

function safeJson(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    const m = s.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch { /* ignore */ } }
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !user) return json({ error: "Not authenticated" }, 401);

    const body = await req.json();
    const rawType = String(body.type || body.action || "daily_horoscope");
    const type = rawType.replace(/-/g, "_");
    const data = body.data || body;

    const cost = CREDIT_COSTS[type] ?? 1;
    const config = SYSTEMS[type] || SYSTEMS.daily_horoscope;

    const { data: creditRow } = await admin
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    const remaining = creditRow?.credits_remaining ?? 0;
    if (remaining < cost) {
      return json({ error: "Insufficient credits", required: cost, remaining }, 402);
    }

    const sign = data.sign || data.zodiacSign || data.sunSign;
    const contextParts = [
      sign && `Sun sign: ${sign}`,
      data.moonSign && `Moon sign: ${data.moonSign}`,
      data.risingSign && `Rising sign: ${data.risingSign}`,
      data.birthDate && `Born: ${data.birthDate}`,
      data.birthTime && `Time: ${data.birthTime}`,
      data.birthPlace && `Place: ${data.birthPlace}`,
      data.partner_sign && `Partner sign: ${data.partner_sign}`,
      data.sign1 && data.sign2 && `Person A: ${data.sign1}, Person B: ${data.sign2}`,
      data.fullName && `Name: ${data.fullName}`,
      data.lifePathNumber && `Life path number: ${data.lifePathNumber}`,
      data.destinyNumber && `Destiny number: ${data.destinyNumber}`,
      data.soulUrgeNumber && `Soul urge number: ${data.soulUrgeNumber}`,
      data.personalityNumber && `Personality number: ${data.personalityNumber}`,
      data.dreamDescription && `Dream: ${data.dreamDescription}`,
      data.question && `Question: ${data.question}`,
      data.cards && `Cards: ${JSON.stringify(data.cards)}`,
      data.prompt && `Prompt: ${data.prompt}`,
    ].filter(Boolean).join("\n");

    const palmImage = typeof data.imageBase64 === "string" && data.imageBase64.startsWith("data:")
      ? data.imageBase64
      : (typeof data.imageUrl === "string" && /^https?:\/\//.test(data.imageUrl) ? data.imageUrl : undefined);

    const raw = await callGateway(
      config.system,
      contextParts || (palmImage ? "Read this palm photo." : "Give me a reading"),
      config.json,
      type === "palmistry" ? palmImage : undefined,
    );
    const parsed = config.json ? safeJson(raw) : null;

    // Deduct AFTER a successful AI call (atomic, race-safe)
    const { error: deductErr } = await admin.rpc("deduct_ai_credits_atomic", {
      _user_id: user.id,
      _amount: cost,
    });
    if (deductErr) {
      const msg = deductErr.message || "";
      return json({ error: msg }, msg.includes("INSUFFICIENT_CREDITS") ? 402 : 500);
    }

    const interpretation =
      parsed?.interpretation ?? parsed?.summary ?? (typeof raw === "string" ? raw : "");
    const luckyNumbers = parsed?.lucky_numbers ?? parsed?.luckyNumbers ?? [];

    return json({
      ...(parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}),
      success: true,
      type,
      action: type,
      cost,
      credits_used: cost,
      remaining: Math.max(0, remaining - cost),
      result: parsed,
      interpretation,
      luckyNumbers,
      reading: raw,
      text: raw,
      response: raw,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Astrology reading failed";
    console.error("astrology-reading error:", message);
    return json({ error: message }, 500);
  }
});
