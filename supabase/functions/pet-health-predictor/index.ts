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
    const denied = await deductAICredits(user.id, 8, "pet-health-predictor");
    if (denied) return denied;

    const p = await req.json();
    const result = await callOpenAI({
      system: "You are a virtual-pet veterinarian. Given current stats, predict the pet's health trajectory over the next N days. Cover: predicted happiness/energy/hunger trends, risk factors, recommended care actions per day, evolution readiness. Be specific. Use markdown.",
      user: `Pet: ${p.petName} (${p.species}), Level ${p.level}, XP ${p.experience}\nHappiness ${p.happiness}/100, Energy ${p.energy}/100, Hunger ${p.hunger}/100\nTimeframe: ${p.timeframeDays} days`,
      temperature: 0.6,
    });
    return jsonResponse({ result });
  } catch (e: any) {
    return errorResponse(e.message || "Health prediction failed");
  }
});
