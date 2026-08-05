import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return json({ error: "unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const matchId = typeof body?.matchId === "string" ? body.matchId : null;
    if (!matchId) return json({ error: "matchId is required" }, 400);

    const admin = createClient(url, serviceKey);

    const { data: match, error: matchErr } = await admin
      .from("anonymous_dating_matches")
      .select("id, user1_id, user2_id, created_at, photo_unlocked_at, photo_reveal_days")
      .eq("id", matchId)
      .maybeSingle();

    if (matchErr) return json({ error: matchErr.message }, 500);
    if (!match || (match.user1_id !== user.id && match.user2_id !== user.id)) {
      return json({ error: "match_not_found" }, 404);
    }

    const revealDays = match.photo_reveal_days ?? 7;
    const unlockAt = new Date(
      new Date(match.created_at ?? Date.now()).getTime() + revealDays * 86_400_000,
    );
    const unlocked = !!match.photo_unlocked_at || Date.now() >= unlockAt.getTime();

    const partnerId = match.user1_id === user.id ? match.user2_id : match.user1_id;
    const { data: profile } = await admin
      .from("anonymous_dating_profiles")
      .select("photo_path")
      .eq("user_id", partnerId)
      .maybeSingle();

    const partnerHasPhoto = !!profile?.photo_path;

    if (!unlocked || !partnerHasPhoto) {
      return json({
        unlocked,
        partner_has_photo: partnerHasPhoto,
        unlock_at: unlockAt.toISOString(),
        url: null,
      });
    }

    const { data: signed, error: signErr } = await admin.storage
      .from("anonymous-date-photos")
      .createSignedUrl(profile!.photo_path as string, 300);

    if (signErr) return json({ error: signErr.message }, 500);

    return json({
      unlocked: true,
      partner_has_photo: true,
      unlock_at: unlockAt.toISOString(),
      url: signed?.signedUrl ?? null,
    });
  } catch (e) {
    return json({ error: (e as Error).message ?? "unexpected_error" }, 500);
  }
});
