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
  "10": { credits: 10, amount: 299, name: "10 Emotion AI Credits" },
  "50": { credits: 50, amount: 999, name: "50 Emotion AI Credits" },
  "100": { credits: 100, amount: 1499, name: "100 Emotion AI Credits" },
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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: { user } } = await supa.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user?.email) throw new Error("Not authenticated");

    const { packageId } = await req.json();
    const pkg = PACKAGES[String(packageId)];
    if (!pkg) throw new Error("Invalid packageId");

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
        product_type: "emotion_credits",
        credits: String(pkg.credits),
        user_id: user.id,
      },
      success_url: `${origin}/emotion-economy?payment=success&credits=${pkg.credits}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/emotion-economy?payment=canceled`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[create-emotion-credits-payment]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
