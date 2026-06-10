// One-off Stripe Checkout for Auction House "Buy Now" buyouts.
// Each auction has a unique buyout price → uses dynamic price_data.
// On success, verify-payment branch (product_type=auction_buyout) calls
// public.complete_auction_buyout RPC to mark the auction sold.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("auth required");

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authError || !user?.email) throw new Error("not authenticated");

    const { auction_id } = await req.json();
    if (!auction_id) throw new Error("auction_id required");

    // Service role to fetch the auction (RLS now allows this for active items anyway)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const { data: auction, error: aErr } = await supabaseAdmin
      .from("auction_items")
      .select("id, title, buyout_price, is_active, ends_at, user_id")
      .eq("id", auction_id)
      .maybeSingle();
    if (aErr) throw aErr;
    if (!auction) throw new Error("auction not found");
    if (!auction.is_active) throw new Error("auction inactive");
    if (new Date(auction.ends_at).getTime() <= Date.now()) throw new Error("auction ended");
    if (!auction.buyout_price) throw new Error("no buyout price");
    if (auction.user_id === user.id) throw new Error("cannot buy own auction");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Reuse customer if exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") ?? "https://uniqueapp.fun";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(Number(auction.buyout_price) * 100),
            product_data: {
              name: `Auction buyout: ${auction.title}`.slice(0, 250),
            },
          },
        },
      ],
      success_url: `${origin}/auction?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/auction?payment=canceled`,
      metadata: {
        product_type: "auction_buyout",
        auction_id: auction.id,
        winner_id: user.id,
        seller_id: auction.user_id,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
