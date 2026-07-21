// Shared helpers for Unique VIP Club perks (idempotent credit grants,
// good-fund contributions, referral rewards). Import from other edge
// functions with a relative path.

import { createClient } from "npm:@supabase/supabase-js@2.57.2";

type Admin = ReturnType<typeof createClient>;

export const CLUB_MONTHLY_AI_CREDITS = 50;
export const CLUB_SIGNUP_AI_CREDITS = 50;
export const CLUB_MONTHLY_GOOD_FUND_EUR = 0.15;
export const CLUB_REFERRAL_CREDIT_EUR = 5;

/**
 * Idempotently grant AI credits to a user. Uses club_perk_grants (unique on
 * user_id, perk, period_key) to guarantee a single grant per period.
 */
export async function grantClubAiCredits(
  admin: Admin,
  args: {
    userId: string;
    membershipId: string;
    perk: "signup_ai_credits" | "monthly_ai_credits";
    periodKey: string;
    amount: number;
    stripeEventId?: string;
  },
): Promise<{ granted: boolean }> {
  // Try to insert the ledger — unique constraint prevents duplicates
  const { error: gErr } = await admin.from("club_perk_grants").insert({
    user_id: args.userId,
    membership_id: args.membershipId,
    perk: args.perk,
    amount: args.amount,
    period_key: args.periodKey,
    stripe_event_id: args.stripeEventId ?? null,
  });
  if (gErr) {
    const msg = (gErr as any).message ?? "";
    if (msg.toLowerCase().includes("duplicate")) return { granted: false };
    console.warn("[club-perks] grant insert failed", gErr);
    return { granted: false };
  }

  // Read current balance, then apply delta atomically-enough for our use
  const { data: existing } = await admin
    .from("ai_credits")
    .select("id, credits_remaining, total_credits_purchased")
    .eq("user_id", args.userId)
    .maybeSingle();

  const balanceBefore = (existing as any)?.credits_remaining ?? 0;
  const balanceAfter = balanceBefore + args.amount;

  if (existing) {
    await admin
      .from("ai_credits")
      .update({
        credits_remaining: balanceAfter,
        total_credits_purchased:
          ((existing as any).total_credits_purchased ?? 0) + args.amount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", args.userId);
  } else {
    await admin.from("ai_credits").insert({
      user_id: args.userId,
      credits_remaining: balanceAfter,
      total_credits_purchased: args.amount,
    });
  }

  await admin.from("ai_credits_ledger").insert({
    user_id: args.userId,
    delta: args.amount,
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    reason: args.perk === "signup_ai_credits"
      ? "Unique VIP Club welcome bonus"
      : "Unique VIP Club monthly credits",
    source: "club",
    metadata: { period_key: args.periodKey, stripe_event_id: args.stripeEventId ?? null },
  });

  // Notification (best-effort)
  await admin.from("notifications").insert({
    user_id: args.userId,
    type: "club_credits",
    title: "🎁 +50 AI credits from your Unique VIP Club",
    message: args.perk === "signup_ai_credits"
      ? "Welcome to the club! 50 free AI credits are in your wallet."
      : "Your monthly member top-up landed: 50 free AI credits added.",
  }).then(() => {}).catch(() => {});

  return { granted: true };
}

/**
 * Add €0.15 (or given amount) to the Good Fund ledger, idempotent per stripe event.
 */
export async function contributeToGoodFund(
  admin: Admin,
  args: {
    membershipId: string;
    amountEur: number;
    source: "signup" | "monthly";
    stripeEventId: string;
  },
) {
  // Idempotency: check if this stripe event already recorded
  const { data: existing } = await admin
    .from("club_good_fund_ledger")
    .select("id")
    .eq("stripe_event_id", args.stripeEventId)
    .maybeSingle();
  if (existing) return;

  await admin.from("club_good_fund_ledger").insert({
    membership_id: args.membershipId,
    amount_eur: args.amountEur,
    source: args.source,
    stripe_event_id: args.stripeEventId,
  });
}
