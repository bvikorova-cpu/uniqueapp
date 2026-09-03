import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const CREDIT_COST = 3;

const TEST_CONFIG: Record<string, { difficulty?: string; category?: string; count: number }> = {
  beginner: { difficulty: "beginner", count: 30 },
  intermediate: { difficulty: "intermediate", count: 40 },
  advanced: { difficulty: "advanced", count: 50 },
  expert: { difficulty: "expert", count: 60 },
  logical: { category: "logical", count: 20 },
  spatial: { category: "spatial", count: 20 },
  verbal: { category: "verbal", count: 20 },
  numerical: { category: "numerical", count: 20 },
  memory: { category: "memory", count: 20 },
  pattern: { category: "pattern", count: 20 },
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user) return json({ error: "Not authenticated" }, 401);

    const { category } = await req.json().catch(() => ({ category: "" }));
    const config = TEST_CONFIG[String(category ?? "")];
    if (!config) return json({ error: "Invalid test category" }, 400);

    const { data: cooldown } = await admin.rpc("iq_test_cooldown_remaining", {
      _category: category,
    });
    if (Number(cooldown ?? 0) > 0) return json({ error: "Cooldown active" }, 409);

    let questionQuery = admin
      .from("iq_questions")
      .select("id,question,option_a,option_b,option_c,option_d,category,difficulty");
    if (config.difficulty) questionQuery = questionQuery.eq("difficulty", config.difficulty);
    if (config.category) questionQuery = questionQuery.eq("category", config.category);

    const { data: available, error: questionsError } = await questionQuery.limit(1000);
    if (questionsError) throw questionsError;
    if (!available || available.length < 5) return json({ error: "Not enough questions" }, 503);

    const { data: previousSessions } = await admin
      .from("iq_test_sessions")
      .select("question_ids")
      .eq("user_id", user.id)
      .eq("category", category)
      .limit(100);
    const seen = new Set((previousSessions ?? []).flatMap((session) => session.question_ids ?? []));
    const unseen = available.filter((question) => !seen.has(question.id));
    const pool = unseen.length >= Math.min(config.count, available.length) ? unseen : available;
    const questions = [...pool]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(config.count, pool.length));

    const { data: charged, error: chargeError } = await admin.rpc("deduct_ai_credits", {
      p_user_id: user.id,
      p_amount: CREDIT_COST,
      p_reason: `iq_test:${category}`,
      p_source: "iq_platform",
    });
    if (chargeError || charged === false) {
      return json({ error: "Insufficient credits", required: CREDIT_COST }, 402);
    }

    const { data: session, error: sessionError } = await admin
      .from("iq_test_sessions")
      .insert({
        user_id: user.id,
        category,
        question_ids: questions.map((question) => question.id),
        credits_spent: CREDIT_COST,
      })
      .select("id")
      .single();

    if (sessionError || !session) {
      await admin.rpc("add_ai_credits", {
        p_user_id: user.id,
        p_amount: CREDIT_COST,
        p_reason: `iq_test_refund:${category}`,
        p_source: "iq_platform",
      });
      throw sessionError ?? new Error("Could not create IQ test session");
    }

    return json({ session_id: session.id, questions, credits_spent: CREDIT_COST });
  } catch (error) {
    console.error("iq-start-test error", error);
    return json({ error: error instanceof Error ? error.message : "Could not start test" }, 500);
  }
});