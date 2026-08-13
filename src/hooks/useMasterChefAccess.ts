import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/** Credit cost of every KitchenStars Chef Pass (unified ai_credits pool). */
export const CHEF_PASS_OPTIONS = {
  day: { label: "Day Pass", credits: 5, hours: 24, desc: "Full chef access for 24 hours" },
  week: { label: "Week Pass", credits: 25, hours: 24 * 7, desc: "7 days of chef access" },
  month: { label: "Month Pass", credits: 80, hours: 24 * 30, desc: "30 days of chef access" },
} as const;

export type ChefPassType = keyof typeof CHEF_PASS_OPTIONS;

/** Per-action credit costs inside KitchenStars. */
export const KITCHENSTARS_COSTS = {
  competition_entry: 3,
  battle_entry: 3,
  ai_recipe: 3,
  ai_coach: 3,
  ingredient_scan: 3,
  nutrition_analysis: 3,
  chef_chat: 3,
} as const;

export type KitchenStarsAction = keyof typeof KITCHENSTARS_COSTS;

/**
 * Unified credits + Chef Pass access for the KitchenStars module.
 * There are no subscriptions — access and every paid action run on ai_credits.
 */
export function useMasterChefAccess() {
  const [balance, setBalance] = useState(0);
  const [hasPass, setHasPass] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [passType, setPassType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setBalance(0);
        setHasPass(false);
        setExpiresAt(null);
        return;
      }

      const [{ data: credits }, { data: pass }] = await Promise.all([
        supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("masterchef_chef_passes")
          .select("pass_type, expires_at")
          .eq("user_id", user.id)
          .gt("expires_at", new Date().toISOString())
          .order("expires_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      setBalance(credits?.credits_remaining ?? 0);
      setHasPass(!!pass);
      setExpiresAt(pass?.expires_at ?? null);
      setPassType(pass?.pass_type ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const spendCredits = useCallback(
    async (amount: number, description: string): Promise<boolean> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Sign in required", { description: "Please log in to continue." });
        return false;
      }
      if (balance < amount) {
        toast.error("Not enough credits", {
          description: `This costs ${amount} credits — you have ${balance}.`,
          action: { label: "Top up", onClick: () => { window.location.href = "/ai-credits"; } },
        });
        return false;
      }
      const { data, error } = await supabase.rpc("deduct_ai_credits_atomic", {
        _user_id: user.id,
        _amount: amount,
      });
      if (error) {
        console.error("KitchenStars credit deduction failed", error);
        toast.error("Not enough credits", {
          description: `This costs ${amount} credits. Top up to continue.`,
          action: { label: "Top up", onClick: () => { window.location.href = "/ai-credits"; } },
        });
        return false;
      }
      if (typeof data === "number") setBalance(data);
      else await refresh();
      await supabase.from("ai_usage_history").insert({
        user_id: user.id,
        usage_type: "custom_generation",
        credits_used: amount,
        description,
      });
      window.dispatchEvent(new Event("ai-credits-updated"));
      return true;
    },
    [balance, refresh],
  );

  /** Spend credits for a KitchenStars action. */
  const spendAction = useCallback(
    (action: KitchenStarsAction) =>
      spendCredits(KITCHENSTARS_COSTS[action], `kitchenstars:${action}`),
    [spendCredits],
  );

  /** Buy a Chef Pass with credits and activate it immediately. */
  const activatePass = useCallback(
    async (type: ChefPassType): Promise<boolean> => {
      const option = CHEF_PASS_OPTIONS[type];
      const ok = await spendCredits(option.credits, `kitchenstars:chef_pass_${type}`);
      if (!ok) return false;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const base = expiresAt && new Date(expiresAt) > new Date() ? new Date(expiresAt) : new Date();
      const expires = new Date(base.getTime() + option.hours * 3600 * 1000);

      const { error } = await supabase.from("masterchef_chef_passes").insert({
        user_id: user.id,
        pass_type: type,
        credits_paid: option.credits,
        expires_at: expires.toISOString(),
      });
      if (error) {
        console.error("Chef pass activation failed", error);
        toast.error("Could not activate the Chef Pass. Your credits will be reviewed.");
        return false;
      }
      toast.success(`${option.label} active!`, {
        description: `Chef access until ${expires.toLocaleString()}`,
      });
      await refresh();
      return true;
    },
    [expiresAt, refresh, spendCredits],
  );

  return { balance, hasPass, expiresAt, passType, loading, refresh, spendCredits, spendAction, activatePass };
}
