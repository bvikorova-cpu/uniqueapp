import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PACKAGES: Record<string, { credits: number; price: number; name: string }> = {
  starter: { credits: 25, price: 4.99, name: "25 Shadow AI Credits" },
  creator: { credits: 75, price: 12.99, name: "75 Shadow AI Credits" },
  pro: { credits: 200, price: 29.99, name: "200 Shadow AI Credits" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user || !user.email) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(supabaseUrl, serviceKey);
    const { packageId } = await req.json();
    const pkg = PACKAGES[packageId];
    if (!pkg) return new Response(JSON.stringify({ error: "Invalid package" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: pkg.name, description: "Shadow Arena AI Tools credits" },
          unit_amount: Math.round(pkg.price * 100),
        },
        quantity: 1,
      }],
      success_url: `${origin}/shadow-arena/dashboard?credits_purchased=true`,
      cancel_url: `${origin}/shadow-arena/dashboard?credits_canceled=true`,
      metadata: {
        user_id: user.id,
        package_id: packageId,
        credits: pkg.credits.toString(),
        feature: "shadow_arena_ai",
      },
    });

    await supabase.from("shadow_credit_purchases").insert({
      user_id: user.id,
      credits_purchased: pkg.credits,
      amount_eur: pkg.price,
      stripe_session_id: session.id,
      status: "pending",
    });

    return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("checkout error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
