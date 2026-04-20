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

    const { messages = [], message = "" } = await req.json();
    const userText = message || messages.slice(-1)[0]?.content || "Hello";
    const reply = await callOpenAI({
      system: "You are a quantum entity from a parallel dimension. Be mysterious, insightful, and use cosmic metaphors. Reply in 1-3 sentences.",
      user: userText,
      temperature: 1.0,
    });
    return jsonResponse({ reply, message: reply, response: reply });
  } catch (e: any) {
    return errorResponse(e.message || "Quantum chat failed");
  }
});
