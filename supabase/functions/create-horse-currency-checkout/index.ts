import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PACKAGES: Record<
  string,
  { coins: number; gems: number; price: number; name: string }
> = {
  coins_100: { coins: 100, gems: 0, price: 1.99, name: "100 Horse Coins" },
  coins_500: { coins: 500, gems: 0, price: 8.99, name: "500 Horse Coins (Bonus)" },
  gems_50: { coins: 0, gems: 50, price: 4.99, name: "50 Horse Gems" },
  gems_200: { coins: 0, gems: 200, price: 18.99, name: "200 Horse Gems (Bonus)" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { packageType } = await req.json();
    const pkg = PACKAGES[packageType];
    if (!pkg) {
      return new Response(JSON.stringify({ error: "Invalid package" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      mode: "payment",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "eur",
          product_data: { name: pkg.name, description: "Horse Racing Arena currency" },
          unit_amount: Math.round(pkg.price * 100),
        },
      }],
      success_url: `${origin}/horse-racing?currency_purchased=true`,
      cancel_url: `${origin}/horse-racing?currency_canceled=true`,
      metadata: {
        user_id: user.id,
        package_type: packageType,
        coins: String(pkg.coins),
        gems: String(pkg.gems),
        feature: "horse_racing_currency",
      },
    });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    await admin.from("horse_currency_purchases").insert({
      user_id: user.id,
      package_type: packageType,
      coins_added: pkg.coins,
      gems_added: pkg.gems,
      amount_eur: pkg.price,
      stripe_session_id: session.id,
      status: "pending",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
