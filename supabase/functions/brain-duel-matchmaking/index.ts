import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Not authenticated");

    const body = await req.json().catch(() => ({}));
    const { category, gameMode = "quick", challenge_id } = body as any;

    const fail = (msg: string, status = 400) =>
      new Response(JSON.stringify({ error: msg }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // ---- Friend challenge acceptance flow ----
    if (challenge_id) {
      const { data: challenge } = await supabase
        .from("brain_duel_friend_challenges")
        .select("*")
        .eq("id", challenge_id)
        .maybeSingle();
      if (!challenge) return fail("Challenge not found");
      if (challenge.challenged_id !== user.id) return fail("This challenge is not for you");
      if (challenge.status !== "pending") return fail("Challenge is no longer pending");
      if (challenge.expires_at && new Date(challenge.expires_at) < new Date()) {
        await supabase.from("brain_duel_friend_challenges").update({ status: "cancelled" }).eq("id", challenge_id);
        return fail("Challenge has expired");
      }

      const stake = challenge.stake_credits || 10;
      const { data: rows } = await supabase
        .from("ai_credits")
        .select("user_id, credits_remaining")
        .in("user_id", [challenge.challenger_id, challenge.challenged_id]);
      const bal = (id: string) => rows?.find((r: any) => r.user_id === id)?.credits_remaining ?? 0;

      if (bal(user.id) < stake) {
        return new Response(JSON.stringify({ error: `You need ${stake} credits to accept this challenge` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (bal(challenge.challenger_id) < stake) {
        await supabase.from("brain_duel_friend_challenges").update({ status: "cancelled" }).eq("id", challenge_id);
        return new Response(JSON.stringify({ error: "Challenger no longer has enough credits" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const deducted: string[] = [];
      for (const id of [challenge.challenger_id, challenge.challenged_id]) {
        const { data: ok, error: spendErr } = await supabase.rpc("deduct_ai_credits", {
          p_user_id: id,
          p_amount: stake,
          p_reason: "brain_duel_friend_challenge_entry",
          p_source: "brain_duel"
        });
        if (spendErr || ok === false) {
          // refund anyone already charged
          for (const rid of deducted) {
            await supabase.rpc("add_ai_credits", {
              p_user_id: rid, p_amount: stake,
              p_reason: "brain_duel_friend_challenge_refund", p_source: "brain_duel"
            }).catch?.(() => {});
          }
          console.error("friend challenge deduct failed", id, spendErr);
          return fail("Not enough credits to start this duel");
        }
        deducted.push(id);
      }

      const { data: fMatch, error: fErr } = await supabase
        .from("brain_duel_matches")
        .insert({ category: challenge.category || "General Knowledge",
          player1_id: challenge.challenger_id,
          player2_id: challenge.challenged_id,
          status: "ready",
          player1_score: 0,
          player2_score: 0,
          current_question_index: 0,
          total_questions: 10,
          game_mode: "friend",
          time_per_question: 30,
          entry_cost: stake,
          win_reward: stake * 2,
          started_at: new Date().toISOString() })
        .select()
        .single();
      if (fErr) throw fErr;

      await supabase.from("brain_duel_friend_challenges")
        .update({ status: "accepted", match_id: fMatch.id, accepted_at: new Date().toISOString() })
        .eq("id", challenge_id);

      return new Response(JSON.stringify({ match: fMatch, stake_amount: stake }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!category) throw new Error("Category required");

    const MODES: Record<string, { entry: number; reward: number; questions: number; time: number }> = {
      quick: { entry: 10, reward: 20, questions: 10, time: 30 },
      classic: { entry: 20, reward: 50, questions: 20, time: 30 },
      championship: { entry: 50, reward: 150, questions: 30, time: 24 },
      mystery: { entry: 30, reward: 90, questions: 10, time: 20 },
      blitz: { entry: 15, reward: 30, questions: 5, time: 10 },
      ranked: { entry: 20, reward: 40, questions: 10, time: 15 },
    };
    const cfg = MODES[gameMode] ?? MODES.quick;
    const entryCost = cfg.entry;
    const winReward = cfg.reward;
    const totalQuestions = cfg.questions;
    const timePerQuestion = cfg.time;

    // Check unified AI credits
    const { data: creditData } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    const currentCredits = creditData?.credits_remaining || 0;
    if (currentCredits < entryCost) {
      return new Response(JSON.stringify({ error: "Insufficient credits", required: entryCost, current: currentCredits }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: deducted, error: deductError } = await supabase.rpc("deduct_ai_credits", {
      p_user_id: user.id,
      p_amount: entryCost,
      p_reason: `brain_duel_${gameMode}_entry`,
      p_source: "brain_duel"
    });
    if (deductError || deducted === false) throw new Error("Insufficient credits");

    // Create match (solo vs AI bot)
    const { data: match, error: matchError } = await supabase
      .from("brain_duel_matches")
      .insert({ category,
        player1_id: user.id,
        player2_id: null,
        status: "ready",
        player1_score: 0,
        player2_score: 0,
        current_question_index: 0,
        total_questions: totalQuestions,
        game_mode: gameMode,
        time_per_question: timePerQuestion,
        entry_cost: entryCost,
        win_reward: winReward,
        started_at: new Date().toISOString() })
      .select()
      .single();

    if (matchError) throw matchError;

    return new Response(JSON.stringify({ match }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Matchmaking error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
