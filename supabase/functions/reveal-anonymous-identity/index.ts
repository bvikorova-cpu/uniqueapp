import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EARLY_REVEAL_COST = 15; // Credits to reveal before 7 days

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    const { matchId, earlyReveal = false } = await req.json();

    // Get match
    const { data: match } = await supabaseClient
      .from("anonymous_dating_matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (!match) {
      throw new Error("Match not found");
    }

    if (match.user1_id !== user.id && match.user2_id !== user.id) {
      throw new Error("Unauthorized");
    }

    const isUser1 = match.user1_id === user.id;
    const alreadyRevealed = isUser1 ? match.user1_revealed : match.user2_revealed;

    if (alreadyRevealed) {
      return new Response(
        JSON.stringify({ error: "You have already revealed your identity" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Check if 7 days passed
    const now = new Date();
    const expiresAt = new Date(match.expires_at);
    const sevenDaysPassed = now >= expiresAt;

    // If early reveal requested and time hasn't passed
    if (earlyReveal && !sevenDaysPassed) {
      // Check credits
      const { data: creditsData } = await supabaseClient
        .from("anonymous_dating_credits")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!creditsData || creditsData.credits_remaining < EARLY_REVEAL_COST) {
        return new Response(
          JSON.stringify({ 
            error: "Insufficient credits for early reveal", 
            required: EARLY_REVEAL_COST 
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      // Deduct credits
      await supabaseClient
        .from("anonymous_dating_credits")
        .update({ 
          credits_remaining: creditsData.credits_remaining - EARLY_REVEAL_COST 
        })
        .eq("user_id", user.id);
    } else if (!sevenDaysPassed && !earlyReveal) {
      return new Response(
        JSON.stringify({ 
          error: "Cannot reveal identity yet. Wait for 7 days or use early reveal." 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Update match with reveal
    const updateData: any = isUser1 
      ? { user1_revealed: true }
      : { user2_revealed: true };

    // If both revealed, update status
    const bothRevealed = (isUser1 && match.user2_revealed) || (!isUser1 && match.user1_revealed);
    if (bothRevealed) {
      updateData.status = "revealed";
      updateData.revealed_at = new Date().toISOString();
    }

    await supabaseClient
      .from("anonymous_dating_matches")
      .update(updateData)
      .eq("id", matchId);

    // Get partner profile info
    const partnerId = isUser1 ? match.user2_id : match.user1_id;
    const { data: partnerProfile } = await supabaseClient
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", partnerId)
      .single();

    return new Response(
      JSON.stringify({ 
        success: true,
        revealed: true,
        bothRevealed,
        partner: bothRevealed ? partnerProfile : null
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});