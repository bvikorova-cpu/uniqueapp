import { supabase } from "@/integrations/supabase/client";

/**
 * Deducts AI credits before an AI dating tool runs.
 * Throws if the user is not logged in or has insufficient credits.
 */
export async function spendDatingCredits(amount: number, reason: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Login required");

  const { data: ok, error } = await supabase.rpc("deduct_ai_credits", {
    p_user_id: user.id,
    p_amount: amount,
    p_reason: reason,
    p_source: "dating",
  });
  if (error) throw new Error(error.message || "Credit deduction failed");
  if (ok === false) throw new Error(`Not enough credits. This tool costs ${amount} credits.`);
}
