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
    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("sessionId required");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const anon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: uData } = await anon.auth.getUser(token);
    if (!uData.user) throw new Error("Not authenticated");
    const user = uData.user;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer", "shipping_details", "line_items"],
    });

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return new Response(
        JSON.stringify({ status: "pending", payment_status: session.payment_status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const tier = (session.metadata?.tier as "digital" | "physical") ?? "digital";
    const referralCode = session.metadata?.referral_code ?? "";
    const sub = session.subscription as Stripe.Subscription | null;
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Upsert membership
    const shipping = (session as any).shipping_details ?? null;
    const periodEnd = sub?.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null;

    const { data: existing } = await admin
      .from("club_memberships")
      .select("id, is_founding, member_number")
      .eq("user_id", user.id)
      .maybeSingle();

    let membershipId: string;
    if (existing) {
      const { error } = await admin
        .from("club_memberships")
        .update({
          tier,
          status: "active",
          stripe_customer_id: customerId,
          stripe_subscription_id: sub?.id ?? null,
          stripe_checkout_session_id: session.id,
          current_period_end: periodEnd,
          shipping_status: tier === "physical" ? "pending" : "not_applicable",
          shipping_address: shipping,
        })
        .eq("id", existing.id);
      if (error) throw error;
      membershipId = existing.id;
    } else {
      const { data: inserted, error } = await admin
        .from("club_memberships")
        .insert({
          user_id: user.id,
          tier,
          status: "active",
          stripe_customer_id: customerId,
          stripe_subscription_id: sub?.id ?? null,
          stripe_checkout_session_id: session.id,
          current_period_end: periodEnd,
          shipping_status: tier === "physical" ? "pending" : "not_applicable",
          shipping_address: shipping,
        })
        .select("id")
        .single();
      if (error) throw error;
      membershipId = inserted.id;
    }

    // Contribution: 10% of amount_total (in cents) → good fund
    const amountTotal = session.amount_total ?? 0;
    const contributionEur = Math.round(amountTotal * 0.10) / 100;
    if (contributionEur > 0) {
      await admin.from("club_good_fund_ledger").insert({
        membership_id: membershipId,
        amount_eur: contributionEur,
        source: "signup",
        stripe_event_id: session.id,
      });
    }

    // Referral credit
    if (referralCode) {
      const { data: refUser } = await admin
        .from("club_memberships")
        .select("user_id")
        .eq("id", referralCode)
        .maybeSingle();
      if (refUser?.user_id && refUser.user_id !== user.id) {
        await admin
          .from("club_referrals")
          .insert({
            referrer_user_id: refUser.user_id,
            referred_membership_id: membershipId,
            credit_awarded_eur: 5.0,
          })
          .then(() => {})
          .catch(() => {});
      }
    }

    return new Response(
      JSON.stringify({ status: "active", membership_id: membershipId, tier }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e) {
    console.error("[verify-club-membership]", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
