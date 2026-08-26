// Creates a Stripe Checkout session for a profile tip (10% platform fee).
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

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
    const recipientId = String(body?.recipientId || "");
    if (!recipientId) return json({ error: "recipientId required" }, 400);
    if (recipientId === user.id) return json({ error: "You cannot tip yourself." }, 400);

    const amountCents = Number(body?.amountCents);
    if (!Number.isFinite(amountCents) || amountCents < 100 || amountCents > 10000) {
      return json({ error: "Tips must be between €1 and €100." }, 400);
    }

    const safeMessage = typeof body?.message === "string" && body.message.trim()
      ? body.message.trim().slice(0, 280)
      : null;

    const platformFee = Math.round(amountCents * 0.1);
    const recipientAmount = amountCents - platformFee;

    const { data: recipient } = await admin
      .from("profiles")
      .select("id, display_name, username")
      .eq("id", recipientId)
      .maybeSingle();
    if (!recipient) return json({ error: "Recipient not found" }, 404);

    const recipientName = recipient.display_name || recipient.username || "creator";

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Payments are not configured" }, 500);
    const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });

    const origin = normalizeOrigin(req.headers.get("origin"));

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email ?? undefined,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Tip for ${recipientName}`,
              description: safeMessage ?? "Support this creator on Unique",
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/profile/${recipientId}?tip=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/profile/${recipientId}?tip=cancel`,
      metadata: {
        type: "profile_tip",
        product: "profile_tip",
        recipientId,
        senderId: user.id,
      },
    });

    const { error: insertErr } = await admin.from("profile_tips").insert({
      sender_id: user.id,
      recipient_id: recipientId,
      amount: amountCents / 100,
      currency: "EUR",
      amount_cents: amountCents,
      platform_fee_cents: platformFee,
      recipient_amount_cents: recipientAmount,
      message: safeMessage,
      stripe_session_id: session.id,
      status: "pending",
    });
    if (insertErr) {
      console.error("[create-profile-tip] insert error", insertErr);
      return json({ error: "Could not record the tip. Please try again." }, 500);
    }

    return json({ url: session.url, session_id: session.id });
  } catch (e) {
    console.error("[create-profile-tip] error", e);
    return json({ error: (e as Error)?.message ?? "Unknown error" }, 500);
  }
});
