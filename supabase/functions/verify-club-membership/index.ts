import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import {
  CLUB_SIGNUP_AI_CREDITS,
  CLUB_REFERRAL_CREDIT_EUR,
  contributeToGoodFund,
  grantClubAiCredits,
} from "../_shared/club-perks.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
      expand: ["subscription", "customer", "shipping_details", "line_items", "customer_details"],
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

    // Extract shipping + custom fields from Stripe
    type ShippingDetails = { name?: string | null; phone?: string | null } & Record<string, unknown>;
    type CustomerDetails = { name?: string | null; phone?: string | null } & Record<string, unknown>;
    type CustomField = { key: string; text?: { value?: string | null } };
    type SessionExtras = {
      shipping_details?: ShippingDetails | null;
      customer_details?: CustomerDetails | null;
      custom_fields?: CustomField[] | null;
    };
    const extras = session as unknown as SessionExtras;
    const shipping = extras.shipping_details ?? null;
    const customerDetails = extras.customer_details ?? {};
    const customFields: CustomField[] = extras.custom_fields ?? [];
    const recipientField = customFields.find((f) => f.key === "recipient_name");
    const noteField = customFields.find((f) => f.key === "delivery_note");
    const recipientName = recipientField?.text?.value
      ?? shipping?.name
      ?? customerDetails?.name
      ?? null;
    const phone = customerDetails?.phone ?? shipping?.phone ?? null;
    const shippingNote = noteField?.text?.value ?? null;

    const periodEnd = sub?.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null;

    const { data: existing } = await admin
      .from("club_memberships")
      .select("id, is_founding, member_number")
      .eq("user_id", user.id)
      .maybeSingle<{ id: string; is_founding: boolean; member_number: number }>();

    const updatePayload: Record<string, unknown> = {
      tier,
      status: "active",
      stripe_customer_id: customerId,
      stripe_subscription_id: sub?.id ?? null,
      stripe_checkout_session_id: session.id,
      current_period_end: periodEnd,
      shipping_status: tier === "physical" ? "pending" : "not_applicable",
      shipping_address: shipping,
      ...(tier === "physical"
        ? {
            recipient_name: recipientName,
            phone,
            shipping_note: shippingNote,
          }
        : {}),
    };

    let membershipId: string;
    if (existing) {
      const { error } = await admin
        .from("club_memberships")
        .update(updatePayload)
        .eq("id", existing.id);
      if (error) throw error;
      membershipId = existing.id;
    } else {
      const { data: inserted, error } = await admin
        .from("club_memberships")
        .insert({ user_id: user.id, ...updatePayload })
        .select("id")
        .single<{ id: string }>();
      if (error) throw error;
      membershipId = inserted.id;
    }


    // ── Perk 1: signup Good Fund contribution (10 % of amount_total) ─────────
    const amountTotal = session.amount_total ?? 0;
    const contributionEur = Math.round(amountTotal * 0.10) / 100;
    if (contributionEur > 0) {
      await contributeToGoodFund(admin, {
        membershipId,
        amountEur: contributionEur,
        source: "signup",
        stripeEventId: session.id,
      });
    }

    // ── Perk 2: welcome AI credits (idempotent per membership) ───────────────
    await grantClubAiCredits(admin, {
      userId: user.id,
      membershipId,
      perk: "signup_ai_credits",
      periodKey: `signup:${membershipId}`,
      amount: CLUB_SIGNUP_AI_CREDITS,
      stripeEventId: session.id,
    });

    // ── Perk 3: referral reward (€5 credit to referrer) ──────────────────────
    if (referralCode) {
      const { data: refUser } = await admin
        .from("club_memberships")
        .select("user_id")
        .eq("id", referralCode)
        .maybeSingle<{ user_id: string }>();
      if (refUser?.user_id && refUser.user_id !== user.id) {
        const referrerId = refUser.user_id;
        const { error: refErr } = await admin
          .from("club_referrals")
          .insert({
            referrer_user_id: referrerId,
            referred_membership_id: membershipId,
            credit_awarded_eur: CLUB_REFERRAL_CREDIT_EUR,
          });
        if (!refErr) {
          await admin.from("notifications").insert({
            user_id: referrerId,
            type: "club_referral",
            title: "🎁 +€5 referral credit",
            message: "Someone joined the Unique VIP Club with your invite link.",
          }).then(() => {}).catch(() => {});
        }
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

