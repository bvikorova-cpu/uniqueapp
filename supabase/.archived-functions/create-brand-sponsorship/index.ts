import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TIER_PRICES = {
  bronze: "price_1SSD7e0QTWhd4oRpbo9399Fq",
  silver: "price_1SSD8C0QTWhd4oRpvFe7cP4z",
  gold: "price_1SSD8O0QTWhd4oRpihR2CucC",
  platinum: "price_1SSD8O0QTWhd4oRpD269KcUs",
  enterprise: "price_1TfxBOGaXSfGtYFtgWu0U3QY",
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

    const { tier, brandData } = await req.json();
    if (!tier || !TIER_PRICES[tier as keyof typeof TIER_PRICES]) {
      throw new Error("Invalid tier");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create or update brand sponsor entry
    const { data: existingSponsor } = await supabaseClient
      .from("brand_sponsors")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!existingSponsor && brandData) {
      await supabaseClient.from("brand_sponsors").insert({
        user_id: user.id,
        name: brandData.name,
        logo: brandData.logo,
        tier: tier,
        category: brandData.category,
        description: brandData.description,
        website: brandData.website,
        subscription_status: "pending",
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: TIER_PRICES[tier as keyof typeof TIER_PRICES],
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/brand-battle?success=true`,
      cancel_url: `${req.headers.get("origin")}/brand-battle?canceled=true`,
      metadata: {
        user_id: user.id,
        type: "brand_sponsorship",
        tier: tier,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});