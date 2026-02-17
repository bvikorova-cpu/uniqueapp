import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabase.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("Not authenticated");

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Missing session ID");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const meta = session.metadata || {};
    const giftPrice = Number(meta.gift_price || 0);
    const platformFee = giftPrice * 0.10;
    const creatorEarning = giftPrice - platformFee;

    // Idempotency: check if already recorded
    const { data: existing } = await supabase
      .from("creator_gifts_sent")
      .select("id")
      .eq("stripe_payment_intent_id", session.payment_intent as string)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true, already_recorded: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record the gift transaction
    const { error: insertError } = await supabase
      .from("creator_gifts_sent")
      .insert({
        gift_id: meta.gift_id,
        sender_id: meta.sender_id,
        recipient_creator_id: meta.creator_id,
        message: meta.message || null,
        amount_paid: giftPrice,
        platform_fee: platformFee,
        creator_earning: creatorEarning,
        stripe_payment_intent_id: session.payment_intent as string,
      });

    if (insertError) throw insertError;

    // Update creator total earnings
    await supabase.rpc("increment", {
      table_name: "creator_profiles",
      column_name: "total_earnings",
      row_id: meta.creator_id,
      increment_by: creatorEarning,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
