import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Package definitions with prices
const PACKAGES = {
  coins_100: { name: "100 GP Coins", coins: 100, gems: 0, priceInCents: 599 },
  coins_500: { name: "500 GP Coins", coins: 500, gems: 0, priceInCents: 1299 },
  coins_1000: { name: "1000 GP Coins", coins: 1000, gems: 0, priceInCents: 2299 },
  gems_50: { name: "50 GP Gems", coins: 0, gems: 50, priceInCents: 899 },
  gems_200: { name: "200 GP Gems", coins: 0, gems: 200, priceInCents: 2499 },
  bundle_starter: { name: "GP Starter Bundle", coins: 500, gems: 100, priceInCents: 1599 },
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-F1-CURRENCY-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data } = await supabaseClient.auth.getUser();
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { packageType } = await req.json();
    if (!packageType || !PACKAGES[packageType as keyof typeof PACKAGES]) {
      throw new Error("Invalid package type");
    }
    
    const selectedPackage = PACKAGES[packageType as keyof typeof PACKAGES];
    logStep("Package selected", { packageType, package: selectedPackage });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("Creating new customer");
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: selectedPackage.name,
              description: `F1 Racing Currency: ${selectedPackage.coins > 0 ? `${selectedPackage.coins} Coins` : ''}${selectedPackage.coins > 0 && selectedPackage.gems > 0 ? ' + ' : ''}${selectedPackage.gems > 0 ? `${selectedPackage.gems} Gems` : ''}`,
            },
            unit_amount: selectedPackage.priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/f1-racing?success=true&package=${packageType}`,
      cancel_url: `${req.headers.get("origin")}/f1-racing?canceled=true`,
      metadata: {
        user_id: user.id,
        package_type: packageType,
        coins: selectedPackage.coins.toString(),
        gems: selectedPackage.gems.toString(),
      },
    });
    logStep("Checkout session created", { sessionId: session.id });

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
