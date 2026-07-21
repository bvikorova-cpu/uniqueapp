import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json().catch(() => ({}));
    const creatorId: string | undefined = body?.creatorId;
    const message: string = String(body?.message ?? "").trim();
    const requestType: "message" | "shoutout" =
      body?.requestType === "shoutout" ? "shoutout" : "message";

    if (!creatorId) throw new Error("creatorId required");
    if (!message || message.length < 3 || message.length > 2000)
      throw new Error("Message must be 3–2000 characters");
    if (creatorId === user.id) throw new Error("Cannot message yourself");

    // Load settings & compute price
    const { data: settings } = await admin
      .from("creator_message_settings")
      .select("price_per_message, shoutout_price, is_enabled, shoutout_enabled")
      .eq("creator_id", creatorId)
      .maybeSingle();

    if (requestType === "message" && settings?.is_enabled === false)
      throw new Error("This creator disabled paid messages");
    if (requestType === "shoutout" && settings?.shoutout_enabled === false)
      throw new Error("This creator disabled shoutouts");

    const priceEur = Number(
      requestType === "shoutout"
        ? settings?.shoutout_price ?? 20
        : settings?.price_per_message ?? 5
    );
    if (!Number.isFinite(priceEur) || priceEur < 1) throw new Error("Invalid price");

    const amountCents = Math.round(priceEur * 100);
    const platformFee = Math.round(amountCents * 0.15) / 100; // 15%
    const creatorPayout = priceEur - platformFee;

    // Insert pending row (audit trail before payment)
    const { data: inserted, error: insertErr } = await admin
      .from("creator_paid_messages")
      .insert({
        sender_id: user.id,
        creator_id: creatorId,
        content: message,
        amount_paid: priceEur,
        platform_fee: platformFee,
        creator_payout: creatorPayout,
        request_type: requestType,
        status: "pending",
      })
      .select("id")
      .single();
    if (insertErr) throw insertErr;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2025-08-27.basil",
    });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") ?? "https://uniqueapp.fun";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: {
              name:
                requestType === "shoutout"
                  ? "Personal Video Shoutout"
                  : "Paid Message to Creator",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        paid_message_id: inserted.id,
        creator_id: creatorId,
        sender_id: user.id,
        request_type: requestType,
      },
      success_url: `${origin}/paid-message/success?id=${inserted.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/paid-message/canceled?id=${inserted.id}`,
    });

    await admin
      .from("creator_paid_messages")
      .update({ stripe_session_id: session.id })
      .eq("id", inserted.id);

    return new Response(JSON.stringify({ url: session.url, id: inserted.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    console.error("create-paid-message-checkout error:", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
