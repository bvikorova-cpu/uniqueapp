// Real Shadow Arena gift purchase. Creates Stripe checkout and pre-inserts a
// pending shadow_gifts row. Stripe webhook flips status to "completed".
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const j = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// gift_type → EUR cents, displayed as gift_amount in the row
const GIFT_PRICES: Record<string, number> = {
  rose: 199,
  candle: 299,
  skull: 499,
  raven: 999,
  pact: 1999,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return j({ error: "Unauthorized" }, 401);
    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user } } = await anon.auth.getUser(auth.replace("Bearer ", ""));
    if (!user?.email) return j({ error: "Unauthorized" }, 401);

    const { battleId, participantId, giftType } = await req.json();
    if (!battleId || !participantId || !giftType) return j({ error: "battleId, participantId, giftType required" }, 400);

    const amount = GIFT_PRICES[String(giftType)] ?? 299;
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // Pre-insert pending row so we can update via webhook by stripe_payment_id.
    const { data: gift, error: gErr } = await admin.from("shadow_gifts").insert({
      battle_id: battleId,
      participant_id: participantId,
      sender_id: user.id,
      gift_type: giftType,
      gift_amount: amount,
      status: "pending",
    }).select().single();
    if (gErr) return j({ error: gErr.message }, 500);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
    const origin = req.headers.get("origin") || "https://uniqueapp.fun";
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: "eur",
          unit_amount: amount,
          product_data: { name: `Shadow Arena gift: ${giftType}` },
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${origin}/shadow-arena/battle/${battleId}?gift=success`,
      cancel_url: `${origin}/shadow-arena/battle/${battleId}?gift=canceled`,
      metadata: {
        type: "shadow_gift",
        product: "shadow_gift",
        user_id: user.id,
        gift_id: gift.id,
        battle_id: battleId,
        participant_id: participantId,
      },
    });

    await admin.from("shadow_gifts").update({ stripe_payment_id: session.id }).eq("id", gift.id);
    return j({ url: session.url, session_id: session.id });
  } catch (e: any) {
    return j({ error: e?.message ?? "Gift purchase failed" }, 500);
  }
});
