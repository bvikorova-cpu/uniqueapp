import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { duelId, answers, action } = await req.json();
    if (!duelId) {
      return new Response(JSON.stringify({ error: "duelId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: duel, error: fetchErr } = await svc.from("iq_duels").select("*").eq("id", duelId).single();
    if (fetchErr || !duel) return new Response(JSON.stringify({ error: "Duel not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const isHost = duel.host_id === user.id;
    const isOpponent = duel.opponent_id === user.id;
    if (!isHost && !isOpponent) {
      return new Response(JSON.stringify({ error: "Not your duel" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // CANCEL: only host, only while waiting → refund
    if (action === "cancel") {
      if (!isHost || duel.status !== "waiting") {
        return new Response(JSON.stringify({ error: "Cannot cancel" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      await svc.from("iq_duels").update({ status: "cancelled", finished_at: new Date().toISOString() }).eq("id", duelId).eq("status", "waiting");
      // Refund
      const { data: c } = await svc.from("iq_credits").select("balance").eq("user_id", user.id).maybeSingle();
      if (c) await svc.from("iq_credits").update({ balance: c.balance + duel.entry_fee }).eq("user_id", user.id);
      return new Response(JSON.stringify({ ok: true, refunded: duel.entry_fee }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // SUBMIT answers
    if (duel.status !== "active") {
      return new Response(JSON.stringify({ error: "Duel not active" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if ((isHost && duel.host_finished) || (isOpponent && duel.opponent_finished)) {
      return new Response(JSON.stringify({ error: "Already submitted" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Score: count correct answers
    const questions = duel.questions as Array<{ id: string; correct_answer: string }>;
    let score = 0;
    if (Array.isArray(answers)) {
      questions.forEach((q, i) => {
        if (answers[i] && String(answers[i]).toUpperCase() === q.correct_answer.toUpperCase()) score++;
      });
    }

    const update: Record<string, unknown> = isHost
      ? { host_score: score, host_finished: true }
      : { opponent_score: score, opponent_finished: true };

    const { data: updated } = await svc.from("iq_duels").update(update).eq("id", duelId).select().single();

    // If both finished → determine winner & award prize
    if (updated && updated.host_finished && updated.opponent_finished && updated.status === "active") {
      let winnerId: string | null = null;
      if (updated.host_score > updated.opponent_score) winnerId = updated.host_id;
      else if (updated.opponent_score > updated.host_score) winnerId = updated.opponent_id;
      // tie → no winner, no prize, both keep stake refunded? For now: no prize, no refund.

      await svc.from("iq_duels").update({
        status: "finished",
        winner_id: winnerId,
        finished_at: new Date().toISOString(),
      }).eq("id", duelId);

      if (winnerId) {
        const { data: wc } = await svc.from("iq_credits").select("balance").eq("user_id", winnerId).maybeSingle();
        if (wc) await svc.from("iq_credits").update({ balance: wc.balance + updated.prize }).eq("user_id", winnerId);
      }
    }

    return new Response(JSON.stringify({ ok: true, score }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
