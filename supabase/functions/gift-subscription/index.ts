import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIER_PRICES: Record<string, number> = {
  basic: 999,
  premium: 1999,
  business: 4999,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );
    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("Unauthorized");
    const { data: u } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (!u.user?.email) throw new Error("Unauthorized");

    const body = await req.json();
    const { action } = body;
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-08-27.basil" });

    if (action === "create") {
      const { recipient_email, tier, months = 1, message } = body;
      if (!recipient_email || !TIER_PRICES[tier]) throw new Error("Invalid input");
      const monthly = TIER_PRICES[tier];
      const amount = monthly * months;
      const code = "GIFT-" + crypto.randomUUID().slice(0, 8).toUpperCase();

      const { data: gift, error } = await supabase.from("subscription_gifts").insert({
        sender_id: u.user.id,
        recipient_email,
        tier,
        months,
        amount_cents: amount,
        currency: "EUR",
        redeem_code: code,
        message: message || null,
      }).select().single();
      if (error) throw error;

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: u.user.email,
        line_items: [{
          price_data: {
            currency: "eur",
            product_data: { name: `Gift: ${tier} (${months} mo) for ${recipient_email}` },
            unit_amount: amount,
          },
          quantity: 1,
        }],
        success_url: `${req.headers.get("origin")}/billing?gift=success`,
        cancel_url: `${req.headers.get("origin")}/billing?gift=cancel`,
        metadata: { gift_id: gift.id, redeem_code: code },
      });
      await supabase.from("subscription_gifts").update({ stripe_session_id: session.id }).eq("id", gift.id);
      return Response.json({ url: session.url, code }, { headers: corsHeaders });
    }

    if (action === "redeem") {
      const { code } = body;
      const { data: gift } = await supabase.from("subscription_gifts").select("*").eq("redeem_code", code).maybeSingle();
      if (!gift) throw new Error("Gift code not found");
      if (gift.status === "redeemed") throw new Error("Already redeemed");
      if (gift.status !== "paid") throw new Error("Gift not yet paid");
      if (new Date(gift.expires_at) < new Date()) throw new Error("Gift expired");

      const subEnd = new Date();
      subEnd.setMonth(subEnd.getMonth() + gift.months);
      await supabase.from("subscriptions").insert({
        user_id: u.user.id,
        tier: gift.tier,
        status: "active",
        price: gift.amount_cents / 100,
        started_at: new Date().toISOString(),
        expires_at: subEnd.toISOString(),
      });
      await supabase.from("subscription_gifts").update({
        status: "redeemed",
        redeemed_at: new Date().toISOString(),
        recipient_user_id: u.user.id,
      }).eq("id", gift.id);
      return Response.json({ success: true, tier: gift.tier, months: gift.months }, { headers: corsHeaders });
    }

    throw new Error("Unknown action");
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 400, headers: corsHeaders });
  }
});
