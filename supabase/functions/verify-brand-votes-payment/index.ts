import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VOTE_PACKAGES: Record<string, number> = {
  "price_1SSDabGaXSfGtYFtjBhb6kVr": 5,
  "price_1SSDacGaXSfGtYFtYnW8omLQ": 10,
  "price_1SSDadGaXSfGtYFthJDJ0sYd": 50,
  "price_1SSDmg0QTWhd4oRp8S8VrIeM": 100,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");

    // Check idempotency - prevent double processing
    const { data: existing } = await supabaseAdmin
      .from("payment_verifications")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .single();

    if (existing?.payment_status === "completed") {
      return new Response(JSON.stringify({ 
        success: true, 
        votesAdded: 0,
        alreadyProcessed: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ success: false, message: "Payment not completed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (session.metadata?.user_id !== user.id) {
      throw new Error("Session does not belong to this user");
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
    const priceId = lineItems.data[0]?.price?.id;
    
    if (!priceId || !VOTE_PACKAGES[priceId]) {
      throw new Error("Invalid price ID");
    }

    const votesToAdd = VOTE_PACKAGES[priceId];

    // Record verification
    await supabaseAdmin.from("payment_verifications").upsert({
      stripe_session_id: sessionId,
      user_id: user.id,
      credit_type: "brand_battle_votes",
      credits_amount: votesToAdd,
      amount_paid: session.amount_total ? session.amount_total / 100 : 0,
      payment_status: "completed",
      processed_at: new Date().toISOString(),
    });

    // Add votes
    const today = new Date().toISOString().split('T')[0];
    const { data: voteTracking } = await supabaseAdmin
      .from("user_daily_votes")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    if (voteTracking) {
      await supabaseAdmin
        .from("user_daily_votes")
        .update({ votes_purchased: (voteTracking.votes_purchased || 0) + votesToAdd })
        .eq("user_id", user.id)
        .eq("date", today);
    } else {
      await supabaseAdmin
        .from("user_daily_votes")
        .insert({ user_id: user.id, date: today, votes_used: 0, votes_purchased: votesToAdd });
    }

    // Audit trail
    await supabaseAdmin.from("transactions").insert({
      user_id: user.id,
      transaction_type: "credit_purchase",
      amount: session.amount_total ? session.amount_total / 100 : 0,
      commission_rate: 0,
      commission_amount: 0,
      seller_amount: 0,
      status: "completed",
      item_type: "brand_battle_votes",
      stripe_session_id: sessionId,
    });

    return new Response(JSON.stringify({ success: true, votesAdded: votesToAdd }), {
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
