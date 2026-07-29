import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { callCreativeAI, CreativeAIError } from "../_shared/creativeAI.ts";
import { getUnifiedAiCreditBalance, isInsufficientCreditsError, spendUnifiedAiCredits } from "../_shared/unifiedCredits.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

const MODERATOR_COST = 4;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(supabaseUrl, serviceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { roomId, action, prompt } = await req.json();
    if (!roomId) return new Response(JSON.stringify({ error: "Missing roomId" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Verify user is in the room
    const { data: room } = await supabase
      .from("creative_forge_rooms")
      .select("*")
      .eq("id", roomId)
      .maybeSingle();
    if (!room) return new Response(JSON.stringify({ error: "Room not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const credits = await getUnifiedAiCreditBalance(supabase, user.id);
    if (credits.total < MODERATOR_COST) {
      return new Response(JSON.stringify({ error: "INSUFFICIENT_CREDITS", required: MODERATOR_COST, available: credits.total }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get last 20 messages for context
    const { data: msgs } = await supabase
      .from("creative_forge_room_messages")
      .select("content, message_type")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(20);

    const conversationContext = (msgs || []).reverse().map((m: any) => `[${m.message_type}] ${m.content}`).join("\n");

    let systemPrompt = "";
    if (action === "moderate") {
      systemPrompt = `You are an AI moderator for a collaborative ${room.category} writing room called "${room.name}". 
Summarize the brainstorming so far, identify the strongest 2-3 ideas, and propose clear next steps. Be diplomatic and concise.`;
    } else if (action === "suggest") {
      systemPrompt = `You are an AI co-author. Based on the room's brainstorming and current draft, write a creative suggestion or short snippet (1-3 paragraphs).`;
    } else {
      systemPrompt = `You are an AI assistant in a collaborative writing room. Help with: ${prompt || "the discussion"}.`;
    }

    const aiContentRaw = await callCreativeAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Room: ${room.name}\nCategory: ${room.category}\nDescription: ${room.description || "none"}\n\nCurrent draft:\n${(room.current_content || "").slice(0, 2000)}\n\nRecent discussion:\n${conversationContext}\n\nUser prompt: ${prompt || "Help us"}` },
    ]);

    const aiContent = aiContentRaw;

    // Save AI message
    await supabase.from("creative_forge_room_messages").insert({
      room_id: roomId,
      user_id: user.id,
      message_type: "ai_" + (action || "chat"),
      content: aiContent,
      metadata: { triggered_by: user.id } });

    const spendResult = await spendUnifiedAiCredits(supabase, user.id, MODERATOR_COST, "creative_forge_room_ai", "creative-room-ai");

    return new Response(JSON.stringify({ content: aiContent, creditsUsed: MODERATOR_COST, creditsRemaining: spendResult.total, freeCreditsRemaining: spendResult.free, paidCreditsRemaining: spendResult.paid }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("room-ai error:", e);
    if (isInsufficientCreditsError(e)) {
      return new Response(JSON.stringify({ error: "INSUFFICIENT_CREDITS" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: e instanceof CreativeAIError ? e.status : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
