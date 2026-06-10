// Megatalent unified router. Consolidates 8 mt-* edge functions into a single
// action-switch endpoint. Auth/cron checks live per-action; the global
// `verify_jwt = false` keeps cron actions reachable without a user JWT.
//
// Actions:
//   checkout              -> Stripe Checkout for mentorship/marketplace
//   release_funds         -> Buyer releases 80% to seller via Connect
//   claim_streak          -> Voting streak day reward (XP / boost / premium)
//   claim_achievement     -> Achievement reward (XP + credits)
//   quest_increment       -> Increment daily quest progress
//   season_claim_tier     -> Claim season pass tier (XP + credits)
//   stories_cleanup       -> CRON: purge expired stories
//   escrow_auto_release   -> CRON: release stale paid orders/bookings

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const SELLER_PCT = 80;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );
}

async function requireUser(req: Request) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("unauthorized");
  const { data, error } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );
  if (error || !data.user) throw new Error("unauthorized");
  return data.user;
}

function requireCron(req: Request) {
  const secret = Deno.env.get("CRON_SECRET");
  if (secret && req.headers.get("x-cron-secret") !== secret) {
    throw new Error("unauthorized_cron");
  }
}

// ---------- actions ----------

async function actionCheckout(req: Request, body: any) {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");
  const user = await requireUser(req);
  if (!user.email) throw new Error("user_email_missing");

  const kind: "mentorship" | "marketplace" = body?.kind;
  let id: string | undefined = body?.id;
  const listing_id: string | undefined = body?.listing_id;
  if (!["mentorship", "marketplace"].includes(kind)) {
    throw new Error("Invalid body: { kind } required");
  }
  if (!id && !listing_id) throw new Error("id or listing_id required");

  const sb = admin();
  let amountCents = 0;
  let title = "";

  if (kind === "mentorship") {
    if (!id) throw new Error("id required for mentorship");
    const { data: row, error } = await sb
      .from("mt_mentorship_bookings")
      .select("id, student_id, price_cents, status, mt_mentors!inner(display_name)")
      .eq("id", id)
      .maybeSingle();
    if (error || !row) throw new Error("Booking not found");
    if ((row as any).student_id !== user.id) throw new Error("Not your booking");
    if ((row as any).status !== "pending") throw new Error("Booking not payable");
    amountCents = (row as any).price_cents;
    title = `Mentorship: ${(row as any).mt_mentors?.display_name ?? "Session"}`;
  } else {
    if (!id && listing_id) {
      const { data: listing, error: lerr } = await sb
        .from("mt_marketplace_listings")
        .select("id, seller_id, title, price_cents, active, eta_days")
        .eq("id", listing_id)
        .maybeSingle();
      if (lerr || !listing) throw new Error("Listing not found");
      if (!listing.active) throw new Error("Listing inactive");
      if (listing.seller_id === user.id) throw new Error("Cannot buy own listing");
      if (!listing.price_cents || listing.price_cents < 100) throw new Error("Invalid price");

      const { data: existing } = await sb
        .from("mt_marketplace_orders")
        .select("id")
        .eq("buyer_id", user.id)
        .eq("listing_id", listing_id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing?.id) id = existing.id;
      else {
        const { data: ins, error: insErr } = await sb
          .from("mt_marketplace_orders")
          .insert({
            listing_id,
            buyer_id: user.id,
            seller_id: listing.seller_id,
            price_cents: listing.price_cents,
            status: "pending",
            delivery_due_at: new Date(
              Date.now() + listing.eta_days * 86400000,
            ).toISOString(),
          })
          .select("id")
          .single();
        if (insErr || !ins) throw new Error(insErr?.message || "Order insert failed");
        id = ins.id;
      }
    }

    const { data: row, error } = await sb
      .from("mt_marketplace_orders")
      .select("id, buyer_id, price_cents, status, mt_marketplace_listings!inner(title)")
      .eq("id", id!)
      .maybeSingle();
    if (error || !row) throw new Error("Order not found");
    if ((row as any).buyer_id !== user.id) throw new Error("Not your order");
    if ((row as any).status !== "pending") throw new Error("Order not payable");
    amountCents = (row as any).price_cents;
    title = `Marketplace: ${(row as any).mt_marketplace_listings?.title ?? "Listing"}`;
  }

  if (!id) throw new Error("internal: missing row id");

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const customers = await stripe.customers.list({ email: user.email, limit: 1 });
  const customerId = customers.data[0]?.id;
  const origin = req.headers.get("origin") || "https://uniqueapp.fun";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    customer_email: customerId ? undefined : user.email,
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "eur",
        unit_amount: amountCents,
        product_data: { name: title },
      },
      quantity: 1,
    }],
    metadata: { mt_kind: kind, mt_row_id: id, user_id: user.id },
    payment_intent_data: {
      metadata: { mt_kind: kind, mt_row_id: id, user_id: user.id },
    },
    success_url: `${origin}/megatalent?mt_paid=1`,
    cancel_url: `${origin}/megatalent?mt_cancelled=1`,
  });

  const table = kind === "mentorship" ? "mt_mentorship_bookings" : "mt_marketplace_orders";
  await sb.from(table).update({ stripe_session_id: session.id }).eq("id", id);

  return json({ url: session.url });
}

