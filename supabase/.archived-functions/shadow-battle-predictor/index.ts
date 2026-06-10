import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PREDICT_COST = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(supabaseUrl, serviceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { battleId } = await req.json();
    if (!battleId) return new Response(JSON.stringify({ error: "Missing battleId" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: credits } = await supabase.from("shadow_arena_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!credits || credits.credits_remaining < PREDICT_COST) {
      return new Response(JSON.stringify({ error: "Insufficient credits", required: PREDICT_COST }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch battle context (best-effort - tables may not all exist)
    let battleInfo: any = null;
    let participants: any[] = [];
    try {
      const { data: b } = await supabase.from("shadow_battles").select("*").eq("id", battleId).maybeSingle();
      battleInfo = b;
    } catch (_) { /* ignore */ }

    try {
      const { data: parts } = await supabase
        .from("shadow_battle_participants")
        .select("*")
        .eq("battle_id", battleId)
        .limit(20);
      participants = parts || [];
    } catch (_) { /* ignore */ }

    // Try to get vote/gift sentiment
    let totalVotes = 0;
    try {
      const { count } = await supabase
        .from("shadow_battle_votes")
        .select("*", { count: "exact", head: true })
        .eq("battle_id", battleId);
      totalVotes = count || 0;
    } catch (_) { /* ignore */ }

    const context = {
      theme: battleInfo?.challenge_theme || "Unknown horror theme",
      status: battleInfo?.status || "unknown",
      prizePool: battleInfo?.total_prize_pool || 0,
      participantCount: participants.length,
      participantNames: participants.map((p: any) => p.username || p.user_id?.slice(0, 8) || "Anonymous").slice(0, 10),
      totalVoteSignals: totalVotes,
    };

    const systemPrompt = `You are an AI horror battle analyst. Analyze the battle context and predict the most likely winner.
Use storytelling craft, audience engagement signals, theme fit, and momentum.
Return JSON: {
  "predicted_winner_name": "name or 'Unknown contender'",
  "confidence_score": 0-100,
  "reasoning": "2-3 sentence analysis with dramatic flair",
  "factors": { "theme_fit": 0-100, "momentum": 0-100, "audience_pull": 0-100, "narrative_skill": 0-100 }
}`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Battle context: ${JSON.stringify(context)}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) return new Response(JSON.stringify({ error: "OpenAI rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("OpenAI API error");
    }

    const data = await aiResponse.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    const { data: saved } = await supabase.from("shadow_battle_predictions").insert({
      user_id: user.id,
      battle_id: battleId,
      predicted_winner_name: parsed.predicted_winner_name,
      confidence_score: parsed.confidence_score,
      reasoning: parsed.reasoning,
      factors: parsed.factors,
      credits_used: PREDICT_COST,
    }).select().single();

    await supabase.from("shadow_arena_credits").update({
      credits_remaining: credits.credits_remaining - PREDICT_COST,
      last_used_at: new Date().toISOString(),
    }).eq("user_id", user.id);

    return new Response(JSON.stringify({
      prediction: saved,
      creditsRemaining: credits.credits_remaining - PREDICT_COST,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("battle-predictor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
