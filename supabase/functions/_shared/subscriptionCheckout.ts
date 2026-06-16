// Shared helper to create a Stripe subscription checkout session
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export interface CheckoutOptions {
  successPath: string;
  cancelPath: string;
  mode?: "subscription" | "payment";
  metadata?: Record<string, string>;
}

export async function createSubscriptionCheckout(
  req: Request,
  priceId: string,
  opts: CheckoutOptions,
) {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");
  if (!priceId) throw new Error("priceId required");

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("No authorization header");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );
  const { data: userData, error: userErr } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );
  if (userErr || !userData.user?.email) throw new Error("Not authenticated");

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const customers = await stripe.customers.list({ email: userData.user.email, limit: 1 });
  const customerId = customers.data[0]?.id;

  const origin = req.headers.get("origin") ?? "https://uniqueapp.fun";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    customer_email: customerId ? undefined : userData.user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: opts.mode ?? "subscription",
    success_url: `${origin}${opts.successPath}`,
    cancel_url: `${origin}${opts.cancelPath}`,
    metadata: { user_id: userData.user.id, ...(opts.metadata ?? {}) },
  });

  return { url: session.url };
}
