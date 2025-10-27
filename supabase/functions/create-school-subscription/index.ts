import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

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
      apiVersion: "2025-08-27.basil",
    });

    // Stripe price IDs for each tier
    const priceIds = {
      kindergarten: "price_1SMprw0QTWhd4oRpQWjUkKA2",
      elementary: "price_1SMpsK0QTWhd4oRp7oXQpFXh",
      premium: "price_1SMpsg0QTWhd4oRpAIDNGOvv",
    };

    const tierMetadata = {
      kindergarten: { teachers: 1, pages: 100 },
      elementary: { teachers: 5, pages: 999999 },
      premium: { teachers: 15, pages: 999999 },
    };

    const selectedPriceId = priceIds[tier as keyof typeof priceIds];
    const metadata = tierMetadata[tier as keyof typeof tierMetadata];
    
    if (!selectedPriceId || !metadata) {
      throw new Error("Invalid tier selected");
    }

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/schools?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/schools?canceled=true`,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        tier: tier,
        teachers: metadata.teachers.toString(),
        pages: metadata.pages.toString(),
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
