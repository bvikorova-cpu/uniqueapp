// Universal Stripe webhook listener.
// Listens for: payment_intent.succeeded, charge.refunded, charge.dispute.created,
// checkout.session.completed, transfer.created. Keeps `payment_records` ledger
// in sync with Stripe's source of truth. Idempotent — safe to retry.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const log = (step: string, details?: unknown) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? " " + JSON.stringify(details) : ""}`);
};

// ─── Megatalent: price → tier mapping (mirrors check-megatalent-subscription) ──
const MEGATALENT_PRICE_TO_TIER: Record<string, "premium" | "top_premium"> = {
  price_1TOvuRGaXSfGtYFt6sfpt2Dy: "premium",
  price_1TOvuTGaXSfGtYFtIheCgIzQ: "top_premium",
};
const MEGATALENT_TIER_PRICE: Record<string, number> = {
  premium: 10,
  top_premium: 15,
};

/**
 * Upsert megatalent_subscriptions from a Stripe Subscription.
 * Called on subscription.created / .updated / checkout.session.completed.
 * Idempotent: safe to call multiple times for the same subscription.
 */
async function syncMegatalentSubscription(
  supabase: ReturnType<typeof createClient>,
  stripe: Stripe,
  sub: Stripe.Subscription,
): Promise<void> {
  // Detect if this subscription contains a megatalent price.
  const mtItem = sub.items.data.find((it) => MEGATALENT_PRICE_TO_TIER[it.price.id]);
  if (!mtItem) return; // not a megatalent sub — ignore

  const tier = MEGATALENT_PRICE_TO_TIER[mtItem.price.id];

  // Resolve user_id: prefer metadata (set on checkout), fallback to email lookup
  let userId: string | null = (sub.metadata?.user_id as string) || null;
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!userId && customerId) {
    try {
      const cust = await stripe.customers.retrieve(customerId);
      if (!cust.deleted) {
        const email = (cust as Stripe.Customer).email;
        if (email) {
          const { data: prof } = await supabase
            .from("profiles").select("id").eq("email", email).maybeSingle();
          userId = (prof as any)?.id ?? null;
        }
      }
    } catch (e) {
      log("megatalent: customer lookup failed", { err: (e as Error).message });
    }
  }
  if (!userId) {
    log("megatalent: no user_id resolvable, skipping", { sub: sub.id });
    return;
  }

  const isActive = sub.status === "active" || sub.status === "trialing";
  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null;

  const payload = {
    user_id: userId,
    tier,
    price: MEGATALENT_TIER_PRICE[tier],
    bonus_votes: 0,
    win_chance_boost: tier === "top_premium" ? 100 : 0,

    status: isActive ? "active" : "inactive",
    stripe_customer_id: customerId ?? null,
    stripe_subscription_id: sub.id,
    current_period_end: periodEnd,
    updated_at: new Date().toISOString(),
  };

  // Upsert by user_id (one row per user)
  const { data: existing } = await supabase
    .from("megatalent_subscriptions")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("megatalent_subscriptions")
      .update(payload)
      .eq("id", (existing as any).id);
    if (error) log("megatalent upsert (update) failed", { err: error.message });
    else log("megatalent subscription synced (update)", { user: userId, tier, status: payload.status });
  } else {
    const { error } = await supabase
      .from("megatalent_subscriptions")
      .insert({ ...payload, started_at: new Date().toISOString() });
    if (error) log("megatalent upsert (insert) failed", { err: error.message });
    else log("megatalent subscription synced (insert)", { user: userId, tier });
  }

  // Notify the user that premium is unlocked (only on first activation).
  if (isActive && !existing) {
    try {
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "megatalent_premium_unlocked",
        title: tier === "top_premium" ? "Top Premium activated 🚀" : "Premium activated ⭐",
        message: tier === "top_premium"
          ? "Your Megatalent Top Premium features are unlocked: +100% ranking boost (real votes × 2) and €5/month referral rewards."
          : "Your Megatalent Premium features are unlocked.",
        is_read: false,
      });
    } catch (e) {
      log("megatalent unlock notification failed", { err: (e as Error).message });
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    log("missing config");
    return new Response("Missing Stripe config", { status: 500 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  // Verify signature
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    log("signature verification failed", { err: (err as Error).message });
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }
  log("event received", { type: event.type, id: event.id });

  // ── Idempotency guard: skip if event.id already processed ──
  const { error: dedupErr } = await supabase
    .from("stripe_webhook_events")
    .insert({ event_id: event.id, event_type: event.type, status: "processing" });
  if (dedupErr) {
    // 23505 = unique_violation → duplicate event
    if ((dedupErr as any).code === "23505") {
      log("duplicate event, skipping", { id: event.id });
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    log("dedup insert failed", { err: dedupErr.message });
  }

  try {
    switch (event.type) {
      // ─── PAYMENT SUCCEEDED ───────────────────────────────────────────
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const { error } = await supabase
          .from("payment_records")
          .update({
            status: "paid",
            verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", pi.id)
          .neq("status", "refunded");
        if (error) log("update paid failed", { error: error.message });

        // ── Megatalent mentorship/marketplace orders (metadata-driven) ──
        try {
          const mtKind = pi.metadata?.mt_kind as string | undefined;
          const mtRowId = pi.metadata?.mt_row_id as string | undefined;
          if (mtKind && mtRowId) {
            const table = mtKind === "mentorship" ? "mt_mentorship_bookings" : "mt_marketplace_orders";
            const { error: mtErr } = await supabase.from(table).update({
              status: "paid",
              stripe_payment_intent_id: pi.id,
              paid_at: new Date().toISOString(),
            }).eq("id", mtRowId).eq("status", "pending");
            if (mtErr) log("mt order update failed", { error: mtErr.message });
            else log("mt order marked paid", { kind: mtKind, id: mtRowId });
          }
        } catch (e) {
          log("mt order handler error", { err: (e as Error).message });
        }
        break;
      }

      // ─── CHECKOUT COMPLETED (fallback if frontend verify never fires) ─
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // ── Megatalent: flip pending → paid by session metadata ─────────
        try {
          const mtKind = session.metadata?.mt_kind as string | undefined;
          const mtRowId = session.metadata?.mt_row_id as string | undefined;
          if (mtKind && mtRowId && session.payment_status === "paid") {
            const table = mtKind === "mentorship" ? "mt_mentorship_bookings" : "mt_marketplace_orders";
            const pi = typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id;
            await supabase.from(table).update({
              status: "paid",
              stripe_payment_intent_id: pi ?? null,
              stripe_session_id: session.id,
              paid_at: new Date().toISOString(),
            }).eq("id", mtRowId).eq("status", "pending");
            log("mt order marked paid via session", { kind: mtKind, id: mtRowId });
          }
        } catch (e) {
          log("mt session handler error", { err: (e as Error).message });
        }

        if (session.payment_status === "paid") {
          // ── Tutoring credits auto-activation (safety net if user closes tab
          //    before frontend redirect runs `tutoring-add-credits`) ─────────
          try {
            const TUTORING_PRICE_TO_CREDITS: Record<string, number> = {
              price_1ScY0zGaXSfGtYFtoe91oxmX: 10,
              price_1ScY10GaXSfGtYFt3F1cPJaE: 30,
              price_1ScY12GaXSfGtYFt3zw96KfT: 100,
            };
            const full = await stripe.checkout.sessions.retrieve(session.id, {
              expand: ["line_items"],
            });
            const priceId = full.line_items?.data?.[0]?.price?.id;
            if (priceId && priceId in TUTORING_PRICE_TO_CREDITS) {
              // Idempotency: skip if already credited via tutoring-add-credits
              const { data: existingTx } = await supabase
                .from("tutoring_credit_transactions")
                .select("id")
                .eq("stripe_session_id", session.id)
                .maybeSingle();
              if (!existingTx) {
                const email = full.customer_details?.email ?? null;
                if (email) {
                  const { data: prof } = await supabase
                    .from("profiles").select("id").eq("email", email).maybeSingle();
                  if (prof?.id) {
                    const credits = TUTORING_PRICE_TO_CREDITS[priceId];
                    const { data: cur } = await supabase
                      .from("tutoring_credits")
                      .select("*")
                      .eq("user_id", prof.id)
                      .maybeSingle();
                    if (cur) {
                      await supabase.from("tutoring_credits").update({
                        credits_remaining: cur.credits_remaining + credits,
                        total_credits_purchased: cur.total_credits_purchased + credits,
                        updated_at: new Date().toISOString(),
                      }).eq("user_id", prof.id);
                    } else {
                      await supabase.from("tutoring_credits").insert({
                        user_id: prof.id,
                        credits_remaining: credits,
                        total_credits_purchased: credits,
                      });
                    }
                    await supabase.from("tutoring_credit_transactions").insert({
                      user_id: prof.id,
                      delta: credits,
                      reason: "stripe_webhook",
                      stripe_session_id: session.id,
                    });
                    log("tutoring credits auto-credited via webhook", {
                      user: prof.id, credits, sessionId: session.id,
                    });
                  }
                }
              }
            }
          } catch (tcErr) {
            log("tutoring credit webhook handler error", { err: (tcErr as Error).message });
          }

          // ── Horse Racing currency purchase fulfillment ──
          try {
            if (session.metadata?.feature === "horse_racing_currency") {
              const userId = session.metadata.user_id;
              const coins = parseInt(session.metadata.coins || "0", 10);
              const gems = parseInt(session.metadata.gems || "0", 10);

              const { data: existing } = await supabase
                .from("horse_currency_purchases")
                .select("id,status").eq("stripe_session_id", session.id).maybeSingle();

              if (userId && existing && existing.status !== "fulfilled") {
                const { data: cur } = await supabase
                  .from("horse_currency").select("coins,gems")
                  .eq("user_id", userId).maybeSingle();
                if (cur) {
                  await supabase.from("horse_currency").update({
                    coins: (cur.coins || 0) + coins,
                    gems: (cur.gems || 0) + gems,
                  }).eq("user_id", userId);
                } else {
                  await supabase.from("horse_currency").insert({
                    user_id: userId, coins, gems,
                  });
                }
                await supabase.from("horse_currency_purchases").update({
                  status: "fulfilled", fulfilled_at: new Date().toISOString(),
                }).eq("stripe_session_id", session.id);
                log("horse currency fulfilled", { userId, coins, gems });
              }
            }
          } catch (hcErr) {
            log("horse currency webhook error", { err: (hcErr as Error).message });
          }

          // ── Anonymous Dating credits fulfillment ──
          try {
            if (session.metadata?.type === "anonymous_date_credits") {
              const userId = session.metadata.user_id as string | undefined;
              const credits = parseInt(session.metadata.credits || "0", 10);
              if (userId && credits > 0) {
                // Idempotency guard via payment_records (stripe_session_id is unique-ish)
                const { data: existingPay } = await supabase
                  .from("payment_records")
                  .select("id,status")
                  .eq("stripe_session_id", session.id)
                  .maybeSingle();
                if (!existingPay || existingPay.status !== "paid") {
                  const { error: grantErr } = await supabase.rpc(
                    "grant_anonymous_dating_credits",
                    { p_user_id: userId, p_amount: credits },
                  );
                  if (grantErr) {
                    log("anon-date credit grant failed", { err: grantErr.message });
                  } else {
                    log("anon-date credits granted", { userId, credits, sessionId: session.id });
                    // Record payment (ledger row for reconciliation)
                    await supabase.from("payment_records").upsert({
                      user_id: userId,
                      stripe_session_id: session.id,
                      stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
                      stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
                      amount_cents: session.amount_total ?? 0,
                      currency: session.currency ?? "eur",
                      status: "paid",
                      product_type: "anonymous_date_credits",
                      metadata: { credits, package_type: session.metadata.package_type ?? null },
                      verified_at: new Date().toISOString(),
                    }, { onConflict: "stripe_session_id" });
                  }
                }
              }
            }
          } catch (anErr) {
            log("anon-date credits webhook error", { err: (anErr as Error).message });
          }

          // ── Campaign donation fallback (one-off) ────────────────────────
          // Normal path: frontend redirect calls verify-donation → verify-payment
          // which inserts the campaign_donations row. If the user closes the
          // tab before the redirect lands we record the donation here so the
          // campaign total still bumps. Idempotent via _stripe_payment_id.
          try {
            const md = session.metadata ?? {};
            const isDonation = md.type === "campaign_donation" || md.product === "campaign_donation";
            const isOneOff = session.mode === "payment"; // subscriptions handled via invoice.payment_succeeded
            if (isDonation && isOneOff && md.campaign_id && md.campaign_type) {
              const amountEur = (session.amount_total ?? 0) / 100;
              const piId = typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id;
              const paymentId = piId || session.id;

              const { data: existingDon } = await supabase
                .from("campaign_donations")
                .select("id")
                .eq("stripe_payment_id", paymentId)
                .maybeSingle();

              if (!existingDon && amountEur > 0) {
                const { error: donErr } = await supabase.rpc(
                  "process_campaign_donation",
                  {
                    _campaign_id: md.campaign_id,
                    _campaign_type: md.campaign_type,
                    _donor_id: md.user_id || null,
                    _donor_email: md.donor_email || session.customer_details?.email || null,
                    _donor_name: md.donor_name || null,
                    _amount: amountEur,
                    _is_monthly: false,
                    _is_anonymous: md.is_anonymous === "true",
                    _message: md.donation_message || null,
                    _stripe_payment_id: paymentId,
                  },
                );
                if (donErr) log("donation fallback RPC failed", { err: donErr.message });
                else log("donation fallback recorded via webhook", { paymentId, amountEur });
              }
            }
          } catch (dErr) {
            log("donation webhook fallback error", { err: (dErr as Error).message });
          }

          // ── Auction buyout fallback: complete sale even if buyer never returns to success URL ──
          try {
            const md = session.metadata ?? {};
            const isAuctionBuyout =
              md.type === "auction_buyout" ||
              md.product === "auction_buyout" ||
              md.product_type === "auction_buyout";
            if (isAuctionBuyout && session.mode === "payment" && md.auction_id && md.winner_id) {
              const { error: abErr } = await supabase.rpc(
                "complete_auction_buyout" as any,
                {
                  p_auction_id: md.auction_id,
                  p_winner_id: md.winner_id,
                  p_stripe_session_id: session.id,
                },
              );
              if (abErr) log("auction_buyout webhook fallback failed", { err: abErr.message });
              else log("auction_buyout completed via webhook", { auction_id: md.auction_id });
            }
          } catch (abErr) {
            log("auction_buyout webhook fallback error", { err: (abErr as Error).message });
          }



          const { error } = await supabase
            .from("payment_records")
            .update({
              status: "paid",
              stripe_payment_intent_id: session.payment_intent as string,
              stripe_customer_id:
                typeof session.customer === "string" ? session.customer : null,
              verified_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_session_id", session.id)
            .neq("status", "refunded");
          if (error) log("checkout sync failed", { error: error.message });

          // ── Brand Collaboration escrow flip: 'awaiting_payment' → 'held' ──
          if (session.metadata?.type === "brand_campaign_escrow") {
            const piId = typeof session.payment_intent === "string"
              ? session.payment_intent
              : null;
            const nowIso = new Date().toISOString();
            const { error: escErr } = await supabase
              .from("campaign_escrow")
              .update({
                status: "held",
                stripe_payment_intent_id: piId,
                paid_at: nowIso,
                updated_at: nowIso,
              })
              .eq("stripe_session_id", session.id)
              .eq("status", "awaiting_payment");
            if (escErr) log("escrow flip failed", { error: escErr.message });

            const applicationId = session.metadata?.application_id;
            if (applicationId) {
              await supabase
                .from("campaign_applications")
                .update({ payment_status: "paid", updated_at: nowIso })
                .eq("id", applicationId);

              // Notify influencer that funds are escrowed.
              const { data: esc } = await supabase
                .from("campaign_escrow")
                .select("influencer_user_id, brand_user_id, amount_cents")
                .eq("stripe_session_id", session.id)
                .maybeSingle();
              if (esc?.influencer_user_id) {
                await supabase.from("notifications").insert({
                  user_id: esc.influencer_user_id,
                  type: "campaign_escrow_funded",
                  title: "Campaign funded — start the work!",
                  message: `The brand has paid €${(esc.amount_cents / 100).toFixed(2)} into escrow. Deliver the agreed content; you'll be paid out when the brand confirms.`,
                });
              }
            }
          }

          // ── Holographic Avatars fulfillment ─────────────────────────────
          // Inserts a row in `holographic_purchases` so the page can detect
          // the active feature after Stripe redirect. Idempotent via
          // stripe_session_id.
          if (session.metadata?.type === "holographic_avatar") {
            try {
              const md = session.metadata ?? {};
              const userId = md.user_id;
              const featureRaw = String(md.feature || "Holographic Avatar");
              const serviceSlug = featureRaw
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "")
                .slice(0, 60) || "holographic_avatar";
              const isSubscription = session.mode === "subscription";
              const subId = typeof session.subscription === "string"
                ? session.subscription
                : session.subscription?.id ?? null;
              const expiresAt = isSubscription
                ? new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString()
                : null;

              if (userId) {
                const { data: existing } = await supabase
                  .from("holographic_purchases")
                  .select("id")
                  .eq("stripe_session_id", session.id)
                  .maybeSingle();
                if (!existing) {
                  const { error: hErr } = await supabase
                    .from("holographic_purchases")
                    .insert({
                      user_id: userId,
                      service_type: serviceSlug,
                      stripe_session_id: session.id,
                      stripe_subscription_id: subId,
                      status: "active",
                      expires_at: expiresAt,
                    });
                  if (hErr) log("holographic insert failed", { error: hErr.message });
                  else log("holographic purchase recorded", { userId, serviceSlug, isSubscription });
                }
              } else {
                log("holographic webhook missing user_id", { sessionId: session.id });
              }
            } catch (hErr) {
              log("holographic webhook error", { err: (hErr as Error).message });
            }
          }

          // ── Megatalent: instantly fetch & sync subscription on checkout ──
          // This is the fastest possible unlock — fires within seconds of payment,
          // before customer.subscription.created may even arrive.
          if (session.mode === "subscription" && session.metadata?.module === "megatalent") {
            const subId = typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id;
            if (subId) {
              try {
                const sub = await stripe.subscriptions.retrieve(subId);
                await syncMegatalentSubscription(supabase, stripe, sub);
                log("megatalent unlocked via checkout.completed", { user: session.metadata?.user_id, sub: subId });
              } catch (e) {
                log("megatalent checkout sync failed", { err: (e as Error).message });
              }
            }
          }

          // ── Brand Battle Arena sponsorship activation ──
          // Flips brand_sponsors.subscription_status from 'pending' → 'active'
          // and stamps subscription id + period dates from Stripe.
          if (
            session.mode === "subscription" &&
            session.metadata?.type === "brand_sponsorship"
          ) {
            try {
              const ownerId = session.metadata?.user_id;
              const tier = session.metadata?.tier;
              const subId = typeof session.subscription === "string"
                ? session.subscription
                : session.subscription?.id;
              if (ownerId && subId) {
                const sub = await stripe.subscriptions.retrieve(subId);
                const startIso = sub.current_period_start
                  ? new Date(sub.current_period_start * 1000).toISOString()
                  : new Date().toISOString();
                const endIso = sub.current_period_end
                  ? new Date(sub.current_period_end * 1000).toISOString()
                  : null;
                const { data: spRow, error: spErr } = await supabase
                  .from("brand_sponsors")
                  .update({
                    subscription_status: "active",
                    stripe_subscription_id: subId,
                    subscription_start: startIso,
                    subscription_end: endIso,
                    ...(tier ? { tier } : {}),
                  })
                  .eq("user_id", ownerId)
                  .select("id")
                  .maybeSingle();
                if (spErr) log("brand sponsor activate failed", { err: spErr.message });
                else log("brand sponsor activated", { user: ownerId, sub: subId, tier });

                // Enterprise tier: provision API key in the private key store (idempotent).
                if (tier === "enterprise" && spRow?.id) {
                  const { data: existingKey } = await supabase
                    .from("brand_sponsor_api_keys")
                    .select("api_key")
                    .eq("sponsor_id", spRow.id)
                    .maybeSingle();
                  if (!existingKey) {
                    const key = `ba_live_${crypto.randomUUID().replace(/-/g, "")}`;
                    await supabase.from("brand_sponsor_api_keys").insert({
                      sponsor_id: spRow.id,
                      user_id: ownerId,
                      api_key: key,
                    });
                    log("enterprise api key provisioned", { sponsor: spRow.id });
                  }
                }
              }
            } catch (e) {
              log("brand sponsor activation error", { err: (e as Error).message });
            }
          }

          // ── Job listing activation fallback (in case verify-job-listing-payment
          //    never fires — e.g. user closed tab before redirect). Idempotent via
          //    job_listing_payments.stripe_session_id. Mirrors verify-job-listing-payment.
          try {
            const jobListingId = session.metadata?.jobListingId;
            const productKey = session.metadata?.productKey;
            const ownerId = session.metadata?.userId;
            if (jobListingId && productKey?.startsWith("job_listing")) {
              const { data: existingPay } = await supabase
                .from("job_listing_payments")
                .select("id, status")
                .eq("stripe_session_id", session.id)
                .maybeSingle();
              if (!existingPay || existingPay.status !== "completed") {
                const { data: listing } = await supabase
                  .from("job_listings")
                  .select("id, employer_id, expires_at, published_at, featured_until")
                  .eq("id", jobListingId)
                  .maybeSingle();
                if (listing && (!ownerId || ownerId === listing.employer_id)) {
                  let durationDays = 7;
                  let isFeatured = false;
                  if (productKey === "job_listing_14") durationDays = 14;
                  else if (productKey === "job_listing_30") durationDays = 30;
                  else if (productKey === "job_listing_featured") {
                    isFeatured = true;
                    durationDays = 0;
                  }
                  const payExpiresAt = new Date(
                    Date.now() + Math.max(durationDays, 30) * 86400000,
                  ).toISOString();

                  const piIdFb = typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : (session.payment_intent as any)?.id ?? null;
                  const { error: payErr } = await supabase
                    .from("job_listing_payments")
                    .upsert(
                      {
                        user_id: listing.employer_id,
                        job_id: jobListingId,
                        stripe_session_id: session.id,
                        stripe_payment_intent_id: piIdFb,
                        amount: session.amount_total ?? 0,
                        duration_days: durationDays,
                        status: "completed",
                        expires_at: payExpiresAt,
                      },
                      { onConflict: "stripe_session_id" },
                    );
                  if (payErr) log("job_listing_payments upsert error", { err: payErr.message });

                  if (isFeatured) {
                    const base = listing.featured_until && new Date(listing.featured_until) > new Date()
                      ? new Date(listing.featured_until)
                      : new Date();
                    const featuredUntil = new Date(base.getTime() + 30 * 86400000);
                    await supabase
                      .from("job_listings")
                      .update({ is_featured: true, featured_until: featuredUntil.toISOString() })
                      .eq("id", jobListingId);
                  } else {
                    const now = new Date();
                    const baseDate = listing.expires_at && new Date(listing.expires_at) > now
                      ? new Date(listing.expires_at)
                      : now;
                    const expiresAt = new Date(baseDate.getTime() + durationDays * 86400000);
                    await supabase
                      .from("job_listings")
                      .update({
                        paid_status: "active",
                        is_active: true,
                        published_at: listing.published_at ?? now.toISOString(),
                        expires_at: expiresAt.toISOString(),
                        duration_days: durationDays,
                      })
                      .eq("id", jobListingId);

                    await supabase.from("notifications").insert({
                      user_id: listing.employer_id,
                      type: "job_listing_activated",
                      title: "Job listing activated",
                      message: `Your listing is active until ${expiresAt.toISOString().slice(0, 10)}.`,
                      related_id: jobListingId,
                      action_url: "/employer/dashboard",
                    });
                  }
                  log("job listing activated via webhook fallback", {
                    jobListingId, productKey, sessionId: session.id,
                  });
                }
              }
            }
          } catch (jlErr) {
            log("job listing webhook fallback error", { err: (jlErr as Error).message });
          }



          // ── Shadow Arena gift fulfilment ──
          if (session.metadata?.type === "shadow_gift" && session.metadata?.gift_id) {
            const giftId = session.metadata.gift_id;
            const battleId = session.metadata.battle_id;
            const amountEur = (session.amount_total || 0) / 100;
            const { error: gErr } = await supabase
              .from("shadow_gifts")
              .update({ status: "completed", stripe_payment_id: session.id })
              .eq("id", giftId);
            if (gErr) log("shadow_gift update failed", { error: gErr.message });

            // Bump participant total_gifts_received & battle prize pool
            if (session.metadata.participant_id) {
              const { data: p } = await supabase
                .from("shadow_battle_participants")
                .select("total_gifts_received")
                .eq("id", session.metadata.participant_id)
                .maybeSingle();
              if (p) {
                await supabase.from("shadow_battle_participants")
                  .update({ total_gifts_received: Number(p.total_gifts_received || 0) + amountEur })
                  .eq("id", session.metadata.participant_id);
              }
            }
            if (battleId) {
              const { data: b } = await supabase
                .from("shadow_battles")
                .select("total_prize_pool")
                .eq("id", battleId)
                .maybeSingle();
              if (b) {
                await supabase.from("shadow_battles")
                  .update({ total_prize_pool: Number(b.total_prize_pool || 0) + amountEur })
                  .eq("id", battleId);
              }
            }
          }

          // ── Glamour World coin purchase fulfillment ──
          try {
            if (session.metadata?.type === "glamour_coins") {
              const userId = session.metadata.user_id;
              const coins = parseInt(session.metadata.coins || "0", 10);
              if (userId && coins > 0) {
                // Idempotency via payment_records.stripe_session_id (already updated above to 'paid').
                // Use a marker on payment_records to avoid double-credit on webhook retries.
                const { data: pr } = await supabase
                  .from("payment_records")
                  .select("id, metadata")
                  .eq("stripe_session_id", session.id)
                  .maybeSingle();
                const alreadyCredited = (pr?.metadata as any)?.glamour_credited === true;
                if (!alreadyCredited) {
                  const { data: cur } = await supabase
                    .from("glamour_coins").select("balance")
                    .eq("user_id", userId).maybeSingle();
                  if (cur) {
                    await supabase.from("glamour_coins")
                      .update({
                        balance: (cur.balance || 0) + coins,
                        total_purchased: ((cur as any).total_purchased || 0) + coins,
                        updated_at: new Date().toISOString(),
                      })
                      .eq("user_id", userId);
                  } else {
                    await supabase.from("glamour_coins").insert({
                      user_id: userId, balance: coins, total_purchased: coins,
                    });
                  }
                  if (pr?.id) {
                    await supabase.from("payment_records").update({
                      metadata: { ...(pr.metadata as any || {}), glamour_credited: true },
                    }).eq("id", pr.id);
                  }
                  log("glamour coins credited", { userId, coins, sessionId: session.id });
                }
              }
            }
          } catch (gcErr) {
            log("glamour coin webhook error", { err: (gcErr as Error).message });
          }

          // ── Secret Santa 365 credit purchase fulfillment ──
          try {
            if (session.metadata?.type === "secret_santa_credits") {
              const userId = session.metadata.user_id;
              const credits = parseInt(session.metadata.credits || "0", 10);
              if (userId && credits > 0) {
                const { data: pr } = await supabase
                  .from("payment_records")
                  .select("id, metadata")
                  .eq("stripe_session_id", session.id)
                  .maybeSingle();
                const alreadyCredited = (pr?.metadata as any)?.santa_credited === true;
                if (!alreadyCredited) {
                  await supabase.rpc("add_secret_santa_credits", {
                    p_user_id: userId,
                    p_amount: credits,
                  });
                  if (pr?.id) {
                    await supabase.from("payment_records").update({
                      metadata: { ...(pr.metadata as any || {}), santa_credited: true },
                    }).eq("id", pr.id);
                  }
                  log("secret santa credits credited", { userId, credits, sessionId: session.id });
                }
              }
            }
          } catch (ssErr) {
            log("secret santa webhook error", { err: (ssErr as Error).message });
          }

          // ── Dating Premium subscription fulfillment ──
          try {
            const dt = session.metadata?.type;
            if (dt === "dating_monthly" || dt === "dating_yearly") {
              const userId = session.metadata?.user_id;
              if (userId && session.mode === "subscription") {
                const isYearly = dt === "dating_yearly";
                const expiresAt = new Date(
                  Date.now() + (isYearly ? 365 : 30) * 24 * 60 * 60 * 1000
                ).toISOString();
                const subId = typeof session.subscription === "string"
                  ? session.subscription
                  : (session.subscription as any)?.id ?? null;
                await supabase.from("dating_subscriptions").upsert({
                  user_id: userId,
                  status: "active",
                  subscription_type: isYearly ? "yearly" : "monthly",
                  price: isYearly ? 20.00 : 2.00,
                  expires_at: expiresAt,
                  stripe_subscription_id: subId,
                  updated_at: new Date().toISOString(),
                }, { onConflict: "user_id" });
                log("dating subscription activated", { userId, type: dt, sessionId: session.id });
              }
            }
          } catch (dErr) {
            log("dating webhook error", { err: (dErr as Error).message });
          }

          // ── Best Friend message pack fulfillment (+100 bonus messages) ──
          try {
            if (session.metadata?.type === "best_friend_messages" || session.metadata?.product === "best_friend_messages") {
              const userId = session.metadata?.user_id;
              if (userId) {
                const { data: pr } = await supabase
                  .from("payment_records")
                  .select("id, metadata")
                  .eq("stripe_session_id", session.id)
                  .maybeSingle();
                const alreadyCredited = (pr?.metadata as any)?.best_friend_messages_credited === true;
                if (!alreadyCredited) {
                  const { data: cur } = await supabase
                    .from("best_friend_subscriptions")
                    .select("bonus_messages")
                    .eq("user_id", userId)
                    .maybeSingle();
                  if (cur) {
                    await supabase.from("best_friend_subscriptions")
                      .update({
                        bonus_messages: (cur.bonus_messages || 0) + 100,
                        updated_at: new Date().toISOString(),
                      })
                      .eq("user_id", userId);
                  } else {
                    await supabase.from("best_friend_subscriptions").insert({
                      user_id: userId,
                      subscription_status: "free",
                      free_messages_used: 0,
                      monthly_messages_used: 0,
                      bonus_messages: 100,
                    });
                  }
                  if (pr?.id) {
                    await supabase.from("payment_records").update({
                      metadata: { ...(pr.metadata as any || {}), best_friend_messages_credited: true },
                    }).eq("id", pr.id);
                  }
                  log("best friend bonus messages credited", { userId, amount: 100, sessionId: session.id });
                }
              }
            }
          } catch (bfErr) {
            log("best friend messages webhook error", { err: (bfErr as Error).message });
          }
        }
        break;
      }

      // ─── REFUND (manual via Stripe dashboard or admin button) ────────
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const piId =
          typeof charge.payment_intent === "string" ? charge.payment_intent : null;
        if (!piId) break;
        const refundAmount = charge.amount_refunded ?? 0;
        const lastRefund = charge.refunds?.data?.[0];

        const { error } = await supabase
          .from("payment_records")
          .update({
            status: "refunded",
            refunded_at: new Date().toISOString(),
            refund_amount_cents: refundAmount,
            stripe_refund_id: lastRefund?.id ?? null,
            refund_reason: lastRefund?.reason ?? "stripe_dashboard",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", piId);
        if (error) log("refund sync failed", { error: error.message });

        // ── Megatalent refund: flip mt_* row to refunded ────────────────
        try {
          for (const t of ["mt_mentorship_bookings", "mt_marketplace_orders"]) {
            await supabase.from(t).update({
              status: "refunded",
            }).eq("stripe_payment_intent_id", piId);
          }
        } catch (e) {
          log("mt refund handler error", { err: (e as Error).message });
        }



        // ── Campaign donation refund: decrement campaign total, mark donation refunded ──
        try {
          const { data: drRes, error: drErr } = await supabase.rpc(
            "refund_campaign_donation",
            {
              _stripe_payment_id: piId,
              _stripe_refund_id: lastRefund?.id ?? null,
              _refund_amount: refundAmount > 0 ? refundAmount / 100 : null,
            },
          );
          if (drErr) log("donation refund rpc failed", { err: drErr.message });
          else if ((drRes as any)?.status === "refunded") {
            log("donation refunded via webhook", drRes);
          }
        } catch (e) {
          log("donation refund handler error", { err: (e as Error).message });
        }

        // ── Job listing refund: deactivate listing + mark payment refunded ──
        try {
          const { data: jlPay } = await supabase
            .from("job_listing_payments")
            .select("id, job_id")
            .eq("stripe_payment_intent_id", piId)
            .maybeSingle();
          if (jlPay?.job_id) {
            await supabase
              .from("job_listing_payments")
              .update({
                status: "refunded",
                refunded_at: new Date().toISOString(),
                refund_amount: refundAmount,
              })
              .eq("id", jlPay.id);
            await supabase
              .from("job_listings")
              .update({
                paid_status: "refunded",
                is_active: false,
                updated_at: new Date().toISOString(),
              })
              .eq("id", jlPay.job_id);
            log("job listing refunded via webhook", { jobId: jlPay.job_id, piId });
          }
        } catch (e) {
          log("job listing refund handler error", { err: (e as Error).message });
        }
        break;
      }

      // ─── DISPUTE LIFECYCLE (chargeback) ──────────────────────────────
      case "charge.dispute.created":
      case "charge.dispute.updated":
      case "charge.dispute.closed":
      case "charge.dispute.funds_withdrawn":
      case "charge.dispute.funds_reinstated": {
        const dispute = event.data.object as Stripe.Dispute;
        const piId =
          typeof dispute.payment_intent === "string" ? dispute.payment_intent : null;
        const chargeId =
          typeof dispute.charge === "string" ? dispute.charge : null;

        // Find linked payment_record
        let paymentRecordId: string | null = null;
        if (piId) {
          const { data: pr } = await supabase
            .from("payment_records")
            .select("id")
            .eq("stripe_payment_intent_id", piId)
            .maybeSingle();
          paymentRecordId = pr?.id ?? null;
        }

        const resolution =
          dispute.status === "won"
            ? "won"
            : dispute.status === "lost"
              ? "lost"
              : dispute.status === "warning_closed"
                ? "warning_closed"
                : null;

        // Upsert into stripe_disputes
        const { error: dispErr } = await supabase
          .from("stripe_disputes")
          .upsert(
            {
              stripe_dispute_id: dispute.id,
              stripe_payment_intent_id: piId,
              stripe_charge_id: chargeId,
              payment_record_id: paymentRecordId,
              amount_cents: dispute.amount,
              currency: dispute.currency,
              reason: dispute.reason,
              status: dispute.status,
              evidence_due_by: dispute.evidence_details?.due_by
                ? new Date(dispute.evidence_details.due_by * 1000).toISOString()
                : null,
              evidence: (dispute.evidence as any) ?? {},
              is_charge_refundable: dispute.is_charge_refundable ?? true,
              resolved_at: resolution ? new Date().toISOString() : null,
              resolution,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "stripe_dispute_id" },
          );
        if (dispErr) log("dispute upsert failed", { error: dispErr.message });

        // Mark payment as disputed (only on first event)
        if (event.type === "charge.dispute.created" && piId) {
          await supabase
            .from("payment_records")
            .update({
              status: "disputed",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_payment_intent_id", piId);

          await supabase.from("admin_audit_log").insert({
            admin_id: "00000000-0000-0000-0000-000000000000",
            action: "stripe_dispute_opened",
            target_type: "payment_records",
            target_id: piId,
            details: {
              dispute_id: dispute.id,
              reason: dispute.reason,
              amount: dispute.amount,
            },
          });
        }

        // ── Job listing dispute: deactivate listing on dispute.created ─────
        if (event.type === "charge.dispute.created" && piId) {
          try {
            const { data: jlPay } = await supabase
              .from("job_listing_payments")
              .select("id, job_id")
              .eq("stripe_payment_intent_id", piId)
              .maybeSingle();
            if (jlPay?.job_id) {
              await supabase
                .from("job_listing_payments")
                .update({ status: "disputed" })
                .eq("id", jlPay.id);
              await supabase
                .from("job_listings")
                .update({
                  paid_status: "disputed",
                  is_active: false,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", jlPay.job_id);
              log("job listing disputed via webhook", { jobId: jlPay.job_id, piId });
            }
          } catch (e) {
            log("job listing dispute handler error", { err: (e as Error).message });
          }
        }
        break;
      }

      // ─── SUBSCRIPTION ACTIVATED → credit referrer €5 (one-shot) ──────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;

        // ── Megatalent: instantly sync subscription state so premium unlocks ──
        await syncMegatalentSubscription(supabase, stripe, sub);

        // ── Brand sponsorship status sync (active / past_due / paused) ──
        try {
          const targetStatus =
            sub.status === "active" || sub.status === "trialing"
              ? "active"
              : sub.status === "past_due" || sub.status === "unpaid"
              ? "past_due"
              : sub.status === "paused"
              ? "paused"
              : sub.status;
          const endIso = (sub as any).current_period_end
            ? new Date((sub as any).current_period_end * 1000).toISOString()
            : null;
          await supabase
            .from("brand_sponsors")
            .update({
              subscription_status: targetStatus,
              ...(endIso ? { subscription_end: endIso } : {}),
            })
            .eq("stripe_subscription_id", sub.id);
        } catch (e) {
          log("brand sponsor status sync error", { err: (e as Error).message });
        }

        if (sub.status !== "active" && sub.status !== "trialing") break;

        // Win-back claim detection via metadata
        const winbackId = sub.metadata?.winback_campaign_id;
        if (winbackId) {
          await supabase
            .from("winback_campaigns")
            .update({
              status: "claimed",
              claimed_at: new Date().toISOString(),
              claimed_subscription_id: sub.id,
            })
            .eq("id", winbackId)
            .neq("status", "claimed");
          log("winback claimed", { campaign: winbackId, sub: sub.id });
        }

        // Resolve buyer's user_id via customer email → profiles
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        if (!customerId) break;
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) break;
        const email = (customer as Stripe.Customer).email;
        if (!email) break;

        const { data: buyerProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .maybeSingle();
        if (!buyerProfile?.id) {
          log("referral skip: no profile for email", { email });
          break;
        }

        // Find attribution row
        const { data: attr } = await supabase
          .from("referral_attributions")
          .select("id, referrer_id, rewarded_at, status")
          .eq("referred_user_id", buyerProfile.id)
          .maybeSingle();
        if (!attr || attr.rewarded_at) break; // no referrer or already rewarded
        if (attr.status !== "approved") {
          log("referral skip: status not approved", { status: attr.status });
          break;
        }

        // Note: actual €5 credit happens on `invoice.payment_succeeded` (so it
        // also fires on every renewal). Here we only stamp `rewarded_at` on
        // the attribution to mark the first activation.
        await supabase
          .from("referral_attributions")
          .update({
            rewarded_at: new Date().toISOString(),
            first_subscription_id: sub.id,
          })
          .eq("id", attr.id);

        log("referral attribution marked active (credit fires on invoice)", {
          referrer: attr.referrer_id,
          sub: sub.id,
        });
        break;
      }

      // ─── SUBSCRIPTION CANCELLED → create win-back campaign ──────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        // ── Megatalent: deactivate subscription row immediately ─────────────
        await syncMegatalentSubscription(supabase, stripe, sub);

        // ── Campaign donation: mark monthly donation subscription cancelled ──
        try {
          const nowIso = new Date().toISOString();
          const { error: cdErr } = await supabase
            .from("campaign_donations")
            .update({
              subscription_status: "cancelled",
              cancelled_at: nowIso,
            })
            .eq("stripe_subscription_id", sub.id);
          if (cdErr) log("donation cancel update failed", { err: cdErr.message });
        } catch (e) {
          log("donation cancel handler error", { err: (e as Error).message });
        }

        // ── Brand sponsorship: hard cancel ──
        try {
          await supabase
            .from("brand_sponsors")
            .update({ subscription_status: "cancelled" })
            .eq("stripe_subscription_id", sub.id);
        } catch (e) {
          log("brand sponsor delete handler error", { err: (e as Error).message });
        }

        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        if (!customerId) break;
        let email: string | null = null;
        try {
          const cust = await stripe.customers.retrieve(customerId);
          if (!cust.deleted) email = (cust as Stripe.Customer).email ?? null;
        } catch (_e) { /* ignore */ }
        if (!email) { log("winback skip: no email"); break; }

        const { data: prof } = await supabase
          .from("profiles").select("id").eq("email", email).maybeSingle();
        if (!prof?.id) { log("winback skip: no profile"); break; }

        // Skip if user already has an open campaign for this sub
        const { data: existing } = await supabase
          .from("winback_campaigns")
          .select("id")
          .eq("stripe_subscription_id", sub.id)
          .maybeSingle();
        if (existing) { log("winback skip: already exists"); break; }

        const lastAmount = sub.items.data[0]?.price.unit_amount ?? null;
        const { error: wErr } = await supabase.from("winback_campaigns").insert({
          user_id: prof.id,
          email,
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
          last_amount_cents: lastAmount,
          currency: (sub.currency ?? "eur").toLowerCase(),
          status: "sent",
          sent_at: new Date().toISOString(),
        });
        if (wErr) log("winback insert failed", { err: wErr.message });
        else log("winback campaign created", { user: prof.id, sub: sub.id });
        break;
      }

      // ─── DUNNING: invoice payment failed (subscription past_due) ─────
      case "invoice.payment_failed":
      case "invoice.payment_action_required": {
        const inv = event.data.object as Stripe.Invoice;
        const customerId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
        const subId = typeof (inv as any).subscription === "string"
          ? (inv as any).subscription
          : (inv as any).subscription?.id;
        if (!customerId || !subId) { log("dunning skip: no cust/sub"); break; }

        // Resolve user_id via email
        let userId: string | null = null;
        let email: string | null = (inv as any).customer_email ?? null;
        if (!email) {
          try {
            const cust = await stripe.customers.retrieve(customerId);
            if (!cust.deleted) email = (cust as Stripe.Customer).email ?? null;
          } catch (_e) { /* ignore */ }
        }
        if (email) {
          const { data: prof } = await supabase
            .from("profiles").select("id").eq("email", email).maybeSingle();
          userId = prof?.id ?? null;
        }

        const kind = event.type === "invoice.payment_action_required"
          ? "requires_action" : "failed";

        const { error: dErr } = await supabase.from("dunning_events").insert({
          stripe_event_id: event.id,
          stripe_customer_id: customerId,
          stripe_subscription_id: subId,
          stripe_invoice_id: inv.id,
          user_id: userId,
          email,
          amount_due_cents: inv.amount_due ?? 0,
          currency: (inv.currency ?? "eur").toLowerCase(),
          attempt_count: inv.attempt_count ?? 0,
          next_retry_at: inv.next_payment_attempt
            ? new Date(inv.next_payment_attempt * 1000).toISOString()
            : null,
          hosted_invoice_url: inv.hosted_invoice_url ?? null,
          kind,
        });
        if (dErr && !dErr.message.includes("duplicate")) {
          log("dunning insert failed", { err: dErr.message });
        } else {
          log("dunning recorded", { sub: subId, kind, attempt: inv.attempt_count });
        }

        // ── Campaign donation: flag monthly donation as past_due + in-app notify ──
        try {
          const { data: dons, error: cdErr } = await supabase
            .from("campaign_donations")
            .update({
              subscription_status: "past_due",
              past_due_since: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subId)
            .is("past_due_since", null)
            .select("id, donor_id, campaign_id, campaign_type, amount, currency");
          if (cdErr) log("donation past_due update failed", { err: cdErr.message });

          // Fallback fetch if no rows updated (already past_due) — still notify on first webhook
          let targets = dons ?? [];
          if (!targets.length) {
            const { data: existing } = await supabase
              .from("campaign_donations")
              .select("id, donor_id, campaign_id, campaign_type, amount, dunning_notifications_sent")
              .eq("stripe_subscription_id", subId)
              .limit(5);
            targets = (existing ?? []).filter((d: any) => (d.dunning_notifications_sent ?? 0) === 0);
          }

          for (const d of targets as any[]) {
            if (!d.donor_id) continue;
            await supabase.from("notifications").insert({
              user_id: d.donor_id,
              type: "donation_payment_failed",
              title: "Monthly donation payment failed",
              message: `We couldn't charge your card for your recurring donation. Please update your payment method to keep supporting this campaign.`,
              related_id: d.campaign_id,
              
            });
            await supabase
              .from("campaign_donations")
              .update({
                dunning_notifications_sent: 1,
                last_dunning_at: new Date().toISOString(),
              })
              .eq("id", d.id);
          }
        } catch (e) {
          log("donation past_due handler error", { err: (e as Error).message });
        }
        break;
      }

      // ─── DUNNING: invoice eventually paid → mark recovered ───────────
      case "invoice.payment_succeeded": {
        const inv = event.data.object as Stripe.Invoice;
        const subId = typeof (inv as any).subscription === "string"
          ? (inv as any).subscription
          : (inv as any).subscription?.id;
        if (!subId) break;

        // Mark any open dunning rows for this sub as recovered
        const { error: rErr } = await supabase
          .from("dunning_events")
          .update({
            kind: "recovered",
            recovered_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subId)
          .in("kind", ["failed", "requires_action"]);
        if (rErr) log("dunning recover failed", { err: rErr.message });

        // ─── CREATOR SUBSCRIPTION: 85/15 earnings ledger ─────────────
        // Triggered on initial payment + every renewal. Idempotent via
        // unique stripe_invoice_id. Reads kind/metadata from the parent
        // Stripe Subscription (set in subscribe-to-creator).
        try {
          const subObj = await stripe.subscriptions.retrieve(subId);
          const meta = (subObj.metadata ?? {}) as Record<string, string>;
          if (meta.kind === "creator_subscription") {
            const grossCents = (inv as any).amount_paid ?? 0;
            if (grossCents > 0 && inv.id) {
              const feePct = Number(meta.platform_fee_pct ?? "15");
              const platformFeeCents = Math.round((grossCents * feePct) / 100);
              const netCents = grossCents - platformFeeCents;
              const period = (inv as any).lines?.data?.[0]?.period;
              const periodStart = period?.start
                ? new Date(period.start * 1000).toISOString() : null;
              const periodEnd = period?.end
                ? new Date(period.end * 1000).toISOString() : null;

              const { error: earnErr } = await supabase
                .from("creator_subscription_earnings")
                .insert({
                  creator_id: meta.creator_id,
                  subscriber_id: meta.subscriber_id,
                  tier_id: meta.tier_id,
                  stripe_subscription_id: subId,
                  stripe_invoice_id: inv.id,
                  gross_cents: grossCents,
                  platform_fee_cents: platformFeeCents,
                  net_cents: netCents,
                  platform_fee_pct: feePct,
                  currency: (inv.currency ?? "eur").toLowerCase(),
                  period_start: periodStart,
                  period_end: periodEnd,
                  payout_state: "available",
                });
              if (earnErr) {
                if (!earnErr.message?.toLowerCase().includes("duplicate")) {
                  log("creator earnings insert failed", { err: earnErr.message });
                }
              } else {
                log("creator subscription earning recorded", {
                  invoice: inv.id, creator: meta.creator_id,
                  gross: grossCents, net: netCents, fee: platformFeeCents,
                });
              }

              // Upsert active creator_subscriptions row (period end refresh)
              await supabase
                .from("creator_subscriptions")
                .upsert({
                  subscriber_id: meta.subscriber_id,
                  creator_id: meta.creator_id,
                  tier_id: meta.tier_id,
                  stripe_subscription_id: subId,
                  status: "active",
                  current_period_end: periodEnd,
                }, { onConflict: "subscriber_id,tier_id" });
            }
          }
        } catch (e) {
          log("creator subscription earnings handler error", { err: (e as Error).message });
        }


        // ─── CAMPAIGN DONATION: record monthly renewal + bump campaign total ──
        try {
          const { data: parent } = await supabase
            .from("campaign_donations")
            .select("id, campaign_id, campaign_type, donor_id, donor_email, donor_name, amount, is_anonymous, message")
            .eq("stripe_subscription_id", subId)
            .eq("is_monthly", true)
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle();

          if (parent) {
            const paidCents = (inv as any).amount_paid ?? 0;
            const piId = typeof (inv as any).payment_intent === "string"
              ? (inv as any).payment_intent
              : (inv as any).payment_intent?.id ?? null;
            const renewalPaymentId = piId || inv.id;
            const nextBilling = (inv as any).lines?.data?.[0]?.period?.end
              ? new Date(((inv as any).lines.data[0].period.end as number) * 1000).toISOString()
              : null;

            if (paidCents > 0 && renewalPaymentId) {
              const { data: rpcRes, error: rpcErr } = await supabase.rpc(
                "process_campaign_donation",
                {
                  _campaign_id: parent.campaign_id,
                  _campaign_type: parent.campaign_type,
                  _donor_id: parent.donor_id,
                  _donor_email: parent.donor_email,
                  _donor_name: parent.donor_name,
                  _amount: paidCents / 100,
                  _is_monthly: true,
                  _is_anonymous: parent.is_anonymous ?? false,
                  _message: parent.message,
                  _stripe_payment_id: renewalPaymentId,
                },
              );
              if (rpcErr) log("donation renewal RPC failed", { err: rpcErr.message });
              else log("donation renewal recorded", rpcRes);
            }

            // Re-activate parent donation row + clear dunning state
            await supabase
              .from("campaign_donations")
              .update({
                subscription_status: "active",
                next_billing_at: nextBilling,
                past_due_since: null,
                dunning_notifications_sent: 0,
                last_dunning_at: null,
              })
              .eq("stripe_subscription_id", subId);
          }
        } catch (e) {
          log("donation renewal handler error", { err: (e as Error).message });
        }
        // ─── RECURRING REFERRAL REWARD ─────────────────────────────────
        // Credit referrer on EVERY successful subscription invoice (initial
        // + every renewal). Idempotent via unique source_invoice_id.
        try {
          if (!inv.id) break;
          // Only count actual paid charges (skip €0 invoices, credits, etc.)
          const amountPaid = (inv as any).amount_paid ?? 0;
          if (amountPaid <= 0) {
            log("referral skip: zero-amount invoice", { invoice: inv.id });
            break;
          }

          const customerId = typeof inv.customer === "string"
            ? inv.customer
            : (inv.customer as any)?.id;
          if (!customerId) break;

          // Resolve buyer via Stripe customer email → profile
          let email: string | null = (inv as any).customer_email ?? null;
          if (!email) {
            const cust = await stripe.customers.retrieve(customerId);
            if (!cust.deleted) email = (cust as Stripe.Customer).email ?? null;
          }
          if (!email) { log("referral skip: no email"); break; }

          const { data: buyerProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", email)
            .maybeSingle();
          if (!buyerProfile?.id) {
            log("referral skip: no profile for email", { email });
            break;
          }

          // Find approved attribution
          const { data: attr } = await supabase
            .from("referral_attributions")
            .select("id, referrer_id, status")
            .eq("referred_user_id", buyerProfile.id)
            .maybeSingle();
          if (!attr) break;
          if (attr.status !== "approved") {
            log("referral skip: attribution not approved", { status: attr.status });
            break;
          }

          // Tiered referral reward — referrer only:
          //   Premium     → €5
          //   Top Premium → €10
          const invoiceTier = (inv as any).lines?.data
            ?.map((ln: any) => MEGATALENT_PRICE_TO_TIER[ln.price?.id])
            .find(Boolean);
          const referrerRewardEur = invoiceTier === "top_premium" ? 10 : 5;

          const periodStart = new Date().toISOString();
          const periodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

          const { error: earnErr } = await supabase
            .from("megatalent_referral_earnings")
            .insert({
              referrer_id: attr.referrer_id,
              referred_user_id: buyerProfile.id,
              amount: referrerRewardEur,
              paid: false,
              period_start: periodStart,
              period_end: periodEnd,
              source_subscription_id: subId,
              source_invoice_id: inv.id,
              source_kind: "subscription",
              auto_credited: true,
            });

          if (earnErr) {
            if (earnErr.message?.toLowerCase().includes("duplicate")) {
              log("referral already credited for invoice", { invoice: inv.id });
            } else {
              log("referral earning insert failed", { error: earnErr.message });
            }
            break;
          }

          // Mark first-payment timestamp on the attribution (one-shot)
          if (!(await hasRewardedAt(supabase, attr.id))) {
            await supabase
              .from("referral_attributions")
              .update({
                rewarded_at: new Date().toISOString(),
                first_subscription_id: subId,
              })
              .eq("id", attr.id);
          }

          await supabase.from("admin_audit_log").insert({
            admin_id: "00000000-0000-0000-0000-000000000000",
            action: "referral_recurring_reward_credited",
            target_type: "megatalent_referral_earnings",
            target_id: attr.referrer_id,
            details: {
              referrer_id: attr.referrer_id,
              referred_user_id: buyerProfile.id,
              subscription_id: subId,
              invoice_id: inv.id,
              tier: invoiceTier ?? "premium",
              referrer_amount_eur: referrerRewardEur,
            },
          });
          // Notification: referrer only
          try {
            await supabase.from("notifications").insert({
              user_id: attr.referrer_id,
              type: "referral_bonus",
              title: `+${referrerRewardEur} € referral bonus`,
              message: `Your invited user paid for a subscription — we credited you a €${referrerRewardEur} bonus.`,
              is_read: false,
            });
          } catch (notifErr) {
            log("notification insert failed", { err: (notifErr as Error).message });
          }

          log("recurring referral reward credited", {
            referrer: attr.referrer_id,
            referred: buyerProfile.id,
            invoice: inv.id,
            referrer_amount: referrerRewardEur,
          });
        } catch (refErr) {
          log("recurring referral handler error", {
            err: (refErr as Error).message,
          });
        }
        break;
      }

      // ─── TRANSFER (Connect payout to creator confirmed) ──────────────
      case "transfer.created": {
        const transfer = event.data.object as Stripe.Transfer;
        log("transfer confirmed", { id: transfer.id, dest: transfer.destination });
        // Already recorded by admin-payout-withdrawal; nothing to do.
        break;
      }

      // ── Connect account state changes (verification, capabilities, payouts) ──
      case "account.updated": {
        const acct = event.data.object as Stripe.Account;
        const reqs = (acct.requirements ?? {}) as Stripe.Account.Requirements;
        const caps = (acct.capabilities ?? {}) as Record<string, string>;
        const sched = (acct.settings?.payouts?.schedule ?? null) as any;
        const { error } = await supabase.from("profiles").update({
          stripe_connect_charges_enabled: !!acct.charges_enabled,
          stripe_connect_payouts_enabled: !!acct.payouts_enabled,
          stripe_connect_onboarding_complete: !!acct.details_submitted,
          stripe_connect_details_submitted: !!acct.details_submitted,
          stripe_connect_disabled_reason: reqs.disabled_reason ?? null,
          stripe_connect_currently_due: reqs.currently_due ?? [],
          stripe_connect_past_due: reqs.past_due ?? [],
          stripe_connect_eventually_due: reqs.eventually_due ?? [],
          stripe_connect_default_currency: acct.default_currency ?? null,
          stripe_connect_payout_schedule: sched,
          stripe_connect_country: acct.country ?? null,
          stripe_connect_capabilities: caps,
          stripe_connect_account_type: acct.type ?? null,
          stripe_connect_synced_at: new Date().toISOString(),
        }).eq("stripe_connect_account_id", acct.id);
        if (error) log("account.updated sync failed", { err: error.message });
        else log("account.updated synced", { acct: acct.id, payouts: acct.payouts_enabled });
        break;
      }

      // Payout lifecycle — useful for showing pending/paid transfers in UI
      case "payout.created":
      case "payout.paid":
      case "payout.failed": {
        const p = event.data.object as Stripe.Payout;
        log("payout event", { type: event.type, id: p.id, status: p.status, amount: p.amount });
        break;
      }

      // ─── TRIAL ENDING SOON (3 days notice) ───────────────────────────
      case "customer.subscription.trial_will_end": {
        const sub = event.data.object as Stripe.Subscription;
        try {
          const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
          if (!customerId) break;
          const cust = await stripe.customers.retrieve(customerId);
          if (cust.deleted) break;
          const email = (cust as Stripe.Customer).email;
          if (!email) break;
          const { data: prof } = await supabase
            .from("profiles").select("id").eq("email", email).maybeSingle();
          if (!prof?.id) break;
          const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000) : null;
          await supabase.from("notifications").insert({
            user_id: prof.id,
            type: "subscription_trial_ending",
            title: "Your trial ends soon ⏰",
            message: trialEnd
              ? `Your free trial ends on ${trialEnd.toLocaleDateString()}. Update payment to keep your subscription active.`
              : "Your free trial ends in 3 days. Update payment to keep your subscription active.",
            is_read: false,
          });
          log("trial_will_end notified", { user: prof.id, sub: sub.id });
        } catch (e) {
          log("trial_will_end handler error", { err: (e as Error).message });
        }
        break;
      }

      // ─── SUBSCRIPTION PAUSED / RESUMED ───────────────────────────────
      case "customer.subscription.paused":
      case "customer.subscription.resumed": {
        const sub = event.data.object as Stripe.Subscription;
        // Sync megatalent (other modules use check-* funcs which read Stripe live)
        try { await syncMegatalentSubscription(supabase, stripe, sub); } catch (_) {}
        try {
          const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
          if (!customerId) break;
          const cust = await stripe.customers.retrieve(customerId);
          if (cust.deleted) break;
          const email = (cust as Stripe.Customer).email;
          if (!email) break;
          const { data: prof } = await supabase
            .from("profiles").select("id").eq("email", email).maybeSingle();
          if (!prof?.id) break;
          const paused = event.type === "customer.subscription.paused";
          await supabase.from("notifications").insert({
            user_id: prof.id,
            type: paused ? "subscription_paused" : "subscription_resumed",
            title: paused ? "Subscription paused ⏸️" : "Subscription resumed ▶️",
            message: paused
              ? "Your subscription is paused — no charges until you resume it."
              : "Welcome back! Your subscription is active again.",
            is_read: false,
          });
          log("subscription pause/resume notified", { user: prof.id, type: event.type });
        } catch (e) {
          log("pause/resume handler error", { err: (e as Error).message });
        }
        break;
      }

      default:
        log("ignored event type", { type: event.type });
    }

    await supabase
      .from("stripe_webhook_events")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("event_id", event.id);

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("handler error", { msg });
    await supabase
      .from("stripe_webhook_events")
      .update({ status: "error", error: msg, processed_at: new Date().toISOString() })
      .eq("event_id", event.id);
    // Return 200 anyway so Stripe doesn't retry forever on logic bugs.
    return new Response(JSON.stringify({ received: true, error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});

// Returns true if the attribution row already has rewarded_at stamped.
async function hasRewardedAt(
  supabase: ReturnType<typeof createClient>,
  attributionId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("referral_attributions")
    .select("rewarded_at")
    .eq("id", attributionId)
    .maybeSingle();
  return !!(data as any)?.rewarded_at;
}
