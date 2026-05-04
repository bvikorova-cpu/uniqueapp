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
    const denied = await deductAICredits(user.id, 6, "pet-story-generator");
    if (denied) return denied;

    const { pets = [], genre = "adventure", setting = "magical forest" } = await req.json();
    const cast = (pets as any[]).map((p) => `${p?.name} the ${p?.pet_types?.species || "pet"} (lvl ${p?.level})`).join(", ");
    const result = await callOpenAI({
      system: "You are a master storyteller for virtual pets. Write an engaging 600-900 word short story featuring the given pets. Vivid scenes, dialogue, satisfying ending. Use markdown with chapter headings.",
      user: `Cast: ${cast}\nGenre: ${genre}\nSetting: ${setting}`,
      temperature: 0.85,
    });
    return jsonResponse({ result });
  } catch (e: any) {
    return errorResponse(e.message || "Story generation failed");
  }
});
