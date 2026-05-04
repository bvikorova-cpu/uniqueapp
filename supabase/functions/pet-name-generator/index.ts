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
    const denied = await deductAICredits(user.id, 3, "pet-name-generator");
    if (denied) return denied;

    const { species = "", theme = "", personality = "" } = await req.json();
    const raw = await callOpenAI({
      system: "You are a creative pet-name generator. Output ONLY a JSON object {\"names\": [string,...]} with exactly 8 unique, original names.",
      user: `Species: ${species}\nTheme: ${theme || "any"}\nPersonality: ${personality || "any"}`,
      json: true,
      temperature: 0.9,
    });
    let names: string[] = [];
    try { names = JSON.parse(raw).names || []; } catch { names = []; }
    return jsonResponse({ names });
  } catch (e: any) {
    return errorResponse(e.message || "Name generation failed");
  }
});
