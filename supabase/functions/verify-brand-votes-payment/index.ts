import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map price IDs to vote amounts
const VOTE_PACKAGES: Record<string, number> = {
  "price_1SSDabGaXSfGtYFtjBhb6kVr": 5,   // 2€ = 5 votes
  "price_1SSDacGaXSfGtYFtYnW8omLQ": 10,  // 3€ = 10 votes
  "price_1SSDadGaXSfGtYFthJDJ0sYd": 50,  // 10€ = 50 votes
  "price_1SSDmg0QTWhd4oRp8S8VrIeM": 100, // 20€ = 100 votes (bulk discount)
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");

    console.log(`Verifying payment for user ${user.id}, session: ${sessionId}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve session to verify payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== "paid") {
      console.log(`Payment not completed: ${session.payment_status}`);
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Payment not completed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get the price ID from the session
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
    const priceId = lineItems.data[0]?.price?.id;
    
    if (!priceId || !VOTE_PACKAGES[priceId]) {
      throw new Error("Invalid price ID");
    }

    const votesToAdd = VOTE_PACKAGES[priceId];
    console.log(`Adding ${votesToAdd} votes for price ${priceId}`);

    // Get or create today's vote tracking
    const today = new Date().toISOString().split('T')[0];
    const { data: voteTracking } = await supabaseClient
      .from("user_daily_votes")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    if (voteTracking) {
      // Update existing record
      const { error: updateError } = await supabaseClient
        .from("user_daily_votes")
        .update({
          votes_purchased: (voteTracking.votes_purchased || 0) + votesToAdd,
        })
        .eq("user_id", user.id)
        .eq("date", today);

      if (updateError) throw updateError;
    } else {
      // Create new record
      const { error: insertError } = await supabaseClient
        .from("user_daily_votes")
        .insert({
          user_id: user.id,
          date: today,
          votes_used: 0,
          votes_purchased: votesToAdd,
        });

      if (insertError) throw insertError;
    }

    console.log(`Successfully added ${votesToAdd} votes to user ${user.id}`);

    return new Response(JSON.stringify({ 
      success: true,
      votesAdded: votesToAdd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
