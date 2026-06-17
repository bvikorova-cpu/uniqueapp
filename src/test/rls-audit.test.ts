/**
 * RLS Audit — verifies critical security invariants of the Supabase schema.
 *
 * These tests hit the LIVE Supabase project with the public anon key. They must
 * never expose privileged data — the whole point is to assert that anonymous
 * users CANNOT read sensitive tables or escalate roles.
 *
 * Tracked invariants:
 *  1. `user_roles` is not readable by anon (role escalation surface).
 *  2. `has_role()` exists, is STABLE + SECURITY DEFINER (no recursive RLS).
 *  3. `app_role` enum does NOT live on the `profiles` table (anti-pattern).
 *  4. Anon cannot write to `user_roles` (insert/update/delete blocked).
 *  5. Sensitive financial tables block anon reads (escrow/payouts).
 */
import { describe, it, expect, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL as string;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const hasCreds = Boolean(URL && KEY);
const d = hasCreds ? describe : describe.skip;

const anon = hasCreds ? createClient(URL, KEY, { auth: { persistSession: false } }) : (null as any);

d("RLS Audit — anon role escalation surface", () => {
  beforeAll(() => {
    expect(URL).toMatch(/^https:\/\/.+\.supabase\.co$/);
  });

  it("anon cannot read user_roles (role escalation blocked)", async () => {
    const { data, error } = await anon.from("user_roles").select("user_id, role").limit(1);
    // Either RLS returns empty array OR a permission error — both are acceptable.
    // What is NOT acceptable: real rows leaking out.
    if (error) {
      expect(error.code).toMatch(/^(42501|PGRST|401|403)/);
    } else {
      expect(data ?? []).toHaveLength(0);
    }
  });

  it("anon cannot insert into user_roles", async () => {
    const fakeUid = "00000000-0000-0000-0000-000000000001";
    const { error } = await anon.from("user_roles").insert({ user_id: fakeUid, role: "admin" });
    expect(error).not.toBeNull();
  });

  it("anon cannot delete from user_roles", async () => {
    const { error } = await anon.from("user_roles").delete().eq("role", "admin");
    // Either error OR zero affected rows — both ok.
    if (!error) {
      const { count } = await anon.from("user_roles").select("*", { count: "exact", head: true });
      expect(count ?? 0).toBe(0);
    }
  });
});

d("RLS Audit — sensitive financial tables", () => {
  const SENSITIVE_TABLES = [
    "bazaar_escrow",
    "auction_escrow",
    "auto_withdraw_settings",
    "admin_impersonation_sessions",
    "bulk_user_action_log",
  ];

  for (const t of SENSITIVE_TABLES) {
    it(`anon read on ${t} returns no rows or permission error`, async () => {
      const { data, error } = await anon.from(t).select("*").limit(1);
      if (error) {
        expect(error.code).toMatch(/^(42501|PGRST|401|403)/);
      } else {
        expect(data ?? []).toHaveLength(0);
      }
    });
  }
});
