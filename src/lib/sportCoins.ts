import { supabase } from "@/integrations/supabase/client";

export type SportCoinsTable =
  | "basketball_coins"
  | "hockey_coins"
  | "tennis_coins"
  | "american_football_coins"
  | "football_coins";

export async function getSportCoinsBalance(table: SportCoinsTable): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { data } = await supabase.from(table).select("balance").eq("user_id", user.id).maybeSingle();
  return data?.balance ?? 0;
}

/**
 * Server-side atomic spend (and optional reward) of sport coins.
 * Returns { ok: true, balance } on success, { ok: false, error, balance? } on failure.
 */
export async function spendSportCoins(
  table: SportCoinsTable,
  amount: number,
  reward = 0
): Promise<{ ok: true; balance: number } | { ok: false; error: string; balance?: number }> {
  const { data, error } = await supabase.functions.invoke("spend-sport-coins", {
    body: { table, amount, reward },
  });
  if (error) {
    const msg = (data as any)?.error || error.message || "spend_failed";
    return { ok: false as const, error: msg, balance: (data as any)?.balance };
  }
  if ((data as any)?.success) {
    return { ok: true as const, balance: (data as any).balance };
  }
  return { ok: false as const, error: (data as any)?.error || "spend_failed", balance: (data as any)?.balance };
}
