import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { credits, price } = await req.json();

    if (!credits || !price) {
      throw new Error("Credits and price are required");
    }

    // Validate packages
    const validPackages = [
      { credits: 15, price: 5 },
      { credits: 30, price: 8 },
      { credits: 50, price: 12 },
      { credits: 100, price: 20 },
      { credits: 200, price: 35 },
      { credits: 350, price: 55 },
      { credits: 500, price: 75 },
      { credits: 750, price: 100 },
      { credits: 1000, price: 130 },
      { credits: 1500, price: 180 },
    ];

    const isValid = validPackages.some(p => p.credits === credits && p.price === price);
    if (!isValid) {
      throw new Error("Invalid package");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData } = await supabaseClient.auth.getUser();
    const user = userData.user;

    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check for existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://jufrdzeonywluwutvyxz.supabase.co";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Secret Santa 365 - ${credits} Credits`,
              description: `${credits} credits for sending digital gifts`,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/secret-santa?success=true&credits=${credits}`,
      cancel_url: `${origin}/secret-santa?canceled=true`,
      metadata: {
        user_id: user.id,
        credits: credits.toString(),
        type: "secret_santa_credits",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
