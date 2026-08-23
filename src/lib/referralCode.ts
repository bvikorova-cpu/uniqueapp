import { supabase } from "@/integrations/supabase/client";

export interface ApplyReferralResult {
  ok: boolean;
  alreadyClaimed?: boolean;
  error?: string;
}

/**
 * Attributes an (optional) referral code to the current user before checkout.
 * Once attributed, the stripe-webhook credits the code owner €5 on every paid
 * subscription invoice of this user.
 */
export async function applyReferralCode(rawCode: string): Promise<ApplyReferralResult> {
  const code = rawCode.trim();
  if (!code) return { ok: true };
  try {
    const { data, error } = await supabase.functions.invoke("claim-referral", {
      body: { code },
    });
    if (error) return { ok: false, error: error.message ?? "Referral code could not be applied" };
    const res = data as any;
    if (res?.error) return { ok: false, error: res.error };
    return { ok: true, alreadyClaimed: !!res?.alreadyClaimed };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Referral code could not be applied" };
  }
}
