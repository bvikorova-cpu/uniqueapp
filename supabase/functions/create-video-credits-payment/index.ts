// Stripe checkout for the separate Unlock Videos credit wallet (video_credits).
// verify-credits-payment tops up the `video_credits` table from the metadata.
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// 10 credits / €5 · 20 / €10 · 30 / €15
const PACKS: Record<string, { credits: number; amount: number; name: string }> = {
  "10": { credits: 10, amount: 500, name: "10 Video Credits" },
  "20": { credits: 20, amount: 1000, name: "20 Video Credits" },
  "30": { credits: 30, amount: 1500, name: "30 Video Credits" },
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
    const key = String(body?.credits ?? "10");
    const pack = PACKS[key];
    if (!pack) return json({ error: "Invalid pack" }, 400);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: pack.name },
            unit_amount: pack.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/unlock-videos?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/unlock-videos?canceled=true`,
      metadata: {
        user_id: user.id,
        credits: String(pack.credits),
        credit_type: "video_credits",
        type: "video_credits",
        product: "video_credits",
        package_type: key,
      },
    });

    return json({ url: session.url, session_id: session.id });
  } catch (e) {
    console.error(e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
