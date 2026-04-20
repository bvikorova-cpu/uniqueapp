import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { callOpenAI, corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";

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

    const { messages = [], message = "", sign } = await req.json();
    const recent = messages.slice(-8).map((m: any) => `${m.role}: ${m.content}`).join("\n");
    const userText = message || messages.slice(-1)[0]?.content || "Tell me about my day";

    const reply = await callOpenAI({
      system: `You are a wise astrologer. ${sign ? `User's sign: ${sign}.` : ""} Be warm, insightful, mystical. 1-4 sentences per reply.`,
      user: recent ? `${recent}\nuser: ${userText}` : userText,
      temperature: 0.85,
    });
    return jsonResponse({ reply, message: reply });
  } catch (e: any) {
    return errorResponse(e.message || "Astrology chat failed");
  }
});
