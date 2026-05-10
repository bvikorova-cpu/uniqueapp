import { supabase } from "@/integrations/supabase/client";

/**
 * Single source of truth for analyzer credit checks + deductions.
 * - Reads current balance server-side (avoids stale client cache).
 * - Throws if balance < cost.
 * - Caller must invoke `commit()` exactly once after the work succeeds.
 *   `commit()` is idempotent — repeated calls are no-ops, so views can
 *   safely call it from a `finally`/success branch without double-charging.
 */
export async function reserveAnalyzerCredits(cost: number): Promise<{
  remaining: number;
  commit: () => Promise<void>;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: row, error } = await supabase
    .from("analyzer_credits")
    .select("credits_remaining")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;

  const balance = row?.credits_remaining ?? 0;
  if (balance < cost) throw new Error(`Insufficient credits. You need ${cost}.`);

  let committed = false;
  return {
    remaining: balance,
    commit: async () => {
      if (committed) return;
      committed = true;
      const next = Math.max(0, balance - cost);
      const { error: upErr } = await supabase
        .from("analyzer_credits")
        .update({ credits_remaining: next })
        .eq("user_id", user.id);
      if (upErr) {
        committed = false;
        throw upErr;
      }
    },
  };
}
