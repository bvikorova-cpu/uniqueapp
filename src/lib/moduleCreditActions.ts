import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Wrappers around the Phase 3 credit-charging edge functions.
 * Each action costs 2 AI credits and inserts an audit row.
 * Returns true on success, false on failure/insufficient credits
 * (a toast is shown automatically).
 */

type InvokeResult = { ok: true; credits_remaining: number } | { ok: false };

async function callFn(fn: string, body: Record<string, unknown>): Promise<InvokeResult> {
  try {
    const { data, error } = await supabase.functions.invoke(fn, { body });
    if (error) {
      const msg = (error as any)?.message || "";
      if (/402|insufficient|requiresPayment/i.test(msg) || (data as any)?.requiresPayment) {
        toast.error("Not enough credits", {
          description: "This action costs 2 credits. Top up to continue.",
          action: { label: "Top up", onClick: () => (window.location.href = "/ai-credits-store") },
        });
      } else {
        toast.error(msg || "Action failed");
      }
      return { ok: false };
    }
    if ((data as any)?.requiresPayment) {
      toast.error("Not enough credits", {
        description: "This action costs 2 credits. Top up to continue.",
        action: { label: "Top up", onClick: () => (window.location.href = "/ai-credits-store") },
      });
      return { ok: false };
    }
    return { ok: true, credits_remaining: (data as any)?.credits_remaining ?? 0 };
  } catch (e: any) {
    toast.error(e?.message || "Action failed");
    return { ok: false };
  }
}

export const chargeHorseAction = (
  action: "buy-horse" | "enter-race" | "train",
  extra: { horse_name?: string; metadata?: Record<string, unknown> } = {},
) => callFn("horse-racing-action", { action, ...extra });

export const chargeGPAction = (
  action: "start-race" | "boost" | "join-fantasy",
  extra: { metadata?: Record<string, unknown> } = {},
) => callFn("gp-racing-action", { action, ...extra });

export const chargeLotteryAction = (
  action: "generate" | "save-pick" | "analyze",
  extra: { lottery_type?: string; numbers?: number[]; metadata?: Record<string, unknown> } = {},
) => callFn("lottery-ai-action", { action, ...extra });

export const chargePhobiaAction = (
  action: "place-trade" | "write-journal",
  extra: {
    phobia_symbol?: string;
    direction?: "long" | "short";
    amount?: number;
    journal_entry?: string;
    metadata?: Record<string, unknown>;
  } = {},
) => callFn("phobia-trading-action", { action, ...extra });
