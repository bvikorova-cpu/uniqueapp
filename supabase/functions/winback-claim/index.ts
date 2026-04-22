// Public claim of a win-back offer via token. Creates a Stripe Checkout
// subscription session pre-applied with the campaign's coupon.
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
    const { token, priceId } = await req.json();
    if (!token || !priceId) {
      return new Response(JSON.stringify({ error: "Missing token or priceId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: campaign, error } = await supabase
      .from("winback_campaigns")
      .select("*")
      .eq("offer_token", token)
      .maybeSingle();

    if (error || !campaign) {
      return new Response(JSON.stringify({ error: "Offer not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (campaign.status === "claimed") {
      return new Response(JSON.stringify({ error: "Offer already claimed" }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (new Date(campaign.offer_expires_at).getTime() < Date.now()) {
      await supabase.from("winback_campaigns").update({ status: "expired" }).eq("id", campaign.id);
      return new Response(JSON.stringify({ error: "Offer expired" }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2025-08-27.basil",
    });

    // Lazy create coupon if missing
    let couponId = campaign.offer_coupon_id;
    if (!couponId) {
      const coupon = await stripe.coupons.create({
        percent_off: campaign.offer_percent_off,
        duration: "repeating",
        duration_in_months: campaign.offer_duration_months,
        name: `Win-back ${campaign.offer_percent_off}% off`,
        metadata: { campaign_id: campaign.id, user_id: campaign.user_id },
      });
      couponId = coupon.id;
      await supabase
        .from("winback_campaigns")
        .update({ offer_coupon_id: couponId })
        .eq("id", campaign.id);
    }

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: campaign.stripe_customer_id || undefined,
      customer_email: campaign.stripe_customer_id ? undefined : campaign.email,
      line_items: [{ price: priceId, quantity: 1 }],
      discounts: [{ coupon: couponId }],
      success_url: `${origin}/winback/${token}?success=1`,
      cancel_url: `${origin}/winback/${token}`,
      metadata: {
        winback_campaign_id: campaign.id,
        user_id: campaign.user_id,
      },
      subscription_data: {
        metadata: {
          winback_campaign_id: campaign.id,
          user_id: campaign.user_id,
        },
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
