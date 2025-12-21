import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BAZAAR-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting bazaar checkout");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data } = await supabaseClient.auth.getUser();
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { itemId } = await req.json();
    logStep("Request data", { itemId, userId: user.id });

    // Get item details
    const { data: item, error: itemError } = await supabaseClient
      .from("bazaar_items")
      .select("*")
      .eq("id", itemId)
      .single();

    if (itemError || !item) {
      logStep("Item not found", { itemId });
      throw new Error("Item not found");
    }

    if (item.is_sold) {
      logStep("Item already sold", { itemId });
      throw new Error("Item already sold");
    }

    if (item.user_id === user.id) {
      logStep("Cannot buy own item", { itemId });
      throw new Error("Cannot buy your own item");
    }

    logStep("Item retrieved", { title: item.title, price: item.price });

    // Calculate commission (10%)
    const commissionRate = 0.10;
    const amount = item.price;
    const commissionAmount = amount * commissionRate;
    const sellerPayout = amount - commissionAmount;

    logStep("Commission calculated", { amount, commissionAmount, sellerPayout });

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabaseClient
      .from("bazaar_transactions")
      .insert({
        item_id: itemId,
        buyer_id: user.id,
        seller_id: item.user_id,
        amount: amount,
        commission_amount: commissionAmount,
        commission_rate: commissionRate,
        seller_payout: sellerPayout,
        status: "pending"
      })
      .select()
      .single();

    if (transactionError) {
      logStep("Transaction creation failed", { error: transactionError });
      throw transactionError;
    }

    logStep("Transaction created", { transactionId: transaction.id });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer");
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: item.title,
              description: `Bazaar item purchase`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/bazaar?payment=success&session_id={CHECKOUT_SESSION_ID}&transaction_id=${transaction.id}`,
      cancel_url: `${req.headers.get("origin")}/bazaar?payment=cancelled`,
      metadata: {
        transaction_id: transaction.id,
        item_id: itemId,
        buyer_id: user.id,
        seller_id: item.user_id,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Update transaction with session ID
    await supabaseClient
      .from("bazaar_transactions")
      .update({ stripe_session_id: session.id })
      .eq("id", transaction.id);

    return new Response(JSON.stringify({ url: session.url, transactionId: transaction.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("ERROR", { error: error instanceof Error ? error.message : error });
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Checkout failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
