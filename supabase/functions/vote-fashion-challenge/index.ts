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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { submissionId } = await req.json();

    console.log("Voting for submission:", { submissionId, userId: user.id });

    // Check if user already voted
    const { data: existingVote } = await supabaseClient
      .from('fashion_challenge_votes')
      .select('*')
      .eq('submission_id', submissionId)
      .eq('user_id', user.id)
      .single();

    if (existingVote) {
      // Remove vote
      await supabaseClient
        .from('fashion_challenge_votes')
        .delete()
        .eq('submission_id', submissionId)
        .eq('user_id', user.id);

      // Decrement vote count
      const { data: submission } = await supabaseClient
        .from('fashion_challenge_submissions')
        .select('vote_count')
        .eq('id', submissionId)
        .single();

      await supabaseClient
        .from('fashion_challenge_submissions')
        .update({ vote_count: Math.max(0, (submission?.vote_count || 1) - 1) })
        .eq('id', submissionId);

      console.log("Vote removed");
      return new Response(JSON.stringify({ voted: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      // Add vote
      await supabaseClient
        .from('fashion_challenge_votes')
        .insert({
          submission_id: submissionId,
          user_id: user.id
        });

      // Increment vote count
      const { data: submission } = await supabaseClient
        .from('fashion_challenge_submissions')
        .select('vote_count')
        .eq('id', submissionId)
        .single();

      await supabaseClient
        .from('fashion_challenge_submissions')
        .update({ vote_count: (submission?.vote_count || 0) + 1 })
        .eq('id', submissionId);

      console.log("Vote added");
      return new Response(JSON.stringify({ voted: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
