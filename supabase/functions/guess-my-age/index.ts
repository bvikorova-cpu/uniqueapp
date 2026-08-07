// Guess My Age — swipe deck of real user selfies, 1 credit per guess.
// Correct guess = 10 points, wrong guess = 2 points.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { spendAiCredits } from "../_shared/spendCredits.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const GUESS_COST = 1;
const POINTS_CORRECT = 10;
const POINTS_WRONG = 2;
const TOLERANCE = 2; // a guess within +/- 2 years counts as correct
const BUCKET = "guess-age-photos";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);
    const userId = userData.user.id;

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");

    const signPhoto = async (path: string): Promise<string | null> => {
      const { data } = await admin.storage.from(BUCKET).createSignedUrl(path, 600);
      return data?.signedUrl ?? null;
    };

    // ---------------------------------------------------------------- deck
    if (action === "deck") {
      const limit = Math.min(Math.max(Number(body.limit ?? 15), 1), 30);

      const { data: guessed } = await admin
        .from("guess_age_guesses")
        .select("profile_user_id")
        .eq("guesser_id", userId);
      const excluded = new Set((guessed ?? []).map((g) => g.profile_user_id as string));
      excluded.add(userId);

      const { data: profiles } = await admin
        .from("guess_age_profiles")
        .select("user_id, photo_path, display_name")
        .eq("is_active", true)
        .limit(200);

      const candidates = (profiles ?? []).filter((p) => !excluded.has(p.user_id as string));
      // Shuffle so everybody sees a different order
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }

      const deck = [];
      for (const p of candidates.slice(0, limit)) {
        const photoUrl = await signPhoto(p.photo_path as string);
        if (!photoUrl) continue;
        const { count } = await admin
          .from("guess_age_guesses")
          .select("id", { count: "exact", head: true })
          .eq("profile_user_id", p.user_id as string);
        deck.push({
          userId: p.user_id,
          photoUrl,
          displayName: (p.display_name as string) || "Anonymous",
          guessesCount: count ?? 0,
        });
      }

      return json({ deck, cost: GUESS_COST });
    }

    // ---------------------------------------------------------------- guess
    if (action === "guess") {
      const profileUserId = String(body.profileUserId ?? "");
      const guessedAge = Number(body.guessedAge);
      if (!profileUserId) return json({ error: "Profile required" }, 400);
      if (!Number.isInteger(guessedAge) || guessedAge < 1 || guessedAge > 120) {
        return json({ error: "Guess must be between 1 and 120" }, 400);
      }
      if (profileUserId === userId) return json({ error: "You cannot guess your own age" }, 400);

      const { data: target } = await admin
        .from("guess_age_profiles")
        .select("real_age, is_active")
        .eq("user_id", profileUserId)
        .maybeSingle();
      if (!target || !target.is_active) return json({ error: "Profile not available" }, 404);

      const { data: existing } = await admin
        .from("guess_age_guesses")
        .select("id")
        .eq("profile_user_id", profileUserId)
        .eq("guesser_id", userId)
        .maybeSingle();
      if (existing) return json({ error: "You already guessed this player" }, 409);

      const err = await spendAiCredits(admin as never, userId, GUESS_COST, "Guess My Age — guess", "guess-my-age");
      if (!err.ok) {
        return json(
          { error: "Insufficient credits", code: "INSUFFICIENT_CREDITS", required: GUESS_COST, remaining: err.remaining },
          402,
        );
      }

      const realAge = Number(target.real_age);
      const isCorrect = Math.abs(realAge - guessedAge) <= TOLERANCE;
      const points = isCorrect ? POINTS_CORRECT : POINTS_WRONG;

      await admin.from("guess_age_guesses").insert({
        profile_user_id: profileUserId,
        guesser_id: userId,
        guessed_age: guessedAge,
        real_age: realAge,
        is_correct: isCorrect,
        points,
      });

      const { data: score } = await admin
        .from("guess_age_scores")
        .select("points, correct_guesses, total_guesses")
        .eq("user_id", userId)
        .maybeSingle();

      const next = {
        user_id: userId,
        points: (score?.points ?? 0) + points,
        correct_guesses: (score?.correct_guesses ?? 0) + (isCorrect ? 1 : 0),
        total_guesses: (score?.total_guesses ?? 0) + 1,
        updated_at: new Date().toISOString(),
      };
      if (score) {
        await admin.from("guess_age_scores").update(next).eq("user_id", userId);
      } else {
        await admin.from("guess_age_scores").insert(next);
      }

      return json({
        correct: isCorrect,
        realAge,
        guessedAge,
        points,
        tolerance: TOLERANCE,
        totalPoints: next.points,
        correctGuesses: next.correct_guesses,
        totalGuesses: next.total_guesses,
      });
    }

    // ---------------------------------------------------------------- my profile / stats
    if (action === "my_state") {
      const { data: profile } = await admin
        .from("guess_age_profiles")
        .select("real_age, photo_path, display_name, is_active")
        .eq("user_id", userId)
        .maybeSingle();
      const { data: score } = await admin
        .from("guess_age_scores")
        .select("points, correct_guesses, total_guesses")
        .eq("user_id", userId)
        .maybeSingle();
      const { count: receivedGuesses } = await admin
        .from("guess_age_guesses")
        .select("id", { count: "exact", head: true })
        .eq("profile_user_id", userId);
      const { count: receivedCorrect } = await admin
        .from("guess_age_guesses")
        .select("id", { count: "exact", head: true })
        .eq("profile_user_id", userId)
        .eq("is_correct", true);

      let photoUrl: string | null = null;
      if (profile?.photo_path) photoUrl = await signPhoto(profile.photo_path as string);

      return json({
        profile: profile
          ? {
              realAge: profile.real_age,
              displayName: profile.display_name,
              isActive: profile.is_active,
              photoUrl,
            }
          : null,
        score: {
          points: score?.points ?? 0,
          correctGuesses: score?.correct_guesses ?? 0,
          totalGuesses: score?.total_guesses ?? 0,
        },
        received: { total: receivedGuesses ?? 0, correct: receivedCorrect ?? 0 },
      });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("guess-my-age error", e);
    return json({ error: e instanceof Error ? e.message : "Internal error" }, 500);
  }
});
