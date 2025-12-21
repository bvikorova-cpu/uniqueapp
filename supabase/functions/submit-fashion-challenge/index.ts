import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { challengeId, designId } = await req.json();

    const { data } = await supabaseClient.auth.getUser();
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    console.log("Submitting design to challenge:", { challengeId, designId, userId: user.id });

    // Check if user already submitted to this challenge
    const { data: existing } = await supabaseClient
      .from('fashion_challenge_submissions')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      throw new Error("You have already submitted to this challenge");
    }

    // Check if challenge is still active
    const { data: challenge } = await supabaseClient
      .from('fashion_challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (!challenge || !challenge.is_active) {
      throw new Error("Challenge is not active");
    }

    if (new Date(challenge.end_date) < new Date()) {
      throw new Error("Challenge has ended");
    }

    // Create submission
    const { data: submission, error: submitError } = await supabaseClient
      .from('fashion_challenge_submissions')
      .insert({
        challenge_id: challengeId,
        user_id: user.id,
        design_id: designId,
        vote_count: 0
      })
      .select()
      .single();

    if (submitError) throw submitError;

    // Update challenge submission count
    await supabaseClient
      .from('fashion_challenges')
      .update({ total_submissions: (challenge.total_submissions || 0) + 1 })
      .eq('id', challengeId);

    console.log("Submission created:", submission.id);

    return new Response(JSON.stringify({ submission }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
