// Daily Spot the Lie challenge — generates one per day, lets user submit answers, updates leaderboard
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: auth } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const action = body.action || "get";
    const today = new Date().toISOString().slice(0, 10);

    if (action === "get") {
      // fetch today's challenge or generate
      let { data: ch } = await supabase.from("lie_daily_challenges").select("*").eq("challenge_date", today).maybeSingle();
      if (!ch) {
        const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
        if (!OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY not configured" }, 500);
        const resp = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You are a deception-detection trainer. Generate a 'Spot the Lie' challenge: a short scenario with 4 statements/messages where exactly ONE is a lie. JSON only." },
              { role: "user", content: `Create today's (${today}) challenge. Return JSON: scenario (string, 1-2 sentences setting context), options (array of 4 strings — short messages someone might send), correct_index (0-3, the one that's deceptive), explanation (why it's the lie, 1-2 sentences), difficulty ('easy'|'medium'|'hard').` },
            ],
            response_format: { type: "json_object" },
          }),
        });
        if (!resp.ok) return json({ error: "Generation failed" }, 500);
        const aj = await resp.json();
        const gen = JSON.parse(aj.choices[0].message.content);
        const { data: inserted, error: insErr } = await supabase.from("lie_daily_challenges").insert({
          challenge_date: today,
          scenario: gen.scenario,
          options: gen.options,
          correct_index: gen.correct_index,
          explanation: gen.explanation,
          difficulty: gen.difficulty || "medium",
        }).select().single();
        if (insErr) {
          // maybe race condition — refetch
          const { data: ch2 } = await supabase.from("lie_daily_challenges").select("*").eq("challenge_date", today).maybeSingle();
          ch = ch2;
        } else {
          ch = inserted;
        }
      }
      // attempt status
      const { data: attempt } = await supabase.from("lie_challenge_attempts")
        .select("*").eq("user_id", user.id).eq("challenge_id", ch!.id).maybeSingle();
      const safeChallenge = attempt
        ? ch
        : { ...ch, correct_index: undefined, explanation: undefined };
      return json({ challenge: safeChallenge, attempt });
    }

    if (action === "submit") {
      const { challenge_id, selected_index, time_taken_ms } = body;
      if (!challenge_id || selected_index == null) return json({ error: "challenge_id + selected_index required" }, 400);
      const { data: ch } = await supabase.from("lie_daily_challenges").select("*").eq("id", challenge_id).maybeSingle();
      if (!ch) return json({ error: "challenge not found" }, 404);
      const isCorrect = selected_index === ch.correct_index;
      const basePts = ch.difficulty === "hard" ? 30 : ch.difficulty === "easy" ? 10 : 20;
      const points = isCorrect ? basePts + Math.max(0, 10 - Math.floor((time_taken_ms || 0) / 3000)) : 0;

      const { error: aErr } = await supabase.from("lie_challenge_attempts").insert({
        user_id: user.id, challenge_id, selected_index, is_correct: isCorrect,
        time_taken_ms: time_taken_ms ?? null, points_earned: points,
      });
      if (aErr && !aErr.message.includes("duplicate")) return json({ error: aErr.message }, 400);

      // upsert leaderboard
      const { data: lb } = await supabase.from("lie_leaderboard").select("*").eq("user_id", user.id).maybeSingle();
      const newStreak = isCorrect ? (lb?.current_streak ?? 0) + 1 : 0;
      const best = Math.max(lb?.best_streak ?? 0, newStreak);
      if (lb) {
        await supabase.from("lie_leaderboard").update({
          total_points: (lb.total_points ?? 0) + points,
          correct_count: (lb.correct_count ?? 0) + (isCorrect ? 1 : 0),
          total_attempts: (lb.total_attempts ?? 0) + 1,
          current_streak: newStreak, best_streak: best, updated_at: new Date().toISOString(),
        }).eq("user_id", user.id);
      } else {
        await supabase.from("lie_leaderboard").insert({
          user_id: user.id, display_name: user.email?.split("@")[0] ?? "Detective",
          total_points: points, correct_count: isCorrect ? 1 : 0, total_attempts: 1,
          current_streak: newStreak, best_streak: best,
        });
      }
      return json({ correct: isCorrect, points, correct_index: ch.correct_index, explanation: ch.explanation });
    }

    return json({ error: "unknown action" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
function json(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
