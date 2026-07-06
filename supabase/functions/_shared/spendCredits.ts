// Shared helper: deduct AI credits with audit trail (per ai-credits-policy).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export interface SpendResult {
  ok: boolean;
  remaining: number;
  error?: string;
}

export async function spendAiCredits(
  admin: ReturnType<typeof createClient>,
  userId: string,
  amount: number,
  reason: string,
  source: string,
): Promise<SpendResult> {
  const { data: row, error: readErr } = await admin
    .from("ai_credits")
    .select("credits_remaining")
    .eq("user_id", userId)
    .maybeSingle();
  if (readErr) return { ok: false, remaining: 0, error: readErr.message };

  const remaining = row?.credits_remaining ?? 0;
  if (remaining < amount) return { ok: false, remaining, error: "Insufficient credits" };

  // Tag the update so the ledger trigger records reason/source
  await admin.rpc("set_config", { setting_name: "app.credit_reason", new_value: reason, is_local: true } as any).catch(() => {});
  await admin.rpc("set_config", { setting_name: "app.credit_source", new_value: source, is_local: true } as any).catch(() => {});

  const { error: updErr } = await admin
    .from("ai_credits")
    .update({
      credits_remaining: remaining - amount,
      last_used_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  if (updErr) return { ok: false, remaining, error: updErr.message };

  await admin.from("ai_usage_history").insert({
    user_id: userId,
    usage_type: "custom_generation",
    credits_used: amount,
    description: reason,
  }).catch(() => {});

  return { ok: true, remaining: remaining - amount };
}
