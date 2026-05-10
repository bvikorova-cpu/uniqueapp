import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Server-controlled price table (EUR cents). Never trust client-supplied amounts.
const PACKAGES: Record<string, { credits: number; amount: number; name: string }> = {
  "10": { credits: 10, amount: 800, name: "10 Video Ad Credits" },
  "25": { credits: 25, amount: 1800, name: "25 Video Ad Credits" },
  "50": { credits: 50, amount: 3000, name: "50 Video Ad Credits" },
  "100": { credits: 100, amount: 5500, name: "100 Video Ad Credits" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization required");
    const supa = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: { user } } = await supa.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user?.email) throw new Error("Not authenticated");

    const body = await req.json();
    // Hook may pass { credits } (number) or { packageId } — accept both.
    const key = String(body.packageId ?? body.credits ?? "");
    const pkg = PACKAGES[key];
    if (!pkg) throw new Error(`Invalid package: ${key}`);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: pkg.name },
          unit_amount: pkg.amount,
        },
        quantity: 1,
      }],
      mode: "payment",
      metadata: {
        product_type: "video_ad_credits",
        credit_type: "video_ad_credits",
        credits: String(pkg.credits),
        user_id: user.id,
      },
      success_url: `${origin}/video-ad-generator?payment=success&credits=${pkg.credits}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/video-ad-generator?payment=canceled`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[create-video-ad-credits-payment]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
