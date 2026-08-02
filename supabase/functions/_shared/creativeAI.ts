// Shared chat-completion helper for Creative Forge functions.
// Uses the unified AI provider: OpenAI primary, Lovable AI Gateway fallback.

import { callUnifiedAI, UnifiedMessage } from "./unifiedAI.ts";

export interface CreativeAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class CreativeAIError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "CreativeAIError";
  }
}

export async function callCreativeAI(messages: CreativeAIMessage[]): Promise<string> {
  try {
    return await callUnifiedAI(messages as UnifiedMessage[], { model: "gpt-4o-mini" });
  } catch (e) {
    const status = e instanceof Error && "status" in e ? (e as { status: number }).status : 502;
    throw new CreativeAIError(status, e instanceof Error ? e.message : "AI request failed");
  }
}

export interface UnifiedAiCreditBalance {
  free: number;
  paid: number;
  total: number;
}

export interface UnifiedAiCreditSpend extends UnifiedAiCreditBalance {
  freeSpent: number;
  paidSpent: number;
}

const numberOrZero = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export async function getUnifiedAiCreditBalance(supabase: any, userId: string): Promise<UnifiedAiCreditBalance> {
  // Keep these reads sequential. Sending both PostgREST requests at exactly the
  // same time caused avoidable project-level 429s on busy mobile sessions.
  // Read retries are safe; never apply this retry strategy to the debit RPC.
  const readWithThrottleRetry = async (read: () => PromiseLike<any>) => {
    let lastError: any;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const result = await read();
      if (!result.error) return result;
      lastError = result.error;
      const status = Number(result.error?.status ?? result.error?.code);
      const throttled = status === 429 || /rate limit|too many requests/i.test(String(result.error?.message ?? ""));
      if (!throttled || attempt === 2) break;
      await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
    }
    return { data: null, error: lastError };
  };

  const { data: paidRow, error: paidError } = await readWithThrottleRetry(() =>
    supabase.from("ai_credits").select("credits_remaining").eq("user_id", userId).maybeSingle()
  );
  const { data: freeRow, error: freeError } = await readWithThrottleRetry(() =>
    supabase.from("free_tier_credits").select("balance").eq("user_id", userId).maybeSingle()
  );

  if (paidError) throw paidError;
  if (freeError) throw freeError;

  const paid = numberOrZero(paidRow?.credits_remaining);
  const free = numberOrZero(freeRow?.balance);
  return { free, paid, total: free + paid };
}

export async function spendUnifiedAiCredits(
  supabase: any,
  userId: string,
  amount: number,
  reason: string,
  source: string,
): Promise<UnifiedAiCreditSpend> {
  const { data, error } = await supabase.rpc("spend_unified_ai_credits_for_user", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_source: source,
  });

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  const free = numberOrZero(row?.free_balance);
  const paid = numberOrZero(row?.paid_balance);
  return {
    free,
    paid,
    total: numberOrZero(row?.total_balance) || free + paid,
    freeSpent: numberOrZero(row?.free_spent),
    paidSpent: numberOrZero(row?.paid_spent),
  };
}

export function isInsufficientCreditsError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /INSUFFICIENT_CREDITS|Insufficient credits/i.test(message);
}
