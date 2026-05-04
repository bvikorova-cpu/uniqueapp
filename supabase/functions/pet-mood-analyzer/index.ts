import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { callOpenAI, corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";
import { deductAICredits } from "../_shared/credits.ts";

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
    const denied = await deductAICredits(user.id, 4, "pet-mood-analyzer");
    if (denied) return denied;

    const pet = await req.json();
    const result = await callOpenAI({
      system: "You are a compassionate virtual-pet psychologist. Analyze the pet's current mood and emotional state. Return 4-6 short paragraphs: current mood, why, what owner should do today, signs to watch for. Use markdown bullet lists.",
      user: `Pet stats:\n- Name: ${pet.petName}\n- Species: ${pet.species}\n- Level: ${pet.level}\n- Happiness: ${pet.happiness}/100\n- Energy: ${pet.energy}/100\n- Hunger: ${pet.hunger}/100\n- Battles won/lost: ${pet.battleWins}/${pet.battleLosses}\n- Last fed: ${pet.lastFedAt}\n- Last played: ${pet.lastPlayedAt}`,
      temperature: 0.7,
    });
    return jsonResponse({ result });
  } catch (e: any) {
    return errorResponse(e.message || "Mood analysis failed");
  }
});
