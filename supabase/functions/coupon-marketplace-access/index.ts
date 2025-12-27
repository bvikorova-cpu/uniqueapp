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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;

    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    const { action } = await req.json();

    // Check if user already has access
    if (action === "check") {
      const { data: access } = await supabaseClient
        .from("coupon_marketplace_access")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      return new Response(JSON.stringify({ hasAccess: !!access }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create payment session for access
    if (action === "purchase") {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2023-10-16",
      });

      // Check for existing customer
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
              product_data: {
                name: "Coupon Marketplace Access",
                description: "Monthly subscription for Coupon Marketplace access",
              },
              unit_amount: 100, // 1 EUR in cents
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${req.headers.get("origin")}/coupon-marketplace?access=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get("origin")}/coupon-marketplace?access=cancelled`,
        metadata: {
          user_id: user.id,
          type: "coupon_marketplace_access",
        },
      });

      console.log("Created checkout session for coupon marketplace access:", session.id);

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Verify payment and grant access
    if (action === "verify") {
      const { sessionId } = await req.json();
      
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2023-10-16",
      });

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid" && session.metadata?.user_id === user.id) {
        // Check if already granted
        const { data: existing } = await supabaseClient
          .from("coupon_marketplace_access")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!existing) {
          const { error: insertError } = await supabaseClient
            .from("coupon_marketplace_access")
            .insert({
              user_id: user.id,
              stripe_session_id: sessionId,
              amount: 1.00,
            });

          if (insertError) {
            console.error("Error granting access:", insertError);
            throw insertError;
          }

          console.log("Granted coupon marketplace access to user:", user.id);
        }

        return new Response(JSON.stringify({ success: true, hasAccess: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      return new Response(JSON.stringify({ success: false, error: "Payment not verified" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    throw new Error("Invalid action");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in coupon-marketplace-access:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
