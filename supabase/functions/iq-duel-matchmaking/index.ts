import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODE_CONFIG: Record<string, { questions: number; credits: number; difficulty: string }> = {
  quick:    { questions: 5,  credits: 3,  difficulty: "beginner" },
  standard: { questions: 10, credits: 5,  difficulty: "intermediate" },
  ranked:   { questions: 15, credits: 8,  difficulty: "intermediate" },
  blitz:    { questions: 20, credits: 10, difficulty: "advanced" },
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
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { mode } = await req.json();
    const cfg = MODE_CONFIG[mode];
    if (!cfg) {
      return new Response(JSON.stringify({ error: "Invalid mode" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const svc = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Check & deduct credits
    const { data: credits } = await svc.from("iq_credits").select("balance").eq("user_id", user.id).maybeSingle();
    if (!credits || credits.balance < cfg.credits) {
      return new Response(JSON.stringify({ error: "Insufficient credits" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Try to join an existing waiting duel (not own)
    const { data: waiting } = await svc
      .from("iq_duels")
      .select("*")
      .eq("mode", mode)
      .eq("status", "waiting")
      .neq("host_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (waiting) {
      // Atomic-ish join: only update if still waiting
      const { data: joined, error: joinErr } = await svc
        .from("iq_duels")
        .update({ opponent_id: user.id, status: "active", started_at: new Date().toISOString() })
        .eq("id", waiting.id)
        .eq("status", "waiting")
        .select()
        .single();
      if (joinErr || !joined) {
        return new Response(JSON.stringify({ error: "Duel was taken, try again" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      // Deduct credits
      await svc.from("iq_credits").update({ balance: credits.balance - cfg.credits }).eq("user_id", user.id);
      return new Response(JSON.stringify({ duel: joined, role: "opponent" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // No opponent: create new waiting duel & pick questions
    const { data: questions } = await svc
      .from("iq_questions")
      .select("id, question, option_a, option_b, option_c, option_d, correct_answer, time_limit")
      .eq("difficulty", cfg.difficulty)
      .limit(cfg.questions * 2);

    if (!questions || questions.length < cfg.questions) {
      return new Response(JSON.stringify({ error: "Not enough questions in pool" }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    // Shuffle & take N
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, cfg.questions);

    const { data: created, error: createErr } = await svc
      .from("iq_duels")
      .insert({
        mode,
        host_id: user.id,
        questions: shuffled,
        entry_fee: cfg.credits,
        prize: cfg.credits * 2,
      })
      .select()
      .single();
    if (createErr) throw createErr;

    await svc.from("iq_credits").update({ balance: credits.balance - cfg.credits }).eq("user_id", user.id);
    return new Response(JSON.stringify({ duel: created, role: "host" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
