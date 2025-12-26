import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { withRateLimit, RATE_LIMITS, addRateLimitHeaders, getIdentifier, checkRateLimit } from "../_shared/rate-limit.ts";

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

    // Rate limiting check
    const rateLimitResponse = await withRateLimit(
      req,
      RATE_LIMITS.checkout,
      corsHeaders,
      user.id
    );
    if (rateLimitResponse) return rateLimitResponse;

    // Get rate limit result for headers
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await checkRateLimit(identifier, RATE_LIMITS.checkout);

    const { package: packageType } = await req.json();

    // Credit packages in EUR
    const packages: Record<string, { credits: number; priceId: string; price: number }> = {
      small: { credits: 10, priceId: "price_1SWg02GaXSfGtYFtWl2vsqkz", price: 5.00 },
      medium: { credits: 20, priceId: "price_1SWg03GaXSfGtYFt8jap0rTG", price: 7.00 },
      large: { credits: 50, priceId: "price_1SWg03GaXSfGtYFt7edzn0gr", price: 10.00 },
    };

    const selectedPackage = packages[packageType];
    if (!selectedPackage) throw new Error("Invalid package");

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
          price: selectedPackage.priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/iq-platform?success=true`,
      cancel_url: `${req.headers.get("origin")}/iq-platform?canceled=true`,
      metadata: {
        user_id: user.id,
        credits: selectedPackage.credits.toString(),
        package: packageType,
      },
    });

    const responseHeaders = addRateLimitHeaders(
      { ...corsHeaders, "Content-Type": "application/json" },
      rateLimitResult,
      RATE_LIMITS.checkout
    );

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: responseHeaders,
        status: 200,
      }
    );
  } catch (error) {
    console.error("Purchase IQ credits error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
