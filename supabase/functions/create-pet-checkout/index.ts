// Pet Translator checkout — handles both subscription plans and one-off purchases.
// Detects price recurrence via Stripe and routes mode accordingly.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Allow-list of price IDs to prevent abuse (matches PetTranslatorPricing.tsx).
const ALLOWED_PRICES = new Set<string>([
  // Subscriptions
  "price_1SQDNZ0QTWhd4oRpHRPIDTTW", // Pet Parent €4.99
  "price_1SQDNuGaXSfGtYFt9o91SK2J", // Multi-Pet €8.99
  "price_1SQDOFGaXSfGtYFtDQsh6HlL", // Pet Psychologist €24.99
  // One-off
  "price_1SQDRRGaXSfGtYFts87Q1N9y", // Single translation €2
  "price_1TWBEFGaXSfGtYFtKH2ut18T", // Premium voice €14.99
]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { priceId } = await req.json();
    if (!priceId || typeof priceId !== "string" || !ALLOWED_PRICES.has(priceId)) {
      return new Response(JSON.stringify({ error: "Invalid priceId" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr) throw new Error(`Auth error: ${userErr.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Detect mode by fetching the Price object.
    const price = await stripe.prices.retrieve(priceId);
    const mode: "subscription" | "payment" = price.recurring ? "subscription" : "payment";

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";
    const successPath = mode === "subscription"
      ? `/pet-translator?subscription=success&session_id={CHECKOUT_SESSION_ID}`
      : `/pet-translator?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelPath = `/pet-translator-pricing?payment=canceled`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      success_url: `${origin}${successPath}`,
      cancel_url: `${origin}${cancelPath}`,
      allow_promotion_codes: true,
      metadata: { user_id: user.id, module: "pet_translator", price_id: priceId },
    });

    return new Response(JSON.stringify({ url: session.url, mode }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[CREATE-PET-CHECKOUT]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
