import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { createEscrowHold, ESCROW_HOLD_DAYS } from "../_shared/escrow.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[BAZAAR-CHECKOUT] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Starting bazaar checkout with escrow");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user?.email) throw new Error("User not authenticated");

    const { itemId } = await req.json();
    logStep("Request data", { itemId, userId: user.id });

    // Get item details
    const { data: item, error: itemError } = await supabase
      .from("bazaar_items")
      .select("*")
      .eq("id", itemId)
      .single();

    if (itemError || !item) throw new Error("Item not found");
    if (item.is_sold) throw new Error("Item already sold");
    if (item.user_id === user.id) throw new Error("Cannot buy your own item");

    logStep("Item retrieved", { title: item.title, price: item.price });

    // Calculate commission (10%)
    const commissionRate = 0.10;
    const amount = item.price;
    const commissionAmount = amount * commissionRate;
    const sellerPayout = amount - commissionAmount;

    logStep("Commission calculated", { amount, commissionAmount, sellerPayout });

    // Create order record (escrow will be created after payment)
    const { data: order, error: orderError } = await supabase
      .from("bazaar_orders")
      .insert({
        item_id: itemId,
        buyer_id: user.id,
        seller_id: item.user_id,
        amount,
        commission_amount: commissionAmount,
        seller_payout: sellerPayout,
        status: "pending",
        escrow_status: "none",
      })
      .select()
      .single();

    if (orderError) throw orderError;
    logStep("Order created", { orderId: order.id });

    // Also create transaction record for compatibility
    const { data: transaction } = await supabase
      .from("bazaar_transactions")
      .insert({
        item_id: itemId,
        buyer_id: user.id,
        seller_id: item.user_id,
        amount,
        commission_amount: commissionAmount,
        commission_rate: commissionRate,
        seller_payout: sellerPayout,
        status: "pending",
      })
      .select()
      .single();

    // Link transaction to order
    if (transaction) {
      await supabase
        .from("bazaar_orders")
        .update({ transaction_id: transaction.id })
        .eq("id", order.id);
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    // Create checkout session with escrow metadata
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: item.title,
              description: `Bazaar purchase with ${ESCROW_HOLD_DAYS}-day buyer protection`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        capture_method: "automatic",
        metadata: {
          order_id: order.id,
          item_id: itemId,
          escrow_enabled: "true",
        },
      },
      success_url: `${req.headers.get("origin")}/bazaar/order/${order.id}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/bazaar?payment=cancelled`,
      metadata: {
        order_id: order.id,
        transaction_id: transaction?.id,
        item_id: itemId,
        buyer_id: user.id,
        seller_id: item.user_id,
        escrow_enabled: "true",
      },
    });

    logStep("Checkout session created with escrow", { sessionId: session.id });

    // Update order and transaction with session ID
    await supabase.from("bazaar_orders").update({ stripe_session_id: session.id }).eq("id", order.id);
    if (transaction) {
      await supabase.from("bazaar_transactions").update({ stripe_session_id: session.id }).eq("id", transaction.id);
    }

    return new Response(JSON.stringify({ 
      url: session.url, 
      orderId: order.id,
      transactionId: transaction?.id,
      escrowDays: ESCROW_HOLD_DAYS,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    logStep("ERROR", { error: error instanceof Error ? error.message : error });
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Checkout failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
