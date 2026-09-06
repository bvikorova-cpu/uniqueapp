// Stripe checkout for Secret Santa credit packs.
// Fulfillment happens in stripe-webhook via metadata.type === "secret_santa_credits".
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const PACKAGES: Record<number, { price: number; label: string }> = {
  15:   { price: 5,   label: "Starter Pack" },
  30:   { price: 8,   label: "Basic Pack" },
  50:   { price: 12,  label: "Popular Pack" },
  100:  { price: 20,  label: "Value Pack" },
  200:  { price: 35,  label: "Pro Pack" },
  350:  { price: 55,  label: "Premium Pack" },
  500:  { price: 75,  label: "Elite Pack" },
  750:  { price: 100, label: "Diamond Pack" },
  1000: { price: 130, label: "Platinum Pack" },
  1500: { price: 180, label: "Ultimate Pack" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Stripe not configured" }, 500);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const auth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await auth.auth.getUser();
    const user = userData?.user;
    if (!user?.email) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const credits = Number(body?.credits);
    const pkg = PACKAGES[credits];
    if (!pkg) return json({ error: "Invalid credit package" }, 400);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const session = await stripe.checkout.sessions.create({
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      customer_email: user.email,
      line_items: [{
        price_data: {
          tax_behavior: "inclusive" as const,
          currency: "eur",
          product_data: { name: `Secret Santa ${pkg.label} – ${credits} credits` },
          unit_amount: Math.round(pkg.price * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${origin}/secret-santa?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/secret-santa?canceled=true`,
      metadata: {
        user_id: user.id,
        credits: String(credits),
        type: "secret_santa_credits",
        product: "secret_santa_credits",
      },
    });

    // Best-effort payment record for webhook idempotency
    try {
      const service = createClient(
        supabaseUrl,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );
      await service.from("payment_records").insert({
        user_id: user.id,
        stripe_session_id: session.id,
        amount: pkg.price,
        currency: "eur",
        status: "pending",
        metadata: { type: "secret_santa_credits", credits },
      });
    } catch (_) { /* ignore */ }

    return json({ url: session.url, session_id: session.id });
  } catch (e) {
    console.error("[create-secret-santa-payment]", e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
