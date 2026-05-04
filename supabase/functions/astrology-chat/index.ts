import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { callOpenAI, corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";

const COST = 1; // mystic_chat

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return errorResponse("Missing authorization", 401);
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return errorResponse("Not authenticated", 401);

    const body = await req.json();
    const { messages = [], message = "", sign, deductCredit = true } = body;

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: row } = await adminClient
      .from("astrology_credits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const remaining = row?.credits_remaining ?? 0;
    if (deductCredit && remaining < COST) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits", required: COST, remaining }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recent = messages.slice(-8).map((m: any) => `${m.role}: ${m.content}`).join("\n");
    const userText = message || messages.slice(-1)[0]?.content || "Tell me about my day";

    const reply = await callOpenAI({
      system: `You are a wise astrologer. ${sign ? `User's sign: ${sign}.` : ""} Be warm, insightful, mystical. 1-4 sentences per reply.`,
      user: recent ? `${recent}\nuser: ${userText}` : userText,
      temperature: 0.85,
    });

    if (deductCredit && row) {
      await adminClient
        .from("astrology_credits")
        .update({
          credits_remaining: remaining - COST,
          total_credits_used: (row.total_credits_used ?? 0) + COST,
        })
        .eq("user_id", user.id);
    }

    return jsonResponse({
      reply,
      message: reply,
      response: reply,
      remaining: deductCredit ? remaining - COST : remaining,
    });
  } catch (e: any) {
    return errorResponse(e?.message || "Astrology chat failed");
  }
});
