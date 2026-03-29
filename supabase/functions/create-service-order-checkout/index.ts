import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COMMISSION_RATE = 0.15; // 15% platform commission

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    const { offeringId, requirements, deliveryDays, totalAmount } = await req.json();

    // Get offering details
    const { data: offering, error: offeringError } = await supabaseClient
      .from("skill_offerings")
      .select("*")
      .eq("id", offeringId)
      .single();

    if (offeringError || !offering) {
      throw new Error("Offering not found");
    }

    // Calculate commission
    const commissionAmount = Number((totalAmount * COMMISSION_RATE).toFixed(2));
    const sellerPayout = Number((totalAmount - commissionAmount).toFixed(2));
    const deliveryDeadline = new Date();
    deliveryDeadline.setDate(deliveryDeadline.getDate() + deliveryDays);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create pending order
    const { data: order, error: orderError } = await supabaseClient
      .from("service_orders")
      .insert({
        offering_id: offeringId,
        buyer_id: user.id,
        seller_id: offering.user_id,
        requirements,
        total_amount: totalAmount,
        commission_rate: COMMISSION_RATE,
        commission_amount: commissionAmount,
        seller_payout: sellerPayout,
        delivery_deadline: deliveryDeadline.toISOString(),
        status: "pending"
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error("Failed to create order");
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: offering.title,
              description: `Service order: ${requirements.substring(0, 100)}...`,
            },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/marketplace?order_success=${order.id}`,
      cancel_url: `${req.headers.get("origin")}/marketplace?order_cancelled=${order.id}`,
      metadata: {
        type: "service_order",
        order_id: order.id,
        seller_id: offering.user_id,
        commission_amount: commissionAmount.toString(),
        seller_payout: sellerPayout.toString(),
      },
    });

    // Update order with stripe session id
    await supabaseClient
      .from("service_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return new Response(JSON.stringify({ url: session.url, orderId: order.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
