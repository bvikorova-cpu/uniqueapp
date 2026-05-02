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

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  try {
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { confessionId, voteType } = await req.json();

    // Check if user has tokens
    const { data: tokenData } = await supabaseClient
      .from("absolution_tokens")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!tokenData || tokenData.tokens_remaining < 1) {
      throw new Error("Insufficient absolution tokens");
    }

    // Check if already voted
    const { data: existingVote } = await supabaseClient
      .from("absolution_votes")
      .select("*")
      .eq("confession_id", confessionId)
      .eq("voter_id", user.id)
      .single();

    if (existingVote) {
      throw new Error("Already voted on this confession");
    }

    // Insert vote
    await supabaseClient.from("absolution_votes").insert({
      confession_id: confessionId,
      voter_id: user.id,
      vote_type: voteType,
      tokens_spent: 1,
    });

    // Update token balance
    await supabaseClient
      .from("absolution_tokens")
      .update({
        tokens_remaining: tokenData.tokens_remaining - 1,
        tokens_used: tokenData.tokens_used + 1,
      })
      .eq("user_id", user.id);

    // Update confession vote counts
    const { data: confession } = await supabaseClient
      .from("confessions")
      .select("*")
      .eq("id", confessionId)
      .single();

    if (confession) {
      const updates = voteType === "absolve"
        ? { absolution_votes: confession.absolution_votes + 1 }
        : { condemnation_votes: confession.condemnation_votes + 1 };

      await supabaseClient
        .from("confessions")
        .update(updates)
        .eq("id", confessionId);
    }

    return new Response(
      JSON.stringify({ success: true, tokensRemaining: tokenData.tokens_remaining - 1 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});