async function actionReleaseFunds(req: Request, body: any) {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");
  const user = await requireUser(req);

  const kind = String(body?.kind || "") as "mentorship" | "marketplace";
  const id = String(body?.id || "");
  if (!id || !["mentorship", "marketplace"].includes(kind)) {
    throw new Error("Invalid body: { kind, id } required");
  }

  const sb = admin();
  const table = kind === "mentorship" ? "mt_mentorship_bookings" : "mt_marketplace_orders";
  const buyerCol = kind === "mentorship" ? "student_id" : "buyer_id";
  const sellerCol = kind === "mentorship" ? "mentor_id" : "seller_id";

  const { data: row, error: rowErr } = await sb.from(table).select("*").eq("id", id).maybeSingle();
  if (rowErr || !row) throw new Error("Row not found");
  if ((row as any)[buyerCol] !== user.id) throw new Error("Only the buyer can release funds");
  if ((row as any).status !== "paid") throw new Error(`Cannot release: status is ${(row as any).status}`);
  if ((row as any).stripe_transfer_id) throw new Error("Funds already released");

  let sellerUserId: string;
  if (kind === "mentorship") {
    const { data: mentor } = await sb.from("mt_mentors").select("user_id").eq("id", (row as any).mentor_id).maybeSingle();
    if (!mentor?.user_id) throw new Error("Mentor profile not found");
    sellerUserId = mentor.user_id;
  } else {
    sellerUserId = (row as any)[sellerCol];
  }
  if (!sellerUserId) throw new Error("Seller missing");

  const { data: profile } = await sb
    .from("profiles")
    .select("stripe_connect_account_id, stripe_connect_payouts_enabled")
    .eq("id", sellerUserId)
    .maybeSingle();
  if (!profile?.stripe_connect_account_id) throw new Error("Seller has no Stripe Connect account");
  if (!profile.stripe_connect_payouts_enabled) throw new Error("Seller's Connect payouts not enabled");

  const grossCents = Number((row as any).price_cents);
  if (!Number.isFinite(grossCents) || grossCents <= 0) throw new Error("Invalid amount");
  const sellerCents = Math.floor((grossCents * SELLER_PCT) / 100);

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const transfer = await stripe.transfers.create(
    {
      amount: sellerCents,
      currency: "eur",
      destination: profile.stripe_connect_account_id,
      description: `MT ${kind} ${id} (80%)`,
      metadata: { mt_kind: kind, mt_row_id: id, seller_user_id: sellerUserId },
    },
    { idempotencyKey: `mt-release-${kind}-${id}` },
  );

  const now = new Date().toISOString();
  const update: Record<string, unknown> = {
    status: "completed",
    stripe_transfer_id: transfer.id,
    completed_at: now,
  };
  if (kind === "marketplace") update.delivered_at = now;
  const { error: upErr } = await sb.from(table).update(update).eq("id", id);
  if (upErr) {
    console.error("[mt-router/release_funds] DB update failed AFTER transfer", transfer.id, upErr.message);
    throw new Error(`Transfer ${transfer.id} succeeded but DB update failed: ${upErr.message}`);
  }

  return json({
    success: true,
    transfer_id: transfer.id,
    seller_cents: sellerCents,
    platform_cents: grossCents - sellerCents,
  });
}

