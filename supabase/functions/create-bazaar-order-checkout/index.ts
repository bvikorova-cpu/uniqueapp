import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseAuth.auth.getUser(token);
    if (!user) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const itemId: string | undefined = body.itemId || body.item_id;
    const shippingAddress: string | undefined = body.shippingAddress || body.shipping_address;
    const buyerNotes: string | null = body.buyerNotes || body.buyer_notes || null;

    if (!itemId) return json({ error: "Missing itemId" }, 400);
    if (!shippingAddress || !shippingAddress.trim()) return json({ error: "Missing shipping address" }, 400);

    // Use service role for trusted reads/writes
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: item, error: itemErr } = await admin
      .from("bazaar_items")
      .select("id, user_id, title, price, is_sold, is_active")
      .eq("id", itemId)
      .maybeSingle();

    // Look up seller's Stripe Connect account for automatic split payout
    let sellerConnectId: string | null = null;
    if (item?.user_id) {
      const { data: sellerProfile } = await admin
        .from("profiles")
        .select("stripe_connect_account_id, stripe_connect_charges_enabled, stripe_connect_payouts_enabled")
        .eq("id", item.user_id)
        .maybeSingle();
      if (
        sellerProfile?.stripe_connect_account_id &&
        sellerProfile?.stripe_connect_charges_enabled &&
        sellerProfile?.stripe_connect_payouts_enabled
      ) {
        sellerConnectId = sellerProfile.stripe_connect_account_id as string;
      }
    }

    if (itemErr || !item) return json({ error: "Item not found" }, 404);
    if (item.is_sold) return json({ error: "Item already sold" }, 400);
    if (!item.is_active) return json({ error: "Item not available" }, 400);
    if (item.user_id === user.id) return json({ error: "You cannot buy your own item" }, 400);

    // Commission: prefer platform setting, fall back to 10%
    let commissionRate = 10;
    const { data: setting } = await admin
      .from("platform_commission_settings")
      .select("commission_rate")
      .eq("service_type", "bazaar")
      .eq("is_active", true)
      .maybeSingle();
    if (setting?.commission_rate != null) commissionRate = Number(setting.commission_rate);

    const amount = Number(item.price);
    const commissionAmount = +(amount * (commissionRate / 100)).toFixed(2);
    const sellerPayout = +(amount - commissionAmount).toFixed(2);

    // Create pending order
    const { data: order, error: orderErr } = await admin
      .from("bazaar_orders")
      .insert({
        item_id: item.id,
        buyer_id: user.id,
        seller_id: item.user_id,
        amount,
        commission_amount: commissionAmount,
        seller_payout: sellerPayout,
        status: "pending",
        shipping_address: shippingAddress.trim(),
        buyer_notes: buyerNotes,
      })
      .select()
      .single();

    if (orderErr || !order) {
      console.error("[create-bazaar-order-checkout] order insert err", orderErr);
      return json({ error: "Failed to create order" }, 500);
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || req.headers.get("referer") || "https://uniqueapp.fun";
    const successUrl = `${origin}/bazaar?payment=success&session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`;
    const cancelUrl = `${origin}/bazaar?payment=cancelled&order_id=${order.id}`;

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: `Bazaar: ${item.title}`.slice(0, 250),
              description: `Order ${order.id.slice(0, 8)}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Auto-split funds via Stripe Connect when seller is onboarded.
      // Platform keeps `application_fee_amount` (commission), the rest is
      // automatically transferred to the seller's connected account.
      ...(sellerConnectId
        ? {
            payment_intent_data: {
              application_fee_amount: Math.round(commissionAmount * 100),
              transfer_data: { destination: sellerConnectId },
            },
          }
        : {}),
      metadata: {
        type: "bazaar_order",
        product: "bazaar_order",
        order_id: order.id,
        item_id: item.id,
        buyer_id: user.id,
        seller_id: item.user_id,
        auto_split: sellerConnectId ? "true" : "false",
      },
    });

    // Save the session id immediately
    await admin
      .from("bazaar_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return json({
      url: session.url,
      session_id: session.id,
      order_id: order.id,
      auto_split: !!sellerConnectId,
    });
  } catch (e) {
    console.error("[create-bazaar-order-checkout] error", e);
    return json({ error: e instanceof Error ? e.message : "Checkout failed" }, 500);
  }
});
