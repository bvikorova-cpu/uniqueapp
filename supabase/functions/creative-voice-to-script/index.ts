import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { callCreativeAI, CreativeAIError } from "../_shared/creativeAI.ts";
import { getUnifiedAiCreditBalance, isInsufficientCreditsError, spendUnifiedAiCredits } from "../_shared/unifiedCredits.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

const VOICE_COST = 10;

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

    const { transcript, category } = await req.json();
    if (!transcript) return new Response(JSON.stringify({ error: "Missing transcript" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const credits = await getUnifiedAiCreditBalance(supabase, user.id);
    if (credits.total < VOICE_COST) {
      return new Response(JSON.stringify({ error: "INSUFFICIENT_CREDITS", required: VOICE_COST, available: credits.total }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const formats: Record<string, string> = { song_lyrics: "Format as song lyrics with [Verse], [Chorus], [Bridge] sections.",
      screenplay: "Format as Hollywood screenplay with INT./EXT. scene headings, character names in caps, action lines and dialogue.",
      theater_play: "Format as a theater play with stage directions in italics, ACT/SCENE numbering, and character dialogue.",
      novel_chapter: "Format as a polished novel chapter with descriptive prose and dialogue.",
      poetry: "Format as a structured poem with stanzas.",
      standup: "Format as a stand-up routine with setups and punchlines.",
      podcast_script: "Format as a podcast script with INTRO, SEGMENTS, and OUTRO.",
      ad_copy: "Format as persuasive ad copy with headline, body and CTA." };

    const systemPrompt = `You are a professional writer. Transform a brainstormed voice transcript (often messy, with um's and tangents) into a polished ${category.replace("_", " ")} draft.
${formats[category] || ""}
Extract the core idea, organize it cleanly, expand thin areas, and remove filler. Return ONLY the formatted draft.`;

    const scriptRaw = await callCreativeAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Voice transcript:\n\n${transcript}` },
    ]);

    const script = scriptRaw;

    const spendResult = await spendUnifiedAiCredits(supabase, user.id, VOICE_COST, "creative_forge_voice_to_script", "creative-voice-to-script");

    return new Response(JSON.stringify({ script, creditsUsed: VOICE_COST, creditsRemaining: spendResult.total, freeCreditsRemaining: spendResult.free, paidCreditsRemaining: spendResult.paid }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("voice-to-script error:", e);
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
