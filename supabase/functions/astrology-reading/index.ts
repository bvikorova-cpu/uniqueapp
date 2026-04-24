import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { callOpenAI, corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";

/**
 * Universal astrology AI handler.
 * Actions: daily_horoscope, natal_chart, compatibility, transit, tarot, numerology
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return errorResponse("Missing authorization", 401);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse("Not authenticated", 401);

    const body = await req.json();
    const { action = "daily_horoscope", sign, birth_date, birth_time, birth_place, partner_sign, prompt = "" } = body;

    const contextParts = [
      sign && `Sun sign: ${sign}`,
      birth_date && `Born: ${birth_date}`,
      birth_time && `Time: ${birth_time}`,
      birth_place && `Place: ${birth_place}`,
      partner_sign && `Partner sign: ${partner_sign}`,
      prompt && `Question: ${prompt}`,
    ].filter(Boolean).join("\n");

    const systems: Record<string, string> = {
      daily_horoscope: "You are an expert astrologer. Give a vivid daily horoscope (4-6 sentences) covering love, career, energy, lucky color & number.",
      natal_chart: "You are a professional astrologer. Interpret the natal chart. Return JSON: {sun, moon, rising, dominant_planets[], life_themes[], strengths[], challenges[], spiritual_path}.",
      compatibility: "You are a relationship astrologer. Analyze compatibility between two signs. Return JSON: {score_0_100, emotional, intellectual, physical, long_term_potential, advice}.",
      transit: "You are a transit astrologer. Describe current planetary transits and their effects. 4-6 sentences.",
      tarot: "You are a tarot reader. Draw 3 cards (past/present/future) and interpret. Return JSON: {cards:[{name, position, meaning}], overall_message}.",
      numerology: "You are a numerologist. Calculate life path and meaning. Return JSON: {life_path_number, soul_urge, personality, destiny, lucky_numbers[]}.",
    };

    const actionKey = action.replace(/-/g, "_");
    const system = systems[actionKey] || systems.daily_horoscope;
    const wantsJson = ["natal_chart", "compatibility", "tarot", "numerology"].includes(actionKey);

    const result = await callOpenAI({
      system,
      user: contextParts || "Give me today's reading",
      json: wantsJson,
      temperature: 0.85,
    });

    return jsonResponse({
      success: true,
      action: actionKey,
      result: wantsJson ? safeJson(result) : result,
      reading: result,
      text: result,
    });
  } catch (e: any) {
    return errorResponse(e.message || "Astrology reading failed");
  }
});

function safeJson(s: string) { try { return JSON.parse(s); } catch { return null; } }
