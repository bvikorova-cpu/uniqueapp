import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) throw new Error("Unauthorized");
    const userId = userData.user.id;

    const admin = createClient(supabaseUrl, serviceKey);

    // Ensure today's challenge exists
    await admin.rpc("generate_megatalent_daily_challenge");

    const { data: progressData, error: progErr } = await admin.rpc(
      "get_megatalent_challenge_progress",
      { _user_id: userId },
    );
    if (progErr) throw progErr;

    const challenge = (progressData as any)?.challenge;
    if (!challenge) {
      return new Response(JSON.stringify({ error: "No challenge today" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if ((progressData as any).completed) {
      return new Response(
        JSON.stringify({ already_claimed: true, bonus_votes: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const progress = (progressData as any).progress ?? 0;
    if (progress < challenge.requirement_value) {
      return new Response(
        JSON.stringify({
          error: "Challenge not completed yet",
          progress,
          required: challenge.requirement_value,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { error: insErr } = await admin
      .from("megatalent_challenge_completions")
      .insert({
        user_id: userId,
        challenge_id: challenge.id,
        bonus_votes_awarded: challenge.bonus_votes,
      });
    if (insErr && !insErr.message.includes("duplicate")) throw insErr;

    return new Response(
      JSON.stringify({ success: true, bonus_votes: challenge.bonus_votes }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("claim-megatalent-challenge error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
