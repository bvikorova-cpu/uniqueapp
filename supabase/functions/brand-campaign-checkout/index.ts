// Brand Collaboration — Escrow checkout
// Brand approves an application + opens a Stripe checkout that escrows the agreed amount.
// On success the stripe-webhook handler creates/updates the campaign_escrow row with status='held'.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLATFORM_FEE_PCT = 0.20; // 20% platform fee, 80% to influencer.

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // 1. Auth — only the brand who owns the campaign can call this.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonError("Missing authorization", 401);
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return jsonError("Unauthorized", 401);
    }
    const user = userData.user;

    // 2. Validate input.
    const body = await req.json().catch(() => ({}));
    const applicationId: string | undefined = body?.applicationId;
    const agreedEur = Number(body?.agreedEur);
    if (!applicationId || !Number.isFinite(agreedEur) || agreedEur < 1 || agreedEur > 100000) {
      return jsonError("applicationId and agreedEur (1–100000) required", 400);
    }

    // 3. Load application + campaign + influencer.
    const { data: app, error: appErr } = await supabase
      .from("campaign_applications")
      .select(`
        id, status, payment_status, user_id,
        campaign_id,
        brand_campaigns ( id, user_id, brand_name, campaign_name ),
        virtual_influencers!inner ( id, user_id, name )
      `)
      .eq("id", applicationId)
      .maybeSingle();

    if (appErr || !app) return jsonError("Application not found", 404);
    const campaign = (app as any).brand_campaigns;
    const influencer = (app as any).virtual_influencers;
    if (!campaign || !influencer) return jsonError("Campaign or influencer missing", 404);
    if (campaign.user_id !== user.id) return jsonError("Only the campaign owner can pay", 403);
    if (app.payment_status === "paid" || app.payment_status === "released") {
      return jsonError("This application is already paid", 409);
    }

    // 4. Compute amounts (in cents).
    const amountCents = Math.round(agreedEur * 100);
    const platformFeeCents = Math.round(amountCents * PLATFORM_FEE_PCT);
    const netCents = amountCents - platformFeeCents;

    // 5. Stripe checkout session.
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Reuse customer if exists, else create on the fly.
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email!,
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: `Brand campaign: ${campaign.campaign_name}`,
            description: `Escrow for influencer ${influencer.name}. Released to creator after you mark the work as completed.`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      payment_intent_data: {
        description: `Brand Campaign Escrow — ${campaign.campaign_name}`,
        metadata: {
          type: "brand_campaign_escrow",
          application_id: applicationId,
          campaign_id: campaign.id,
          brand_user_id: user.id,
          influencer_id: influencer.id,
          influencer_user_id: influencer.user_id,
          platform_fee_cents: String(platformFeeCents),
          net_cents: String(netCents),
        },
      },
      metadata: {
        type: "brand_campaign_escrow",
        application_id: applicationId,
      },
      success_url: `${origin}/brand-collaboration?escrow=success&app=${applicationId}`,
      cancel_url: `${origin}/brand-collaboration?escrow=cancelled&app=${applicationId}`,
    });

    // 6. Pre-create the escrow row in 'awaiting_payment'. Webhook will flip it to 'held'.
    const { error: escrowErr } = await supabase
      .from("campaign_escrow")
      .insert({
        application_id: applicationId,
        campaign_id: campaign.id,
        brand_user_id: user.id,
        influencer_id: influencer.id,
        influencer_user_id: influencer.user_id,
        amount_cents: amountCents,
        platform_fee_cents: platformFeeCents,
        net_cents: netCents,
        currency: "eur",
        status: "awaiting_payment",
        stripe_session_id: session.id,
      });

    if (escrowErr) {
      // Non-fatal — webhook can still upsert by stripe_session_id if needed.
      console.error("Failed to insert escrow row:", escrowErr);
    }

    // 7. Approve the application + persist agreed amount.
    await supabase
      .from("campaign_applications")
      .update({
        status: "approved",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        agreed_amount: agreedEur,
        payment_status: "pending",
      })
      .eq("id", applicationId);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return jsonError(String((err as any)?.message ?? err), 500);
  }
});

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