const STREAK_REWARDS: Record<number, { label: string; xp: number; boost?: boolean; premiumDays?: number }> = {
  3: { label: "+50 XP", xp: 50 },
  7: { label: "+200 XP", xp: 200 },
  14: { label: "Boost x1", xp: 0, boost: true },
  30: { label: "Premium 1d", xp: 0, premiumDays: 1 },
};

async function actionClaimStreak(req: Request, body: any) {
  const user = await requireUser(req);
  const userId = user.id;

  const day = Number(body?.day);
  const reward = STREAK_REWARDS[day];
  if (!reward) return json({ error: "invalid_day" }, 400);

  const sb = admin();
  const { data: sub } = await sb
    .from("megatalent_subscriptions")
    .select("status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();
  const vipActive =
    sub &&
    (sub.status === "active" || sub.status === "trialing") &&
    (!sub.current_period_end || new Date(sub.current_period_end) > new Date());
  if (!vipActive) return json({ error: "vip_required" }, 402);

  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: votes } = await sb
    .from("talent_votes")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", since);
  const days = new Set<string>();
  (votes ?? []).forEach((r: any) => days.add(new Date(r.created_at).toISOString().slice(0, 10)));
  let streak = 0;
  const d = new Date();
  while (true) {
    const k = d.toISOString().slice(0, 10);
    if (days.has(k)) { streak++; d.setDate(d.getDate() - 1); }
    else if (streak === 0 && k === new Date().toISOString().slice(0, 10)) { d.setDate(d.getDate() - 1); }
    else break;
  }
  if (streak < day) return json({ error: "streak_insufficient", streak }, 400);

  const { error: insErr } = await sb.from("mt_streak_claims").insert({
    user_id: userId, day, reward_label: reward.label,
  });
  if (insErr) {
    if ((insErr as any).code === "23505") return json({ error: "already_claimed" }, 409);
    throw insErr;
  }

  if (reward.xp > 0) {
    const { data: row } = await sb.from("hub_xp").select("xp").eq("user_id", userId).eq("hub", "megatalent").maybeSingle();
    if (row) await sb.from("hub_xp").update({ xp: (row.xp ?? 0) + reward.xp }).eq("user_id", userId).eq("hub", "megatalent");
    else await sb.from("hub_xp").insert({ user_id: userId, hub: "megatalent", xp: reward.xp });
  }
  if (reward.boost) {
    await sb.from("megatalent_boosts").insert({
      user_id: userId, boost_type: "streak", multiplier: 2,
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    }).select();
  }
  if (reward.premiumDays) {
    const expires = new Date(Date.now() + reward.premiumDays * 86400000).toISOString();
    await sb.from("megatalent_subscriptions").upsert(
      { user_id: userId, tier: "premium", status: "active", current_period_end: expires },
      { onConflict: "user_id" },
    );
  }

  return json({ ok: true, reward: reward.label, streak });
}

