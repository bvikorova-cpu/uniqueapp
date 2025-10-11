import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { itemId } = await req.json();

    // Get item details
    const { data: item, error: itemError } = await supabaseClient
      .from("bazaar_items")
      .select("*, profiles!bazaar_items_user_id_fkey(email)")
      .eq("id", itemId)
      .single();

    if (itemError || !item) throw new Error("Item not found");
    if (!item.is_active) throw new Error("Item is not available");

    const totalAmount = Number(item.price);
    const platformFee = 0.50; // Fixed €0.50 fee
    const sellerAmount = totalAmount - platformFee;

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
              name: item.title,
              description: `Bazaar item: ${item.title}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/bazaar?payment=success`,
      cancel_url: `${req.headers.get("origin")}/bazaar?payment=canceled`,
      metadata: {
        item_id: itemId,
        item_type: "bazaar",
        seller_id: item.user_id,
        platform_fee: platformFee.toString(),
        seller_amount: sellerAmount.toString(),
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-bazaar-payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
