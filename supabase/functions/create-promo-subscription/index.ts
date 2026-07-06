import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PRICE_IDS: Record<string, string> = {
  standard: "price_1TqKzpGaXSfGtYFtuzWHg5tu", // 20€/mo
  top: "price_1TqKzqGaXSfGtYFtxYmZzXuQ",      // 50€/mo
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr) throw new Error(userErr.message);
    const user = userData.user;
    if (!user?.email) throw new Error("Not authenticated");

    const body = await req.json().catch(() => ({}));
    const { listingId, tier } = body as { listingId?: string; tier?: string };
    if (!listingId) throw new Error("listingId is required");
    if (!tier || !(tier in PRICE_IDS)) throw new Error("Invalid tier");

    // Verify listing belongs to user
    const { data: listing, error: listErr } = await supabase
      .from("promo_listings")
      .select("id,user_id,tier")
      .eq("id", listingId)
      .maybeSingle();
    if (listErr) throw listErr;
    if (!listing || listing.user_id !== user.id) throw new Error("Listing not found");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      mode: "subscription",
      line_items: [{ price: PRICE_IDS[tier], quantity: 1 }],
      success_url: `${origin}/promotions/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/promotions/new?canceled=1`,
      metadata: { listingId, tier, user_id: user.id, product: "promo_listing" },
      subscription_data: {
        metadata: { listingId, tier, user_id: user.id, product: "promo_listing" },
      },
    });

    await supabase
      .from("promo_listings")
      .update({ stripe_session_id: session.id, tier })
      .eq("id", listingId);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