async function actionClaimAchievement(req: Request, body: any) {
  const user = await requireUser(req);
  const achievement_key = body?.achievement_key;
  if (!achievement_key || typeof achievement_key !== "string") throw new Error("achievement_key required");

  const sb = admin();

  const { data: sub } = await sb
    .from("megatalent_subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();
  const vipActive =
    sub &&
    (sub.status === "active" || sub.status === "trialing") &&
    (!sub.current_period_end || new Date(sub.current_period_end) > new Date());
  if (!vipActive) return json({ error: "vip_required" }, 402);

  const { data: ach, error: aerr } = await sb
    .from("mt_achievements")
    .select("id, reward_xp, reward_credits, active")
    .eq("achievement_key", achievement_key)
    .maybeSingle();
  if (aerr || !ach || !ach.active) throw new Error("Achievement not found");

  const { data: ua } = await sb
    .from("mt_user_achievements")
    .select("id, unlocked_at, claimed_at")
    .eq("user_id", user.id)
    .eq("achievement_id", ach.id)
    .maybeSingle();
  if (!ua || !ua.unlocked_at) throw new Error("Achievement not unlocked");
  if (ua.claimed_at) throw new Error("Already claimed");

  const { data: claimed, error: claimErr } = await sb
    .from("mt_user_achievements")
    .update({ claimed_at: new Date().toISOString() })
    .eq("id", ua.id)
    .is("claimed_at", null)
    .select("id")
    .maybeSingle();
  if (claimErr) throw claimErr;
  if (!claimed) throw new Error("Already claimed");

  if (ach.reward_credits > 0) {
    const { data: prof } = await sb.from("profiles").select("credits").eq("user_id", user.id).maybeSingle();
    const cur = (prof as any)?.credits ?? 0;
    await sb.from("profiles").update({ credits: cur + ach.reward_credits }).eq("user_id", user.id);
  }

  return json({ ok: true, xp: ach.reward_xp, credits: ach.reward_credits });
}

async function actionQuestIncrement(req: Request, body: any) {
  const user = await requireUser(req);
  const quest_key = body?.quest_key;
  if (!quest_key || typeof quest_key !== "string") throw new Error("quest_key required");
  const inc = Math.max(1, Math.min(100, Number(body?.amount) || 1));

  const sb = admin();
  const { data: allowed } = await sb.rpc("mt_rate_limit_check", {
    _user_id: user.id,
    _action: "quest_increment",
    _window_seconds: 10,
    _max_count: 30,
  });
  if (allowed === false) return json({ error: "rate_limited" }, 429);

  const { data: quest, error: qerr } = await sb
    .from("mt_daily_quests")
    .select("quest_key, target_count, active")
    .eq("quest_key", quest_key)
    .maybeSingle();
  if (qerr || !quest || !quest.active) throw new Error("Quest not found");

  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await sb
    .from("mt_user_quest_progress")
    .select("progress, completed_at")
    .eq("user_id", user.id)
    .eq("quest_key", quest_key)
    .eq("quest_date", today)
    .maybeSingle();

  const newProgress = Math.min(quest.target_count, ((existing?.progress ?? 0) + inc));
  const completed = newProgress >= quest.target_count;
  const completed_at = completed && !existing?.completed_at ? new Date().toISOString() : existing?.completed_at ?? null;

  const { error: upErr } = await sb
    .from("mt_user_quest_progress")
    .upsert(
      { user_id: user.id, quest_key, quest_date: today, progress: newProgress, completed_at },
      { onConflict: "user_id,quest_key,quest_date" },
    );
  if (upErr) throw upErr;

  return json({ ok: true, progress: newProgress, completed });
}

async function actionSeasonClaimTier(req: Request, body: any) {
  const user = await requireUser(req);
  const season_id = String(body?.season_id ?? "").slice(0, 64);
  const tier_level = Number(body?.tier_level);
  if (!season_id || !Number.isFinite(tier_level)) throw new Error("season_id + tier_level required");

  const sb = admin();
  const { data: reward, error: rerr } = await sb
    .from("mt_season_pass_rewards")
    .select("xp_required, reward_type, reward_label, reward_payload")
    .eq("season_id", season_id)
    .eq("tier_level", tier_level)
    .maybeSingle();
  if (rerr || !reward) throw new Error("Tier not found");

  const { data: xpRow } = await sb
    .from("user_xp")
    .select("total_xp")
    .eq("user_id", user.id)
    .maybeSingle();
  const userXp = (xpRow as any)?.total_xp ?? 0;
  if (userXp < reward.xp_required) throw new Error("Not enough XP");

  const { error: insErr } = await sb.from("mt_season_pass_claims").insert({
    user_id: user.id, season_id, tier_level, reward_label: reward.reward_label,
  });
  if (insErr) {
    if ((insErr as any).code === "23505") throw new Error("Already claimed");
    throw insErr;
  }

  if (reward.reward_type === "credits") {
    const amt = Math.floor(Number((reward.reward_payload as any)?.amount ?? 0));
    if (amt > 0) {
      const { error: addErr } = await sb.rpc("add_ai_credits", {
        p_user_id: user.id,
        p_amount: amt,
        p_reason: `season_pass:${season_id}:tier_${tier_level}`,
        p_source: `season_pass_tier:${season_id}:${tier_level}`,
      });
      if (addErr) {
        console.error("[mt-router/season_claim_tier] add_ai_credits failed", addErr);
        await sb.from("mt_season_pass_claims").delete()
          .eq("user_id", user.id).eq("season_id", season_id).eq("tier_level", tier_level);
        throw new Error("Credit award failed");
      }
    }
  }

  return json({ ok: true, reward });
}

function parseStoragePath(url: string): { bucket: string; path: string } | null {
  const m = url.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+?)(?:\?|$)/);
  if (!m) return null;
  return { bucket: m[1], path: decodeURIComponent(m[2]) };
}

