import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_APP_ORIGIN = "https://uniqueapp.fun";

function normalizeOrigin(value: string | null) {
  if (!value || value === "null") return DEFAULT_APP_ORIGIN;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.origin : DEFAULT_APP_ORIGIN;
  } catch {
    return DEFAULT_APP_ORIGIN;
  }
}

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Missing authorization header" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: userData, error: userErr } = await admin.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    const user = userData?.user;
    if (userErr || !user) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const creatorId = String(body?.creatorId || "");
    if (!creatorId) return json({ error: "creatorId required" }, 400);
    if (creatorId === user.id) return json({ error: "Cannot tip yourself" }, 400);

    const amt = Number(body?.amountCents);
    if (!Number.isFinite(amt) || amt < 100 || amt > 50000) {
      return json({ error: "Tips must be €1 – €500." }, 400);
    }

    const safeMessage = typeof body?.message === "string" ? body.message.slice(0, 280) : null;
    const categorySlug = body?.categorySlug ? String(body.categorySlug) : "";
    const platformFee = Math.round(amt * 0.2);
    const creatorAmount = amt - platformFee;
    const origin = normalizeOrigin(req.headers.get("origin"));

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Payments are not configured" }, 500);
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email ?? undefined,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Megatalent Tip",
              description: safeMessage ?? `Support for talent ${creatorId.slice(0, 8)}`,
            },
            unit_amount: amt,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/megatalent?tip=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/megatalent?tip=cancel`,
      metadata: {
        type: "megatalent_tip",
        product: "megatalent_tip",
        creatorId,
        tipperId: user.id,
        categorySlug,
      },
    });

    const { error: insertErr } = await admin.from("megatalent_tips").insert({
      creator_id: creatorId,
      tipper_id: user.id,
      category_slug: categorySlug || null,
      amount_cents: amt,
      platform_fee_cents: platformFee,
      creator_amount_cents: creatorAmount,
      message: safeMessage,
      stripe_session_id: session.id,
      status: "pending",
    });
    if (insertErr) console.error("[create-megatalent-tip] insert error", insertErr);

    return json({ url: session.url, session_id: session.id });
  } catch (e) {
    console.error("[create-megatalent-tip] error", e);
    return json({ error: (e as Error)?.message ?? "Unknown error" }, 500);
  }
});
