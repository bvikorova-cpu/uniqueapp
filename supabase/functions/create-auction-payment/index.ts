import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ESCROW_HOLD_DAYS = 7;
const COMMISSION_RATE = 0.10; // 10% commission like bazaar

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUCTION-PAYMENT] ${step}${detailsStr}`);
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
    logStep("Starting auction payment with escrow");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { auctionId, paymentType } = await req.json(); // paymentType: 'bid' or 'buyout'
    logStep("Request data", { auctionId, paymentType, userId: user.id });

    // Get auction details
    const { data: auction, error: auctionError } = await supabaseClient
      .from("auction_items")
      .select("*")
      .eq("id", auctionId)
      .single();

    if (auctionError || !auction) throw new Error("Auction not found");
    if (!auction.is_active) throw new Error("Auction is not active");

    logStep("Auction found", { title: auction.title, currentPrice: auction.current_price });

    let totalAmount;
    if (paymentType === 'buyout') {
      if (!auction.buyout_price) throw new Error("Buyout not available");
      totalAmount = Number(auction.buyout_price);
    } else {
      totalAmount = Number(auction.current_price);
    }

    // Calculate commission (10%)
    const commissionAmount = totalAmount * COMMISSION_RATE;
    const sellerPayout = totalAmount - commissionAmount;

    logStep("Commission calculated", { totalAmount, commissionAmount, sellerPayout });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: Math.round(totalAmount * 100),
            product_data: {
              name: auction.title,
              description: `Auction ${paymentType}: ${auction.title} (with ${ESCROW_HOLD_DAYS}-day buyer protection)`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        capture_method: "automatic",
        metadata: {
          auction_id: auctionId,
          escrow_enabled: "true",
        },
      },
      success_url: `${req.headers.get("origin")}/auction?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/auction?payment=canceled`,
      client_reference_id: user.id,
      metadata: {
        auction_id: auctionId,
        item_type: "auction",
        payment_type: paymentType,
        seller_id: auction.user_id,
        winner_id: user.id,
        amount: totalAmount.toString(),
        commission_amount: commissionAmount.toString(),
        seller_payout: sellerPayout.toString(),
        escrow_enabled: "true",
        escrow_days: ESCROW_HOLD_DAYS.toString(),
      },
    });

    logStep("Checkout session created with escrow", { sessionId: session.id });

    // Update auction with session ID
    await supabaseClient
      .from("auction_items")
      .update({ stripe_session_id: session.id })
      .eq("id", auctionId);

    return new Response(JSON.stringify({ 
      url: session.url,
      escrowDays: ESCROW_HOLD_DAYS,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("ERROR", { error: error instanceof Error ? error.message : error });
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
