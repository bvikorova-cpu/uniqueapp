/**
 * Group 7 regression: Withdrawals / Payouts / process-sale / mt-* / notify-admin.
 * Verifies real edge functions exist on disk (no proxy layer for these).
 */
import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const FN_ROOT = resolve(__dirname, "../../supabase/functions");

const GROUPS: Record<string, string[]> = {
  withdrawals: [
    "admin-payout-withdrawal",
    "auto-payout-pending-withdrawals",
    "process-referral-withdrawal",
    "request-influencer-withdrawal",
  ],
  payouts: [
    "admin-approve-campaign-payout",
    "process-scheduled-payouts",
    "request-battle-royale-payout",
    "request-campaign-payout",
    "stripe-connect-payout",
  ],
  "mt-*": ["mt-router"],
  "notify-admin": ["notify-admin-referral-withdrawal"],
};

describe("Group 7 edge functions present", () => {
  for (const [group, fns] of Object.entries(GROUPS)) {
    describe(group, () => {
      it.each(fns)("%s/index.ts exists", (name) => {
        expect(existsSync(resolve(FN_ROOT, name, "index.ts")), `${name} missing`).toBe(true);
      });
    });
  }
});
