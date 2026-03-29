import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    if (!user?.email) throw new Error("User not authenticated");

    const { itemId, shippingAddress, buyerNotes } = await req.json();

    const { data: item, error: itemError } = await supabaseClient
      .from("bazaar_items")
      .select("*")
      .eq("id", itemId)
      .single();

    if (itemError || !item) throw new Error("Item not found");
    if (item.is_sold) throw new Error("Item already sold");
    if (item.user_id === user.id) throw new Error("Cannot buy your own item");

    const commissionRate = 0.10;
    const amount = item.price;
    const commissionAmount = amount * commissionRate;
    const sellerPayout = amount - commissionAmount;

    // Create order record
    const { data: order, error: orderError } = await supabaseClient
      .from("bazaar_orders")
      .insert({
        item_id: itemId,
        buyer_id: user.id,
        seller_id: item.user_id,
        amount,
        commission_amount: commissionAmount,
        seller_payout: sellerPayout,
        shipping_address: shippingAddress,
        buyer_notes: buyerNotes,
        status: "pending"
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: item.title,
            description: "Bazaar item (price includes shipping)",
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/bazaar?payment=success&order_id=${order.id}`,
      cancel_url: `${req.headers.get("origin")}/bazaar?payment=cancelled`,
      metadata: {
        type: "bazaar_order",
        order_id: order.id,
        item_id: itemId,
        buyer_id: user.id,
        seller_id: item.user_id,
      },
    });

    await supabaseClient
      .from("bazaar_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return new Response(JSON.stringify({ url: session.url, orderId: order.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Checkout failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
