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
    const denied = await deductAICredits(user.id, 6, "pet-compatibility-checker");
    if (denied) return denied;

    const { pet1, pet2 } = await req.json();
    const result = await callOpenAI({
      system: "You are a virtual-pet compatibility analyst. Rate compatibility 0-100, list strengths, conflicts, breeding viability, and suggested bonding activities. Use markdown with a clear score header.",
      user: `Pet A: ${pet1?.name} (${pet1?.species}, lvl ${pet1?.level}, hap ${pet1?.happiness}, en ${pet1?.energy})\nPet B: ${pet2?.name} (${pet2?.species}, lvl ${pet2?.level}, hap ${pet2?.happiness}, en ${pet2?.energy})`,
      temperature: 0.7,
    });
    return jsonResponse({ result });
  } catch (e: any) {
    return errorResponse(e.message || "Compatibility check failed");
  }
});
