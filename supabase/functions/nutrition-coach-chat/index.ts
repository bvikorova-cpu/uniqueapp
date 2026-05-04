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
    const creditDenied = await deductAICredits(user.id, 1, "nutrition-coach-chat");
    if (creditDenied) return creditDenied;

    const { messages = [] } = await req.json();
    const conversation = messages.slice(-10).map((m: any) => ({ role: m.role, content: m.content }));
    const lastUser = [...conversation].reverse().find((m: any) => m.role === "user")?.content || "Hi";
    const history = conversation.slice(0, -1).map((m: any) => `${m.role}: ${m.content}`).join("\n");

    const reply = await callOpenAI({
      system: "You are a certified nutrition coach. Give evidence-based advice on diet, macros, meal timing, supplements & fitness nutrition. Be friendly, specific, actionable. 2-5 sentences. Do not give medical diagnoses.",
      user: history ? `${history}\nuser: ${lastUser}` : lastUser,
      temperature: 0.7,
    });
    return jsonResponse({ reply, message: reply });
  } catch (e: any) {
    return errorResponse(e.message || "Nutrition coach failed");
  }
});
