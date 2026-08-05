import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Credit costs for the Messenger Hub tools (unified `ai_credits` pool).
 * Every tool is credit-based (3-5 credits) — no subscriptions.
 * Access is unlocked for the rest of the day, so a page refresh never charges twice.
 */
export const MESSENGER_TOOL_COSTS = {
  analytics: 3,
  themes: 4,
  mood: 3,
  emoji: 3,
  games: 4,
} as const;

export type MessengerTool = keyof typeof MESSENGER_TOOL_COSTS;

const dayKey = (tool: MessengerTool, userId: string) =>
  `messenger-tool:${tool}:${userId}:${new Date().toISOString().slice(0, 10)}`;

export function isMessengerToolUnlocked(tool: MessengerTool, userId: string): boolean {
  try {
    return localStorage.getItem(dayKey(tool, userId)) === "1";
  } catch {
    return false;
  }
}

export function useMessengerToolCredits(userId: string) {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      if (!userId) { setBalance(0); return; }
      const { data } = await supabase
        .from("ai_credits")
        .select("credits_remaining")
        .eq("user_id", userId)
        .maybeSingle();
      setBalance(data?.credits_remaining ?? 0);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  /** Unlocks a hub tool for today. Returns true when access is granted. */
  const unlock = useCallback(async (tool: MessengerTool): Promise<boolean> => {
    if (!userId) {
      toast.error("Sign in required", { description: "Please log in to continue." });
      return false;
    }
    if (isMessengerToolUnlocked(tool, userId)) return true;

    const amount = MESSENGER_TOOL_COSTS[tool];
    const { data, error } = await supabase.rpc("deduct_ai_credits_atomic", {
      _user_id: userId,
      _amount: amount,
    });
    if (error) {
      toast.error("Not enough credits", {
        description: `This tool costs ${amount} credits for today. Top up to continue.`,
        action: { label: "Top up", onClick: () => { window.location.href = "/ai-credits"; } },
      });
      return false;
    }
    if (typeof data === "number") setBalance(data);
    else await refresh();

    await supabase.from("ai_usage_history").insert({
      user_id: userId,
      usage_type: "custom_generation",
      credits_used: amount,
      description: `messenger_tool:${tool}`,
    });
    try { localStorage.setItem(dayKey(tool, userId), "1"); } catch { /* ignore */ }
    window.dispatchEvent(new Event("ai-credits-updated"));
    toast.success(`Unlocked for today — ${amount} credits used`);
    return true;
  }, [userId, refresh]);

  return { balance, loading, refresh, unlock };
}
