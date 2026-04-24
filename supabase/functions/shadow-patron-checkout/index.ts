import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIERS = {
  bronze: { amount: 499, label: "Bronze Patron — €4.99/mo" },
  silver: { amount: 999, label: "Silver Patron — €9.99/mo" },
  gold: { amount: 1999, label: "Gold Patron — €19.99/mo" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { authorUserId, tier } = await req.json();
    if (!authorUserId || !TIERS[tier as keyof typeof TIERS]) throw new Error("Invalid tier");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const auth = req.headers.get("Authorization")!;
    const { data: { user } } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (!user?.email) throw new Error("Unauthorized");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-08-27.basil" });
    const tierData = TIERS[tier as keyof typeof TIERS];

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      mode: "subscription",
      line_items: [{
        price_data: {
          currency: "eur",
          recurring: { interval: "month" },
          product_data: { name: `Patron — ${tier.toUpperCase()}` },
          unit_amount: tierData.amount,
        },
        quantity: 1,
      }],
      metadata: {
        patron_user_id: user.id,
        author_user_id: authorUserId,
        tier,
      },
      success_url: `${req.headers.get("origin")}/shadow-arena/dashboard?patron=success`,
      cancel_url: `${req.headers.get("origin")}/shadow-arena/dashboard?patron=cancel`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
