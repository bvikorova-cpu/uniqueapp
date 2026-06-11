import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// 85% creator / 15% platform — mirror src/lib/feeRates.ts
const PLATFORM_FEE_PCT = 15;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { tierId } = await req.json();
    if (!tierId) throw new Error("tierId required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");
    const { data: userData, error: userErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userData.user?.email) throw new Error("Not authenticated");
    const user = userData.user;

    const { data: tier, error: tierErr } = await supabase
      .from("creator_subscription_tiers")
      .select("id, creator_id, name, price, stripe_price_id, is_active")
      .eq("id", tierId)
      .maybeSingle();
    if (tierErr || !tier) throw new Error("Tier not found");
    if (!tier.is_active) throw new Error("Tier inactive");
    if (tier.creator_id === user.id) throw new Error("Cannot subscribe to yourself");

    // Look up creator's Stripe Connect account for destination charges.
    const { data: creatorProfile } = await supabase
      .from("profiles")
      .select("stripe_connect_account_id, stripe_connect_charges_enabled")
      .eq("id", tier.creator_id)
      .maybeSingle();

    const destinationAccount =
      creatorProfile?.stripe_connect_charges_enabled &&
      creatorProfile?.stripe_connect_account_id
        ? (creatorProfile.stripe_connect_account_id as string)
        : null;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") ?? "https://uniqueapp.fun";

    const lineItem = tier.stripe_price_id
      ? { price: tier.stripe_price_id as string, quantity: 1 }
      : {
          price_data: {
            currency: "eur",
            recurring: { interval: "month" as const },
            product_data: { name: `Creator tier: ${tier.name}` },
            unit_amount: Math.round(Number(tier.price) * 100),
          },
          quantity: 1,
        };

    const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
      metadata: {
        kind: "creator_subscription",
        tier_id: tier.id,
        creator_id: tier.creator_id,
        subscriber_id: user.id,
        platform_fee_pct: String(PLATFORM_FEE_PCT),
      },
    };

    if (destinationAccount) {
      subscriptionData.application_fee_percent = PLATFORM_FEE_PCT;
      subscriptionData.transfer_data = { destination: destinationAccount };
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      mode: "subscription",
      line_items: [lineItem],
      success_url: `${origin}/wall?creator_sub=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/wall?creator_sub=cancel`,
      subscription_data: subscriptionData,
      metadata: {
        kind: "creator_subscription",
        tier_id: tier.id,
        creator_id: tier.creator_id,
        subscriber_id: user.id,
        platform_fee_pct: String(PLATFORM_FEE_PCT),
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    );
  }
});
