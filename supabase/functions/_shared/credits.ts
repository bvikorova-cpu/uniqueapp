// Shared credit deduction helper for nutrition/AI hub edge functions.
// Uses the service-role client to atomically check & deduct credits from public.ai_credits.
// Returns a Response (402) on insufficient credits — caller should early-return it.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { jsonResponse } from "./openai.ts";

export async function deductAICredits(userId: string, cost: number, action: string): Promise<Response | null> {
  if (!cost || cost <= 0) return null;
  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const { data: row, error: selErr } = await admin
    .from("ai_credits")
    .select("credits_remaining")
    .eq("user_id", userId)
    .maybeSingle();

  if (selErr) {
    console.error("[credits] select error", selErr);
    return jsonResponse({ error: "Credit check failed" }, 500);
  }

  const remaining = row?.credits_remaining ?? 0;
  if (remaining < cost) {
    return jsonResponse(
      { error: "Insufficient credits", code: "INSUFFICIENT_CREDITS", required: cost, remaining, action },
      402
    );
  }

  const { error: updErr } = await admin
    .from("ai_credits")
    .update({ credits_remaining: remaining - cost, last_used_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("credits_remaining", remaining); // optimistic lock — prevents double deduction

  if (updErr) {
    console.error("[credits] update error", updErr);
    return jsonResponse({ error: "Credit deduction failed" }, 500);
  }

  return null;
}
