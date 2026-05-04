import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { callOpenAI, corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";

/**
 * Universal astrology AI handler.
 * Accepts: { type, data } (current frontend) or legacy { action, ...fields }.
 * Server-side credit deduction — single source of truth.
 */

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
  numerology: 5,
  palmistry: 10,
  compatibility: 7,
  yes_no: 2,
  rune: 1,
  birth_chart: 20,
  daily_ritual: 1,
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
  compatibility: { system: "You are a relationship astrologer. Analyze compatibility between two signs. Return JSON: {score_0_100, emotional, intellectual, physical, long_term_potential, advice}.", json: true },
  transit: { system: "You are a transit astrologer. Describe current planetary transits and their effects. 4-6 sentences.", json: false },
  tarot: { system: "You are a tarot reader. Draw 3 cards (past/present/future) and interpret. Return JSON: {cards:[{name, position, meaning}], overall_message}.", json: true },
  numerology: { system: "You are a numerologist. Calculate life path and meaning. Return JSON: {life_path_number, soul_urge, personality, destiny, lucky_numbers[], summary}.", json: true },
  dream: { system: "You are a dream interpreter combining Jungian and mystical traditions. Interpret the dream symbolically. Return JSON: {symbols:[{symbol,meaning}], emotional_theme, message, advice}.", json: true },
  palmistry: { system: "You are a palmistry reader. Interpret palm lines from the image (or generic if no image). Return JSON: {life_line, heart_line, head_line, fate_line, summary}.", json: true },
  yes_no: { system: "You are a mystical oracle. Answer YES or NO with a 1-2 sentence cosmic reasoning. Return JSON: {answer:'yes'|'no'|'maybe', reasoning, confidence_0_100}.", json: true },
  rune: { system: "You are a Norse rune reader. Draw 1 rune and interpret. Return JSON: {rune_name, symbol, meaning, advice}.", json: true },
  daily_ritual: { system: "You are a mystical guide. Suggest a short daily ritual (3-5 sentences) including a mantra, color, and crystal.", json: false },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return errorResponse("Missing authorization", 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return errorResponse("Not authenticated", 401);

    const body = await req.json();
    // Support both { type, data } and legacy { action, ...fields }
    const rawType = String(body.type || body.action || "daily_horoscope");
    const type = rawType.replace(/-/g, "_");
    const data = body.data || body;

    const cost = CREDIT_COSTS[type] ?? 1;
    const config = SYSTEMS[type] || SYSTEMS.daily_horoscope;

    // ── Server-side credit check & deduct via service-role ──
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: row } = await adminClient
      .from("astrology_credits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const remaining = row?.credits_remaining ?? 0;
    if (remaining < cost) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits", required: cost, remaining }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context from data fields
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
      data.dreamDescription && `Dream: ${data.dreamDescription}`,
      data.question && `Question: ${data.question}`,
      data.cards && `Cards: ${JSON.stringify(data.cards)}`,
      data.prompt && `Prompt: ${data.prompt}`,
    ].filter(Boolean).join("\n");

    const result = await callOpenAI({
      system: config.system,
      user: contextParts || "Give me a reading",
      json: config.json,
      temperature: 0.85,
    });

    // Deduct credits AFTER successful AI call
    if (row) {
      await adminClient
        .from("astrology_credits")
        .update({
          credits_remaining: remaining - cost,
          total_credits_used: (row.total_credits_used ?? 0) + cost,
        })
        .eq("user_id", user.id);
    }

    return jsonResponse({
      success: true,
      type,
      action: type,
      cost,
      remaining: remaining - cost,
      result: config.json ? safeJson(result) : result,
      reading: result,
      text: result,
      response: result,
    });
  } catch (e: any) {
    return errorResponse(e?.message || "Astrology reading failed");
  }
});

function safeJson(s: string) { try { return JSON.parse(s); } catch { return null; } }
