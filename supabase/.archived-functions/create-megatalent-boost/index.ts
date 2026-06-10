import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("No auth");
    const { data: { user } } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) throw new Error("Unauthorized");

    const { submission_id, category } = await req.json();
    if (!submission_id || !category) throw new Error("Missing fields");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: "Megatalent Spotlight Boost (24h)" },
          unit_amount: 499,
        },
        quantity: 1,
      }],
      success_url: `${origin}/megatalent/${category}?boost=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/megatalent/${category}?boost=cancel`,
      metadata: { user_id: user.id, submission_id, category, kind: "megatalent_boost" },
    });

    await supabase.from("megatalent_boosts").insert({
      user_id: user.id,
      submission_id,
      category,
      amount_cents: 499,
      stripe_session_id: session.id,
      status: "pending",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
