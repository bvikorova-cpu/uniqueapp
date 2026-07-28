import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Not authenticated");

    const { challenge_id } = await req.json();
    if (!challenge_id) throw new Error("challenge_id required");

    const { data: challenge, error: chErr } = await supabase
      .from("brain_duel_friend_challenges")
      .select("*")
      .eq("id", challenge_id)
      .maybeSingle();
    if (chErr) throw chErr;
    if (!challenge) throw new Error("Challenge not found");
    if (challenge.challenged_id !== user.id) throw new Error("This challenge is not for you");
    if (challenge.status !== "pending") throw new Error("Challenge is no longer pending");
    if (challenge.expires_at && new Date(challenge.expires_at) < new Date()) {
      await supabase.from("brain_duel_friend_challenges")
        .update({ status: "expired" }).eq("id", challenge_id);
      throw new Error("Challenge has expired");
    }

    const stake = challenge.stake_credits || 10;

    // Both players must be able to pay the stake
    const { data: creditRows } = await supabase
      .from("brain_duel_credits")
      .select("user_id, credits")
      .in("user_id", [challenge.challenger_id, challenge.challenged_id]);

    const balance = (id: string) =>
      creditRows?.find((c: any) => c.user_id === id)?.credits ?? 0;

    if (balance(user.id) < stake) {
      return new Response(
        JSON.stringify({ error: `You need ${stake} credits to accept this challenge` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (balance(challenge.challenger_id) < stake) {
      await supabase.from("brain_duel_friend_challenges")
        .update({ status: "cancelled" }).eq("id", challenge_id);
      return new Response(
        JSON.stringify({ error: "Challenger no longer has enough credits" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Deduct stake from both players (service role bypasses client-side triggers)
    for (const id of [challenge.challenger_id, challenge.challenged_id]) {
      await supabase
        .from("brain_duel_credits")
        .update({ credits: balance(id) - stake })
        .eq("user_id", id);
    }

    // Create the match
    const { data: match, error: matchError } = await supabase
      .from("brain_duel_matches")
      .insert({
        category: challenge.category || "General Knowledge",
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
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (matchError) throw matchError;

    await supabase
      .from("brain_duel_friend_challenges")
      .update({ status: "accepted", match_id: match.id, accepted_at: new Date().toISOString() })
      .eq("id", challenge_id);

    return new Response(
      JSON.stringify({ match, stake_amount: stake }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("friend-match error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
