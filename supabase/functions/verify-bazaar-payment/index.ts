import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-BAZAAR-PAYMENT] ${step}${detailsStr}`);
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
    logStep("Starting payment verification");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseAdmin.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { sessionId, transactionId } = await req.json();
    logStep("Request data", { sessionId, transactionId, userId: user.id });

    // Get transaction
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from("bazaar_transactions")
      .select(`
        *,
        bazaar_items (
          id,
          title,
          user_id
        )
      `)
      .eq("id", transactionId)
      .single();

    if (transactionError || !transaction) {
      logStep("Transaction not found", { transactionId });
      throw new Error("Transaction not found");
    }

    if (transaction.buyer_id !== user.id) {
      logStep("Unauthorized access", { transactionBuyerId: transaction.buyer_id, userId: user.id });
      throw new Error("Unauthorized");
    }

    if (transaction.status === "completed") {
      logStep("Transaction already completed", { transactionId });
      return new Response(JSON.stringify({ success: true, message: "Transaction already completed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Verify with Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Stripe session retrieved", { paymentStatus: session.payment_status, sessionId });

    if (session.payment_status !== "paid") {
      logStep("Payment not completed", { paymentStatus: session.payment_status });
      throw new Error("Payment not completed");
    }

    // Update transaction
    const { error: updateError } = await supabaseAdmin
      .from("bazaar_transactions")
      .update({
        status: "completed",
        stripe_payment_intent_id: session.payment_intent as string,
        payment_completed_at: new Date().toISOString(),
      })
      .eq("id", transactionId);

    if (updateError) {
      logStep("Transaction update failed", { error: updateError });
      throw updateError;
    }

    logStep("Transaction updated to completed");

    // Mark item as sold
    const { error: itemError } = await supabaseAdmin
      .from("bazaar_items")
      .update({ is_sold: true })
      .eq("id", transaction.item_id);

    if (itemError) {
      logStep("Item update failed", { error: itemError });
    } else {
      logStep("Item marked as sold");
    }

    // Create notifications for buyer and seller
    const item = transaction.bazaar_items as any;
    
    // Notification for buyer
    await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: transaction.buyer_id,
        type: "bazaar_purchase",
        title: "Nákup úspešný! 🎉",
        message: `Úspešne si zakúpil ${item.title} za €${transaction.amount.toFixed(2)}`,
        related_id: transaction.item_id,
      });

    logStep("Buyer notification created");

    // Notification for seller
    await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: transaction.seller_id,
        type: "bazaar_sale",
        title: "Predaná položka! 💰",
        message: `${item.title} bola predaná za €${transaction.amount.toFixed(2)}. Získavaš €${transaction.seller_payout.toFixed(2)} (po 10% provízii).`,
        related_id: transaction.item_id,
      });

    logStep("Seller notification created");

    return new Response(JSON.stringify({ 
      success: true, 
      transaction: {
        id: transaction.id,
        status: "completed",
        amount: transaction.amount,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("ERROR", { error: error instanceof Error ? error.message : error });
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Verification failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
