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
    const denied = await deductAICredits(user.id, 5, "pet-training-planner");
    if (denied) return denied;

    const p = await req.json();
    const result = await callOpenAI({
      system: "You are a virtual-pet trainer. Build a 7-day actionable training plan tailored to the pet's stats and goal. Each day: focus, exercises, expected stat changes, mini-games to play. Use markdown with day headers.",
      user: `Pet: ${p.petName} (${p.species}), Level ${p.level}, XP ${p.experience}\nHappiness ${p.happiness}, Energy ${p.energy}, Hunger ${p.hunger}\nGoal: ${p.goal}\nRecord: ${p.battleWins}W/${p.battleLosses}L`,
      temperature: 0.7,
    });
    return jsonResponse({ result });
  } catch (e: any) {
    return errorResponse(e.message || "Training plan failed");
  }
});
