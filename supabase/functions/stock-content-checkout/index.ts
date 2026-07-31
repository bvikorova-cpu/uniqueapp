// Self-contained one-off Stripe checkout for Stock Content purchases
// (asset price + platform license fee in a single transaction)
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, idempotency-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const {
      contentId,
      licenseType = "standard",
      resolution = "original",
      licenseFeeEur = 0,
      assetPriceEur = 0,
      totalEur,
      title,
    } = body ?? {};

    if (!contentId || typeof contentId !== "string") {
      return json({ error: "contentId is required" }, 400);
    }
    const total = Number(totalEur);
    if (!Number.isFinite(total) || total <= 0 || total > 10000) {
      return json({ error: "Invalid total amount" }, 400);
    }

    // Optional auth — pass email/id through when available
    let userEmail: string | undefined;
    let userId: string | undefined;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      );
      const { data } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userEmail = data.user?.email ?? undefined;
      userId = data.user?.id;
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Payments are not configured" }, 500);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      customerId = customers.data[0]?.id;
    }

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(total * 100),
            product_data: {
              name: `${title || "Stock content"} — ${licenseType} license`,
              description: `Asset €${Number(assetPriceEur).toFixed(2)} + ${licenseType} license €${Number(licenseFeeEur).toFixed(2)} (${resolution})`,
            },
          },
        },
      ],
      success_url: `${origin}/stock-content-library?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/stock-content-library?purchase=cancelled`,
      metadata: {
        productKey: "stock_content_purchase",
        content_id: contentId,
        license_type: String(licenseType),
        resolution: String(resolution),
        license_fee_eur: String(licenseFeeEur),
        asset_price_eur: String(assetPriceEur),
        total_eur: String(total),
        userId: userId ?? "",
      },
      client_reference_id: userId,
    });

    return json({ url: session.url, sessionId: session.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    console.error("stock-content-checkout error:", message);
    return json({ error: message }, 500);
  }
});
