import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@14.21.0";

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
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    const { tier } = await req.json();
    console.log("Creating school subscription for user:", user.id, "tier:", tier);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const prices = {
      kindergarten: { 
        amount: 500, 
        teachers: 1,
        pages: 100,
        name: "Kindergarten Starter",
        description: "100 coloring pages per month + basic features"
      },
      elementary: { 
        amount: 1500,
        teachers: 5,
        pages: 999999,
        name: "Elementary Standard",
        description: "Unlimited pages + 5 teachers + bulk download"
      },
      premium: { 
        amount: 2500,
        teachers: 15,
        pages: 999999,
        name: "School Premium",
        description: "Unlimited pages + 15 teachers + AI generation + analytics"
      },
    };

    const selectedPrice = prices[tier as keyof typeof prices];
    if (!selectedPrice) {
      throw new Error("Invalid tier selected");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: selectedPrice.name,
              description: selectedPrice.description,
            },
            unit_amount: selectedPrice.amount,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/schools?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/schools?canceled=true`,
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        tier: tier,
        teachers: selectedPrice.teachers.toString(),
        pages: selectedPrice.pages.toString(),
        type: "school_subscription"
      },
    });

    console.log("Stripe session created:", session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error in create-school-subscription:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create subscription";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