async function actionStoriesCleanup(req: Request) {
  requireCron(req);
  const sb = admin();

  const cutoff = new Date(Date.now() - 7 * 86400_000).toISOString();
  const { data: rows, error } = await sb
    .from("mt_stories")
    .select("id, media_url")
    .lt("expires_at", cutoff)
    .limit(500);
  if (error) throw error;

  const perBucket = new Map<string, string[]>();
  const ids: string[] = [];
  for (const r of rows ?? []) {
    ids.push(r.id);
    const p = parseStoragePath(String(r.media_url || ""));
    if (!p) continue;
    const arr = perBucket.get(p.bucket) ?? [];
    arr.push(p.path);
    perBucket.set(p.bucket, arr);
  }

  const storageErrors: string[] = [];
  for (const [bucket, paths] of perBucket) {
    for (let i = 0; i < paths.length; i += 100) {
      const chunk = paths.slice(i, i + 100);
      const { error: rmErr } = await sb.storage.from(bucket).remove(chunk);
      if (rmErr) storageErrors.push(`${bucket}: ${rmErr.message}`);
    }
  }

  let deleted = 0;
  if (ids.length) {
    const { error: delErr, count } = await sb.from("mt_stories").delete({ count: "exact" }).in("id", ids);
    if (delErr) throw delErr;
    deleted = count ?? ids.length;
  }

  return json({
    success: true,
    deleted,
    storage_buckets: Array.from(perBucket.keys()),
    storage_errors: storageErrors,
  });
}

