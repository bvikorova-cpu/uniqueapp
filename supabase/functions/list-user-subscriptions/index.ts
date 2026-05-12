// Universal billing endpoint for the logged-in user.
// Actions (via JSON body):
//   default / { action: "list" }            -> list subscriptions
//   { action: "list_invoices", limit? }     -> last N Stripe invoices (hosted url + PDF)
//   { action: "proration_preview", subscription_id, new_price_id }
//                                           -> upcoming-invoice proration amount in EUR
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (s: string, d?: unknown) =>
  console.log(`[LIST-SUBS] ${s}${d ? ` ${JSON.stringify(d)}` : ""}`);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ subscriptions: [], reason: "no-auth" }, 200);

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

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      return json({ subscriptions: [], invoices: [], customer_id: null }, 200);
    }
    const customerId = customers.data[0].id;

    const body = await req.json().catch(() => ({} as any));
    const action = body?.action ?? "list";

    // ---- ACTION: list_invoices ---------------------------------------------
    if (action === "list_invoices") {
      const limit = Math.min(Math.max(Number(body?.limit) || 12, 1), 50);
      const inv = await stripe.invoices.list({ customer: customerId, limit });
      const invoices = inv.data.map((i) => ({
        id: i.id,
        number: i.number,
        status: i.status,
        amount_paid: (i.amount_paid ?? 0) / 100,
        amount_due: (i.amount_due ?? 0) / 100,
        currency: (i.currency ?? "eur").toUpperCase(),
        created: new Date((i.created ?? 0) * 1000).toISOString(),
        period_start: i.period_start ? new Date(i.period_start * 1000).toISOString() : null,
        period_end: i.period_end ? new Date(i.period_end * 1000).toISOString() : null,
        hosted_invoice_url: i.hosted_invoice_url,
        invoice_pdf: i.invoice_pdf,
        description: i.description,
      }));
      log("invoices", { count: invoices.length });
      return json({ invoices, customer_id: customerId }, 200);
    }

    // ---- ACTION: proration_preview -----------------------------------------
    if (action === "proration_preview") {
      const subId = String(body?.subscription_id ?? "");
      const newPriceId = String(body?.new_price_id ?? "");
      if (!subId || !newPriceId) {
        return json({ error: "subscription_id and new_price_id required" }, 400);
      }
      const sub = await stripe.subscriptions.retrieve(subId);
      if (sub.customer !== customerId) {
        return json({ error: "Not your subscription" }, 403);
      }
      const itemId = sub.items.data[0]?.id;
      if (!itemId) return json({ error: "Subscription has no items" }, 400);

      // Use any-cast for retrieveUpcoming (typed differently across SDK versions)
      const upcoming: any = await (stripe.invoices as any).retrieveUpcoming({
        customer: customerId,
        subscription: subId,
        subscription_items: [{ id: itemId, price: newPriceId }],
        subscription_proration_behavior: "create_prorations",
      });

      const prorationItems = (upcoming.lines?.data ?? []).filter((l: any) => l.proration);
      const proration_total =
        prorationItems.reduce((s: number, l: any) => s + (l.amount ?? 0), 0) / 100;
      return json(
        {
          amount_due_now: (upcoming.amount_due ?? 0) / 100,
          subtotal: (upcoming.subtotal ?? 0) / 100,
          tax: (upcoming.tax ?? 0) / 100,
          total: (upcoming.total ?? 0) / 100,
          proration_total,
          currency: (upcoming.currency ?? "eur").toUpperCase(),
          period_end: upcoming.period_end
            ? new Date(upcoming.period_end * 1000).toISOString()
            : null,
          lines: (upcoming.lines?.data ?? []).map((l: any) => ({
            description: l.description,
            amount: (l.amount ?? 0) / 100,
            proration: !!l.proration,
          })),
        },
        200,
      );
    }

    // ---- DEFAULT: list subscriptions ---------------------------------------
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
          price_id: price?.id ?? null,
          product_id: typeof price?.product === "string" ? price.product : product?.id ?? null,
          product_name: product?.name ?? "Subscription",
          amount: price?.unit_amount ? price.unit_amount / 100 : 0,
          currency: price?.currency?.toUpperCase() ?? "EUR",
          interval: price?.recurring?.interval ?? "month",
        };
      })
      .sort((a, b) => {
        const order: Record<string, number> = {
          active: 0, trialing: 1, past_due: 2, unpaid: 3, canceled: 4,
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
