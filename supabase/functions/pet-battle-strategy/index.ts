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
    const denied = await deductAICredits(user.id, 4, "pet-battle-strategy");
    if (denied) return denied;

    const { pets = [] } = await req.json();
    const team = (pets as any[]).map((p) => `- ${p?.name} (${p?.pet_types?.species}, lvl ${p?.level}, hap ${p?.happiness}, en ${p?.energy}, ${p?.battle_wins || 0}W/${p?.battle_losses || 0}L)`).join("\n");
    const result = await callOpenAI({
      system: "You are an elite virtual-pet battle tactician. Build a winning battle strategy for the given team: optimal formation, lead/sweeper/tank roles, opening moves, counter-tactics, target priority. Use markdown.",
      user: `Team:\n${team}`,
      temperature: 0.6,
    });
    return jsonResponse({ result });
  } catch (e: any) {
    return errorResponse(e.message || "Battle strategy failed");
  }
});
