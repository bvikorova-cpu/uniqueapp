import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PACKAGE_CONFIG = {
  basic: { duration: 30, price: 29 },
  premium: { duration: 60, price: 79 },
  featured: { duration: 90, price: 149 },
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PROPERTY-LISTING-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { propertyId, packageType } = await req.json();
    if (!propertyId || !packageType) throw new Error("Property ID and package type are required");
    if (!PACKAGE_CONFIG[packageType as keyof typeof PACKAGE_CONFIG]) {
      throw new Error("Invalid package type");
    }

    logStep("Request data", { propertyId, packageType });

    // Verify property ownership
    const { data: property, error: propertyError } = await supabaseClient
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('user_id', user.id)
      .single();

    if (propertyError || !property) throw new Error("Property not found or access denied");
    logStep("Property verified", { propertyId: property.id, title: property.title });

    const packageInfo = PACKAGE_CONFIG[packageType as keyof typeof PACKAGE_CONFIG];
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    logStep("Creating checkout session");

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: packageInfo.price * 100,
            product_data: {
              name: `${packageType.charAt(0).toUpperCase() + packageType.slice(1)} Property Listing`,
              description: `${packageInfo.duration} days listing for: ${property.title}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/property-marketplace?payment=success`,
      cancel_url: `${origin}/property-marketplace?payment=cancelled`,
      metadata: {
        user_id: user.id,
        property_id: propertyId,
        package_type: packageType,
        duration_days: packageInfo.duration.toString(),
        type: 'property_listing',
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Create listing package record
    const { error: packageError } = await supabaseClient
      .from('property_listing_packages')
      .insert({
        property_id: propertyId,
        user_id: user.id,
        package_type: packageType,
        price: packageInfo.price,
        duration_days: packageInfo.duration,
        stripe_session_id: session.id,
        payment_status: 'pending',
      });

    if (packageError) {
      logStep("Error creating package record", { error: packageError });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-property-listing-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
