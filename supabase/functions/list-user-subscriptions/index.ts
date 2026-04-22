// Lists ALL active Stripe subscriptions for the logged-in user.
// Returns enough metadata to display in a billing dashboard.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (s: string, d?: unknown) =>
  console.log(`[LIST-SUBS] ${s}${d ? ` ${JSON.stringify(d)}` : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ subscriptions: [], reason: "no-auth" }, 200);
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseClient.auth.getUser(token);
    if (userErr || !userData.user?.email) {
      return json({ subscriptions: [], reason: "invalid-auth" }, 200);
    }
    const user = userData.user;
    log("user", { email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      return json({ subscriptions: [], customer_id: null }, 200);
    }
    const customerId = customers.data[0].id;

    // Fetch all (active + trialing + past_due + canceled-but-still-current)
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 50,
      expand: ["data.items.data.price.product"],
    });

    const result = subs.data
      .filter((s) =>
        ["active", "trialing", "past_due", "unpaid", "canceled"].includes(s.status),
      )
      .map((s) => {
        const item = s.items.data[0];
        const price = item?.price;
        const product = (price?.product as Stripe.Product | undefined) ?? null;
        return {
          id: s.id,
          status: s.status,
          cancel_at_period_end: s.cancel_at_period_end,
          current_period_end: (s as any).current_period_end
            ? new Date((s as any).current_period_end * 1000).toISOString()
            : null,
          canceled_at: s.canceled_at ? new Date(s.canceled_at * 1000).toISOString() : null,
          product_id: typeof price?.product === "string" ? price.product : product?.id ?? null,
          product_name: product?.name ?? "Subscription",
          amount: price?.unit_amount ? price.unit_amount / 100 : 0,
          currency: price?.currency?.toUpperCase() ?? "EUR",
          interval: price?.recurring?.interval ?? "month",
        };
      })
      // Active first, then by end date desc
      .sort((a, b) => {
        const order: Record<string, number> = {
          active: 0,
          trialing: 1,
          past_due: 2,
          unpaid: 3,
          canceled: 4,
        };
        return (order[a.status] ?? 9) - (order[b.status] ?? 9);
      });

    log("found", { count: result.length });
    return json({ subscriptions: result, customer_id: customerId }, 200);
  } catch (e: any) {
    log("ERROR", { msg: e.message });
    return json({ subscriptions: [], error: e.message }, 200);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
