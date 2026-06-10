// Stripe checkout for past_life_credits packs. Webhook + verify-payment handle topup
// via the shared past_life_credits CREDIT_TABLE_CONFIG mapping.
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Credit packs: 1 credit = 1 past-life reading
const PACKS: Record<string, { credits: number; amount: number; name: string }> = {
  "1":  { credits: 1,  amount: 499,  name: "1 Past-Life Reading" },
  "3":  { credits: 3,  amount: 1199, name: "3 Past-Life Readings" },
  "10": { credits: 10, amount: 2999, name: "10 Past-Life Readings" },
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
    const requested = body?.credits ?? body?.packKey ?? "1";
    const key = String(requested);
    const pack = PACKS[key] ?? PACKS["1"];

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: pack.name },
          unit_amount: pack.amount,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${origin}/past-life?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/past-life?canceled=true`,
      metadata: {
        user_id: user.id,
        credits: String(pack.credits),
        type: "past_life_credits",
        product: "past_life_credits",
        package_type: key,
      },
    });

    return json({ url: session.url, session_id: session.id });
  } catch (e) {
    console.error(e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
