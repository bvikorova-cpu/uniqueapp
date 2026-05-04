import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { callOpenAI, corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";
import { deductAICredits } from "../_shared/credits.ts";

const SYSTEM = `Recommend supplements. Return JSON: {supplements:[{name, dose, timing, benefit, evidence_level}], avoid[], disclaimer}.`;

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
    const creditDenied = await deductAICredits(user.id, 3, "nutrition-supplement-advisor");
    if (creditDenied) return creditDenied;
    const body = await req.json();
    const userInput = JSON.stringify(body).slice(0, 4000);
    const result = await callOpenAI({ system: SYSTEM, user: userInput, json: true, temperature: 0.75 });
    let parsed = null;
    try { parsed = JSON.parse(result); } catch {}
    return jsonResponse({ success: true, result: parsed ?? result, data: parsed, text: result, reply: result });
  } catch (e: any) {
    return errorResponse(e.message || "Function failed");
  }
});