async function actionEscrowAutoRelease(req: Request) {
  requireCron(req);
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", { apiVersion: "2025-08-27.basil" });
  const sb = admin();

  const results = {
    marketplace_released: 0,
    mentorship_released: 0,
    mentorship_cancelled: 0,
    errors: [] as string[],
  };

  const releaseRow = async (kind: "marketplace" | "mentorship", row: any) => {
    const table = kind === "mentorship" ? "mt_mentorship_bookings" : "mt_marketplace_orders";
    try {
      if (row.stripe_transfer_id) return;

      const { data: claimed, error: claimErr } = await sb
        .from(table)
        .update({ status: "processing" })
        .eq("id", row.id)
        .eq("status", "paid")
        .is("stripe_transfer_id", null)
        .select("id");
      if (claimErr) throw new Error(`claim failed: ${claimErr.message}`);
      if (!claimed || claimed.length === 0) return;

      let sellerUserId: string;
      if (kind === "mentorship") {
        const { data: mentor } = await sb.from("mt_mentors").select("user_id").eq("id", row.mentor_id).maybeSingle();
        if (!mentor?.user_id) throw new Error("mentor profile missing");
        sellerUserId = mentor.user_id;
      } else {
        sellerUserId = row.seller_id;
      }
      const { data: profile } = await sb
        .from("profiles")
        .select("stripe_connect_account_id, stripe_connect_payouts_enabled")
        .eq("id", sellerUserId)
        .maybeSingle();
      if (!profile?.stripe_connect_account_id || !profile.stripe_connect_payouts_enabled) {
        await sb.from(table).update({ status: "paid" }).eq("id", row.id).eq("status", "processing");
        throw new Error(`seller ${sellerUserId} not Connect-enabled`);
      }
      const gross = Number(row.price_cents);
      const sellerCents = Math.floor((gross * SELLER_PCT) / 100);
      const transfer = await stripe.transfers.create(
        {
          amount: sellerCents,
          currency: "eur",
          destination: profile.stripe_connect_account_id,
          description: `MT ${kind} ${row.id} (auto 80%)`,
          metadata: { mt_kind: kind, mt_row_id: row.id, auto: "1" },
        },
        { idempotencyKey: `mt-auto-release-${kind}-${row.id}` },
      );
      const now = new Date().toISOString();
      const upd: Record<string, unknown> = {
        status: "completed", stripe_transfer_id: transfer.id, completed_at: now,
      };
      if (kind === "marketplace") upd.delivered_at = now;
      await sb.from(table).update(upd).eq("id", row.id);
      if (kind === "mentorship") results.mentorship_released++;
      else results.marketplace_released++;
    } catch (e) {
      results.errors.push(`${kind}/${row.id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const marketCutoff = new Date(Date.now() - 3 * 86400_000).toISOString();
  const { data: mkRows } = await sb
    .from("mt_marketplace_orders")
    .select("*")
    .eq("status", "paid")
    .is("stripe_transfer_id", null)
    .lt("delivery_due_at", marketCutoff)
    .limit(100);
  for (const r of mkRows ?? []) await releaseRow("marketplace", r);

  const mentCutoff = new Date(Date.now() - 86400_000).toISOString();
  const { data: mentRows } = await sb
    .from("mt_mentorship_bookings")
    .select("*")
    .eq("status", "paid")
    .is("stripe_transfer_id", null)
    .lt("scheduled_at", mentCutoff)
    .limit(100);
  for (const r of mentRows ?? []) await releaseRow("mentorship", r);

  const pendCutoff = new Date(Date.now() - 3 * 86400_000).toISOString();
  const { data: cancelled, error: cErr } = await sb
    .from("mt_mentorship_bookings")
    .update({ status: "cancelled" })
    .eq("status", "pending")
    .lt("created_at", pendCutoff)
    .select("id");
  if (cErr) results.errors.push(`cancel pending: ${cErr.message}`);
  else results.mentorship_cancelled = cancelled?.length ?? 0;

  return json({ success: true, ...results });
}

// ---------- entrypoint ----------

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "");
    switch (action) {
      case "checkout":             return await actionCheckout(req, body);
      case "release_funds":        return await actionReleaseFunds(req, body);
      case "claim_streak":         return await actionClaimStreak(req, body);
      case "claim_achievement":    return await actionClaimAchievement(req, body);
      case "quest_increment":      return await actionQuestIncrement(req, body);
      case "season_claim_tier":    return await actionSeasonClaimTier(req, body);
      case "stories_cleanup":      return await actionStoriesCleanup(req);
      case "escrow_auto_release":  return await actionEscrowAutoRelease(req);
      default:
        return json({ error: `unknown_action: ${action}` }, 400);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[mt-router]", msg);
    const status =
      msg === "unauthorized" ? 401 :
      msg === "unauthorized_cron" ? 401 :
      400;
    return json({ error: msg }, status);
  }
});
