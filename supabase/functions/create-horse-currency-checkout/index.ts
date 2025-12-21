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

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { packageType } = await req.json();
    if (!packageType) throw new Error("Package type is required");

    const packages = {
      "coins_100": { priceId: "price_1SVWqd0QTWhd4oRpEiP83wdy", coins: 100, gems: 0 },
      "coins_500": { priceId: "price_1SVWqe0QTWhd4oRpgatxcQ5z", coins: 500, gems: 0 },
      "gems_50": { priceId: "price_1SVWqf0QTWhd4oRp73sWpTrT", coins: 0, gems: 50 },
      "gems_200": { priceId: "price_1SVWqg0QTWhd4oRp8h5TTRXW", coins: 0, gems: 200 },
    };

    const selectedPackage = packages[packageType as keyof typeof packages];
    if (!selectedPackage) throw new Error("Invalid package type");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
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
          price: selectedPackage.priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/horse-racing?payment=success`,
      cancel_url: `${req.headers.get("origin")}/horse-racing?payment=cancelled`,
      metadata: {
        user_id: user.id,
        coins: selectedPackage.coins.toString(),
        gems: selectedPackage.gems.toString(),
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error creating checkout:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
