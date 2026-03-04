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
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { merchId, quantity = 1 } = await req.json();
    if (!merchId) throw new Error("Missing merchId");

    // Get merch details
    const { data: merch, error: merchError } = await supabaseClient
      .from("creator_merch")
      .select("*")
      .eq("id", merchId)
      .eq("is_active", true)
      .single();

    if (merchError || !merch) throw new Error("Merch item not found");

    // Check stock
    if (merch.stock_quantity !== null && merch.stock_quantity < quantity) {
      throw new Error("Insufficient stock");
    }

    const totalAmount = merch.price * quantity;
    const platformFee = totalAmount * 0.1;
    const creatorPayout = totalAmount - platformFee;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: merch.name,
              description: merch.description || undefined,
              images: merch.image_url ? [merch.image_url] : undefined,
            },
            unit_amount: Math.round(merch.price * 100),
          },
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/creator/${merch.creator_id}?merch=success`,
      cancel_url: `${req.headers.get("origin")}/creator/${merch.creator_id}?merch=canceled`,
      metadata: {
        type: "merch_purchase",
        buyer_id: user.id,
        merch_id: merchId,
        creator_id: merch.creator_id,
        quantity: quantity.toString(),
        platform_fee: platformFee.toString(),
        creator_payout: creatorPayout.toString(),
      },
    };

    // Add shipping address collection for physical items
    if (!merch.is_digital) {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"],
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Create pending order record
    await supabaseClient.from("creator_merch_orders").insert({
      buyer_id: user.id,
      creator_id: merch.creator_id,
      merch_id: merchId,
      quantity: quantity,
      amount: totalAmount,
      platform_fee: platformFee,
      creator_payout: creatorPayout,
      stripe_session_id: session.id,
      status: "pending",
    });

    console.log(`[MERCH-CHECKOUT] Created checkout for user ${user.id} for merch ${merchId}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[MERCH-CHECKOUT] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
