import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Horse Racing runs 100% on the unified `ai_credits` pool.
 * There are no coins and no gems in this module.
 */
export const HORSE_CREDIT_COSTS = {
  buyHorse: 10,
  training: 2,
  breeding: 8,
  raceEntry: 1,
  colorChange: 3,
  championship: 5,
} as const;

/** Spend credits atomically and write the ledger/usage rows. */
export async function spendHorseCredits(amount: number, reason: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to continue");

  const { data: row } = await supabase
    .from("ai_credits")
    .select("credits_remaining")
    .eq("user_id", user.id)
    .maybeSingle();
  const have = row?.credits_remaining ?? 0;
  if (have < amount) {
    throw new Error(`Not enough credits — this costs ${amount}, you have ${have}.`);
  }

  const { error } = await supabase.rpc("deduct_ai_credits_atomic", {
    _user_id: user.id,
    _amount: amount,
  });
  if (error) throw new Error(`Not enough credits — this costs ${amount} credits.`);

  await supabase.from("ai_usage_history").insert({
    user_id: user.id,
    usage_type: "custom_generation",
    credits_used: amount,
    description: reason,
  });
  window.dispatchEvent(new Event("ai-credits-updated"));
}

/** Live unified credit balance for the Horse Racing arena. */
export const useHorseCurrency = () => {
  const queryClient = useQueryClient();

  const { data: currency, isLoading } = useQuery({
    queryKey: ["horse-currency"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { credits: 0 };

      const { data, error } = await supabase
        .from("ai_credits")
        .select("credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return { credits: data?.credits_remaining ?? 0 };
    } });

  // Realtime: keep the balance fresh across purchases and top-ups.
  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      channel = supabase
        .channel(`horse-credits-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "ai_credits",
            filter: `user_id=eq.${user.id}` },
          () => {
            queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
          }
        )
        .subscribe();
    })();

    const onUpdated = () => queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
    window.addEventListener("ai-credits-updated", onUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener("ai-credits-updated", onUpdated);
      if (channel) supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { currency, isLoading };
};

export const useUserHorses = () => {
  const queryClient = useQueryClient();

  const { data: horses, isLoading } = useQuery({
    queryKey: ["user-horses"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("horses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } });

  const createHorse = useMutation({
    mutationFn: async ({ name, breed, color }: {
      name: string; breed: string; color: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("horse-router", {
        body: { action: "create", name, breed, color } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.horse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-horses"] });
      queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
      window.dispatchEvent(new Event("ai-credits-updated"));
      toast.success(`Horse acquired! −${HORSE_CREDIT_COSTS.buyHorse} credits`);
    },
    onError: (error: Error) => toast.error(error.message) });

  return { horses, isLoading, createHorse };
};


export const useRaces = () => {
  const { data: races, isLoading } = useQuery({
    queryKey: ["active-races"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("races")
        .select(`
          *,
          race_participants(
            id,
            horse_id,
            user_id,
            strategy,
            position,
            horses(name, breed, speed_stat, stamina_stat)
          )
        `)
        .in("status", ["waiting", "starting", "running"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });

  return { races, isLoading };
};

export const useJoinRace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ raceId, horseId, strategy }: {
      raceId: string; horseId: string; strategy: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("horse-router", {
        body: { action: "join_race", raceId, horseId, strategy } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.participant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-races"] });
      queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
      toast.success("Joined race!");
    },
    onError: (error: Error) => toast.error(error.message) });
};

// Training Hook
export const useTrainHorse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ horseId, statType }: {
      horseId: string;
      statType: 'speed' | 'stamina' | 'acceleration' | 'temperament';
    }) => {
      const { data, error } = await supabase.functions.invoke("horse-router", {
        body: { action: "train", horseId, statType } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return { statType: data.statType, newValue: data.newValue };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-horses"] });
      queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
      toast.success(`${data.statType} increased to ${data.newValue}!`);
    },
    onError: (error: Error) => toast.error(error.message) });
};

// Breeding Hook — server-side (RLS-safe) via horse-router, returns foal art + profile.
export const useBreedHorses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ parent1Id, parent2Id }: { parent1Id: string; parent2Id: string }) => {
      const { data, error } = await supabase.functions.invoke("horse-router", {
        body: { action: "breed", parent1Id, parent2Id } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.foal as {
        id: string; name: string; breed: string; color: string;
        speed_stat: number; stamina_stat: number; acceleration_stat: number; temperament_stat: number;
        image_url: string | null; description: string | null;
      };
    },
    onSuccess: (foal) => {
      queryClient.invalidateQueries({ queryKey: ["user-horses"] });
      queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
      window.dispatchEvent(new Event("ai-credits-updated"));
      toast.success(`New foal ${foal.name} born! \u2212${HORSE_CREDIT_COSTS.breeding} credits`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    } });
};


// Shop - Change Horse Color (credits)
export const usePurchaseHorseColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ horseId, newColor }: { horseId: string; newColor: string }) => {
      await spendHorseCredits(HORSE_CREDIT_COSTS.colorChange, "horse-racing:color-change");

      await supabase
        .from("horses")
        .update({ color: newColor })
        .eq("id", horseId);

      return { horseId, newColor };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-horses"] });
      queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
      toast.success("Horse color changed!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    } });
};

// Shop - Purchase Item (credits only)
export const usePurchaseShopItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      horseId,
      costCredits,
      statBoost
    }: {
      itemId: string;
      horseId?: string;
      costCredits: number;
      statBoost?: {
        speed?: number;
        stamina?: number;
        acceleration?: number;
        temperament?: number;
      };
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await spendHorseCredits(costCredits, `horse-racing:shop:${itemId}`);

      // Apply stat boost if applicable
      if (statBoost && horseId) {
        const { data: horse } = await supabase
          .from("horses")
          .select("*")
          .eq("id", horseId)
          .single();

        if (!horse) throw new Error("Horse not found");

        const updates: Record<string, number> = {};
        if (statBoost.speed) updates.speed_stat = Math.min(100, (horse.speed_stat || 0) + statBoost.speed);
        if (statBoost.stamina) updates.stamina_stat = Math.min(100, (horse.stamina_stat || 0) + statBoost.stamina);
        if (statBoost.acceleration) updates.acceleration_stat = Math.min(100, (horse.acceleration_stat || 0) + statBoost.acceleration);
        if (statBoost.temperament) updates.temperament_stat = Math.min(100, (horse.temperament_stat || 0) + statBoost.temperament);

        if (Object.keys(updates).length > 0) {
          await supabase
            .from("horses")
            .update(updates as any)
            .eq("id", horseId);
        }
      }

      await supabase
        .from("horse_shop_purchases")
        .insert({ user_id: user.id,
          item_id: itemId,
          horse_id: horseId || null,
          cost_coins: costCredits,
          cost_gems: 0 });

      return { itemId, horseId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-horses"] });
      queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
      toast.success("Item purchased successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    } });
};
