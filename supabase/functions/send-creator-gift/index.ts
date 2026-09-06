// Send a virtual gift to any creator (public gift wall).
// Creates Stripe Checkout + pending creator_gift_transactions row.
// Tip Jar model: 10% platform fee, 90% creator payout.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), {
    status: s,
    headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Body = z.object({ creatorId: z.string().uuid(),
  giftId: z.string().uuid(),
  message: z.string().max(280).optional().transform((v) => v?.trim() || "") });

const PLATFORM_FEE = 0.10;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Stripe not configured" }, 500);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Sign in required" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: userRes, error: uErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (uErr || !userRes.user?.email) return json({ error: "Auth failed" }, 401);
    const user = userRes.user;

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
    }
    const { creatorId, giftId, message } = parsed.data;

    if (creatorId === user.id) {
      return json({ error: "You cannot gift yourself" }, 400);
    }

    const { data: gift, error: gErr } = await supabase
      .from("creator_gifts")
      .select("id, name, icon, price, is_active")
      .eq("id", giftId)
      .maybeSingle();
    if (gErr || !gift || !gift.is_active) return json({ error: "Gift unavailable" }, 404);

    const price = Number(gift.price);
    const amountCents = Math.round(price * 100);
    const platformFee = +(price * PLATFORM_FEE).toFixed(2);
    const creatorPayout = +(price - platformFee).toFixed(2);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    // Insert pending row first, get id for redirect
    const { data: pending, error: iErr } = await supabase
      .from("creator_gift_transactions")
      .insert({ creator_id: creatorId,
        sender_id: user.id,
        gift_id: giftId,
        amount: price,
        platform_fee: platformFee,
        creator_payout: creatorPayout,
        message: message || null,
        status: "pending" })
      .select("id")
      .single();
    if (iErr || !pending) {
      console.error("[send-creator-gift] insert failed", iErr);
      return json({ error: iErr?.message || "Failed to record gift" }, 500);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: `${gift.icon ?? "🎁"} ${gift.name}`,
            description: message || "Virtual gift" },
          unit_amount: amountCents },
        quantity: 1 }],
      success_url: `${origin}/gift/success?id=${pending.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/gift/canceled?id=${pending.id}`,
      metadata: { kind: "creator_gift",
        transaction_id: pending.id,
        creator_id: creatorId,
        sender_id: user.id } });

    await supabase
      .from("creator_gift_transactions")
      .update({ stripe_session_id: session.id })
      .eq("id", pending.id);

    return json({ url: session.url, transactionId: pending.id });
  } catch (e: any) {
    console.error("[send-creator-gift]", e);
    return json({ error: e?.message || "Failed" }, 500);
  }
});
