import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth client (verifies the caller's JWT)
  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );
  // Service-role client (bypasses RLS for the credit deduction & insert)
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseAuth.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { competitionId } = await req.json();
    if (!competitionId || typeof competitionId !== "string") {
      throw new Error("competitionId is required");
    }

    // Get competition details
    const { data: competition, error: compError } = await supabaseAdmin
      .from("iq_competitions")
      .select("*")
      .eq("id", competitionId)
      .single();

    if (compError) throw compError;
    if (competition.status !== "active") {
      throw new Error("Competition is not active");
    }

    // Check if already joined
    const { data: existingEntry } = await supabaseAdmin
      .from("iq_competition_participants")
      .select("id")
      .eq("competition_id", competitionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingEntry) {
      throw new Error("Already joined this competition");
    }

    // Count current participants
    const { count } = await supabaseAdmin
      .from("iq_competition_participants")
      .select("*", { count: "exact", head: true })
      .eq("competition_id", competitionId);

    if (count && count >= competition.max_participants) {
      throw new Error("Competition is full");
    }

    // Check user credits (correct column: balance)
    const { data: creditsData } = await supabaseAdmin
      .from("iq_credits")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    const currentCredits = creditsData?.balance ?? 0;
    if (currentCredits < competition.entry_fee) {
      throw new Error("Insufficient credits");
    }

    // Join competition (uses caller JWT so the RLS policy
    // `auth.uid() = user_id` is satisfied)
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: participation, error: participationError } = await supabaseUser
      .from("iq_competition_participants")
      .insert({ competition_id: competitionId, user_id: user.id })
      .select()
      .single();

    if (participationError) throw participationError;

    // Deduct entry fee via service role (clients can no longer write balance)
    if (creditsData) {
      await supabaseAdmin
        .from("iq_credits")
        .update({ balance: currentCredits - competition.entry_fee })
        .eq("user_id", user.id);
    } else {
      await supabaseAdmin
        .from("iq_credits")
        .insert({ user_id: user.id, balance: 0 });
      // (would-be-deduction blocked because user has no balance yet)
    }

    return new Response(
      JSON.stringify({
        success: true,
        participation: participation,
        message: "Successfully joined competition!",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
