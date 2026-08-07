// Guess My Age — hosted inside kids-router (new standalone functions cannot be
// created on this project, so the feature rides an existing router).
import { spendAiCredits } from "../_shared/spendCredits.ts";

const GUESS_COST = 1;
const POINTS_CORRECT = 10;
const POINTS_WRONG = 2;
const TOLERANCE = 2; // a guess within +/- 2 years counts as correct
const BUCKET = "guess-age-photos";

type Ctx = {
  admin: any;
  userId: string;
  json: (body: unknown, status?: number) => Response;
};

/** Handles `guessage.*` actions. Returns null when the action is not ours. */
export async function handleGuessAge(
  action: string,
  body: Record<string, any>,
  { admin, userId, json }: Ctx,
): Promise<Response | null> {
  if (!action.startsWith("guessage.")) return null;
  const sub = action.slice("guessage.".length);

  const signPhoto = async (path: string): Promise<string | null> => {
    const { data } = await admin.storage.from(BUCKET).createSignedUrl(path, 600);
    return data?.signedUrl ?? null;
  };

  if (sub === "deck") {
    const limit = Math.min(Math.max(Number(body.limit ?? 15), 1), 30);

    const { data: guessed } = await admin
      .from("guess_age_guesses")
      .select("photo_id")
      .eq("guesser_id", userId);
    const guessedPhotos = new Set(
      (guessed ?? []).map((g: any) => g.photo_id as string).filter(Boolean),
    );

    const { data: photos } = await admin
      .from("guess_age_photos")
      .select("id, user_id, photo_path, label")
      .eq("is_active", true)
      .neq("user_id", userId)
      .limit(300);

    // Nicknames come from the player profile row.
    const ownerIds = [...new Set((photos ?? []).map((p: any) => p.user_id as string))];
    const nameByUser = new Map<string, string>();
    if (ownerIds.length) {
      const { data: profs } = await admin
        .from("guess_age_profiles")
        .select("user_id, display_name")
        .in("user_id", ownerIds);
      for (const p of profs ?? []) {
        nameByUser.set(p.user_id as string, (p.display_name as string) || "Anonymous");
      }
    }

    const candidates = (photos ?? []).filter((p: any) => !guessedPhotos.has(p.id as string));
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
        .eq("photo_id", p.id as string);
      deck.push({
        photoId: p.id,
        userId: p.user_id,
        photoUrl,
        label: p.label ?? null,
        displayName: nameByUser.get(p.user_id as string) || "Anonymous",
        guessesCount: count ?? 0,
      });
    }

    return json({ deck, cost: GUESS_COST });
  }

  if (sub === "guess") {
    const photoId = String(body.photoId ?? "");
    const guessedAge = Number(body.guessedAge);
    if (!photoId) return json({ error: "Photo required" }, 400);
    if (!Number.isInteger(guessedAge) || guessedAge < 1 || guessedAge > 120) {
      return json({ error: "Guess must be between 1 and 120" }, 400);
    }

    const { data: photo } = await admin
      .from("guess_age_photos")
      .select("id, user_id, age_in_photo, is_active")
      .eq("id", photoId)
      .maybeSingle();
    if (!photo || !photo.is_active) return json({ error: "Photo not available" }, 404);
    if (photo.user_id === userId) return json({ error: "You cannot guess your own photo" }, 400);

    const { data: existing } = await admin
      .from("guess_age_guesses")
      .select("id")
      .eq("photo_id", photoId)
      .eq("guesser_id", userId)
      .maybeSingle();
    if (existing) return json({ error: "You already guessed this photo" }, 409);

    const spend = await spendAiCredits(admin, userId, GUESS_COST, "Guess My Age — guess", "guess-my-age");
    if (!spend.ok) {
      return json(
        { error: "Insufficient credits", code: "INSUFFICIENT_CREDITS", required: GUESS_COST, remaining: spend.remaining },
        402,
      );
    }

    const realAge = Number(photo.age_in_photo);
    const isCorrect = Math.abs(realAge - guessedAge) <= TOLERANCE;
    const points = isCorrect ? POINTS_CORRECT : POINTS_WRONG;

    await admin.from("guess_age_guesses").insert({
      profile_user_id: photo.user_id,
      photo_id: photoId,
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
      creditsSpent: GUESS_COST,
      creditsRemaining: spend.remaining,
    });
  }

  if (sub === "my_photos") {
    const { data: photos } = await admin
      .from("guess_age_photos")
      .select("id, photo_path, age_in_photo, label, is_active, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const list = [];
    for (const p of photos ?? []) {
      const { count } = await admin
        .from("guess_age_guesses")
        .select("id", { count: "exact", head: true })
        .eq("photo_id", p.id as string);
      const { count: correct } = await admin
        .from("guess_age_guesses")
        .select("id", { count: "exact", head: true })
        .eq("photo_id", p.id as string)
        .eq("is_correct", true);
      list.push({
        id: p.id,
        ageInPhoto: p.age_in_photo,
        label: p.label,
        isActive: p.is_active,
        photoUrl: await signPhoto(p.photo_path as string),
        guesses: count ?? 0,
        correct: correct ?? 0,
      });
    }
    return json({ photos: list });
  }

  if (sub === "add_photo") {
    const photoPath = String(body.photoPath ?? "");
    const ageInPhoto = Number(body.ageInPhoto);
    const label = body.label ? String(body.label).slice(0, 60) : null;
    if (!photoPath.startsWith(`${userId}/`)) return json({ error: "Invalid photo path" }, 400);
    if (!Number.isInteger(ageInPhoto) || ageInPhoto < 1 || ageInPhoto > 120) {
      return json({ error: "Age on the photo must be between 1 and 120" }, 400);
    }

    const { data: inserted, error } = await admin
      .from("guess_age_photos")
      .insert({ user_id: userId, photo_path: photoPath, age_in_photo: ageInPhoto, label, is_active: true })
      .select("id")
      .single();
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true, id: inserted?.id });
  }

  if (sub === "delete_photo") {
    const photoId = String(body.photoId ?? "");
    if (!photoId) return json({ error: "Photo required" }, 400);
    const { data: photo } = await admin
      .from("guess_age_photos")
      .select("id, user_id, photo_path")
      .eq("id", photoId)
      .maybeSingle();
    if (!photo || photo.user_id !== userId) return json({ error: "Photo not found" }, 404);
    await admin.from("guess_age_photos").delete().eq("id", photoId);
    try {
      await admin.storage.from(BUCKET).remove([photo.photo_path as string]);
    } catch { /* ignore storage cleanup errors */ }
    return json({ ok: true });
  }

  if (sub === "toggle_photo") {
    const photoId = String(body.photoId ?? "");
    const isActive = !!body.isActive;
    if (!photoId) return json({ error: "Photo required" }, 400);
    const { error } = await admin
      .from("guess_age_photos")
      .update({ is_active: isActive })
      .eq("id", photoId)
      .eq("user_id", userId);
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true, isActive });
  }

  if (sub === "my_state") {
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
}
