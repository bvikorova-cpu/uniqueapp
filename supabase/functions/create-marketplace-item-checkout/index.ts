import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-MARKETPLACE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("Buyer authenticated", { userId: user.id });

    const { item_id } = await req.json();
    if (!item_id) throw new Error("item_id is required");

    // Get item details
    const { data: item, error: itemError } = await supabaseClient
      .from('home_decor_items')
      .select('*')
      .eq('id', item_id)
      .single();

    if (itemError || !item) throw new Error("Item not found");
    logStep("Item found", { itemId: item.id, price: item.price, sellerId: item.user_id });

    if (item.user_id === user.id) {
      throw new Error("Cannot buy your own item");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Calculate commission (15%)
    const totalAmount = Math.round(item.price * 100); // convert to cents
    const commissionAmount = Math.round(totalAmount * 0.15);
    const sellerAmount = totalAmount - commissionAmount;

    logStep("Amount calculation", { totalAmount, commissionAmount, sellerAmount });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: item.title,
              description: item.description,
              images: item.image_url ? [item.image_url] : [],
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/home-decor?purchase_success=true&item_id=${item_id}`,
      cancel_url: `${req.headers.get("origin")}/home-decor?purchase_canceled=true`,
      metadata: {
        buyer_id: user.id,
        seller_id: item.user_id,
        item_id: item.id,
        type: 'marketplace_purchase',
        sale_price: item.price.toString(),
        commission_rate: "15",
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    // Create pending sale record
    await supabaseClient
      .from('home_decor_sales')
      .insert({
        item_id: item.id,
        buyer_id: user.id,
        seller_id: item.user_id,
        sale_price: item.price,
        commission_rate: 15,
        status: 'pending',
        stripe_session_id: session.id,
      });

    logStep("Sale record created");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
