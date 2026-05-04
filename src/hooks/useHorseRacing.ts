import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useHorseCurrency = () => {
  const { data: currency, isLoading } = useQuery({
    queryKey: ["horse-currency"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("horse_currency")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      // Row is created server-side; show zero-balance placeholder until webhook fulfills
      return data ?? { user_id: user.id, coins: 0, gems: 0 };
    },
  });

  return { currency, isLoading };
};

export const usePurchaseCurrency = () => {
  return useMutation({
    mutationFn: async (packageType: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke(
        "create-horse-currency-checkout",
        {
          body: { packageType },
        }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
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
    },
  });

  const createHorse = useMutation({
    mutationFn: async ({ name, breed, color, costCoins }: { 
      name: string; 
      breed: string; 
      color: string;
      costCoins: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Deduct coins
      const { data: currency } = await supabase
        .from("horse_currency")
        .select("coins")
        .eq("user_id", user.id)
        .single();

      if (!currency || currency.coins < costCoins) {
        throw new Error("Insufficient coins");
      }

      // Create horse with random stats based on rarity
      const stats = {
        speed_stat: Math.floor(Math.random() * 30) + 40,
        stamina_stat: Math.floor(Math.random() * 30) + 40,
        acceleration_stat: Math.floor(Math.random() * 30) + 40,
        temperament_stat: Math.floor(Math.random() * 30) + 40,
      };

      const { data, error } = await supabase
        .from("horses")
        .insert({
          user_id: user.id,
          name,
          breed,
          color,
          ...stats,
        })
        .select()
        .single();

      if (error) throw error;

      // Update currency
      await supabase
        .from("horse_currency")
        .update({ coins: currency.coins - costCoins })
        .eq("user_id", user.id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-horses"] });
      queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
      toast.success("Horse acquired!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

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
      raceId: string; 
      horseId: string; 
      strategy: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get race entry fee
      const { data: race } = await supabase
        .from("races")
        .select("entry_fee_coins")
        .eq("id", raceId)
        .single();

      if (!race) throw new Error("Race not found");

      // Check coins
      const { data: currency } = await supabase
        .from("horse_currency")
        .select("coins")
        .eq("user_id", user.id)
        .single();

      if (!currency || currency.coins < race.entry_fee_coins) {
        throw new Error("Insufficient coins");
      }

      // Join race
      const { data, error } = await supabase
        .from("race_participants")
        .insert({
          race_id: raceId,
          horse_id: horseId,
          user_id: user.id,
          strategy,
        })
        .select()
        .single();

      if (error) throw error;

      // Deduct entry fee
      await supabase
        .from("horse_currency")
        .update({ coins: currency.coins - race.entry_fee_coins })
        .eq("user_id", user.id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-races"] });
      queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
      toast.success("Joined race!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Training Hook
export const useTrainHorse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ horseId, statType }: { horseId: string; statType: 'speed' | 'stamina' | 'acceleration' | 'temperament' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const TRAINING_COST = 20;
      const STAT_INCREASE = 5;

      // Check coins
      const { data: currency } = await supabase
        .from("horse_currency")
        .select("coins")
        .eq("user_id", user.id)
        .single();

      if (!currency || currency.coins < TRAINING_COST) {
        throw new Error("Insufficient coins for training");
      }

      // Get current horse stats
      const { data: horse } = await supabase
        .from("horses")
        .select("*")
        .eq("id", horseId)
        .single();

      if (!horse) throw new Error("Horse not found");

      // Update stat
      const statField = `${statType}_stat`;
      const newStatValue = Math.min((horse[statField] || 0) + STAT_INCREASE, 100);
      const newXP = (horse.experience || 0) + 10;
      const newLevel = Math.floor(newXP / 100) + 1;

      await supabase
        .from("horses")
        .update({
          [statField]: newStatValue,
          experience: newXP,
          level: newLevel,
        } as any)
        .eq("id", horseId);

      // Deduct coins
      await supabase
        .from("horse_currency")
        .update({ coins: currency.coins - TRAINING_COST })
        .eq("user_id", user.id);

      return { statType, newValue: newStatValue };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-horses"] });
      queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
      toast.success(`${data.statType} increased to ${data.newValue}!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Breeding Hook
export const useBreedHorses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ parent1Id, parent2Id }: { parent1Id: string; parent2Id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const BREEDING_COST = 100;

      // Check coins
      const { data: currency } = await supabase
        .from("horse_currency")
        .select("coins")
        .eq("user_id", user.id)
        .single();

      if (!currency || currency.coins < BREEDING_COST) {
        throw new Error("Insufficient coins for breeding");
      }

      // Get parent horses
      const { data: parents } = await supabase
        .from("horses")
        .select("*")
        .in("id", [parent1Id, parent2Id]);

      if (!parents || parents.length !== 2) {
        throw new Error("Parent horses not found");
      }

      const [parent1, parent2] = parents;

      // Calculate offspring stats (average with small random variation)
      const calculateOffspringStat = (stat1: number, stat2: number) => {
        const average = (stat1 + stat2) / 2;
        const variation = Math.floor(Math.random() * 10) - 5;
        return Math.max(30, Math.min(100, Math.floor(average + variation)));
      };

      const offspringStats = {
        speed_stat: calculateOffspringStat(parent1.speed_stat, parent2.speed_stat),
        stamina_stat: calculateOffspringStat(parent1.stamina_stat, parent2.stamina_stat),
        acceleration_stat: calculateOffspringStat(parent1.acceleration_stat, parent2.acceleration_stat),
        temperament_stat: calculateOffspringStat(parent1.temperament_stat, parent2.temperament_stat),
      };

      // Create offspring
      const { data: offspring, error } = await supabase
        .from("horses")
        .insert({
          user_id: user.id,
          name: `${parent1.name} Jr.`,
          breed: parent1.breed,
          color: Math.random() > 0.5 ? parent1.color : parent2.color,
          ...offspringStats,
        })
        .select()
        .single();

      if (error) throw error;

      // Record breeding
      await supabase
        .from("breeding_records")
        .insert({
          user_id: user.id,
          parent1_id: parent1Id,
          parent2_id: parent2Id,
          offspring_id: offspring.id,
          cost_coins: BREEDING_COST,
          status: 'completed',
        });

      // Deduct coins
      await supabase
        .from("horse_currency")
        .update({ coins: currency.coins - BREEDING_COST })
        .eq("user_id", user.id);

      return offspring;
    },
    onSuccess: (offspring) => {
      queryClient.invalidateQueries({ queryKey: ["user-horses"] });
      queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
      toast.success(`New foal ${offspring.name} born!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Shop - Change Horse Color
export const usePurchaseHorseColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ horseId, newColor }: { horseId: string; newColor: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const COLOR_COST = 50; // Gems

      // Check gems
      const { data: currency } = await supabase
        .from("horse_currency")
        .select("gems")
        .eq("user_id", user.id)
        .single();

      if (!currency || currency.gems < COLOR_COST) {
        throw new Error("Insufficient gems");
      }

      // Update horse color
      await supabase
        .from("horses")
        .update({ color: newColor })
        .eq("id", horseId);

      // Deduct gems
      await supabase
        .from("horse_currency")
        .update({ gems: currency.gems - COLOR_COST })
        .eq("user_id", user.id);

      return { horseId, newColor };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-horses"] });
      queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
      toast.success("Horse color changed!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Shop - Purchase Item
export const usePurchaseShopItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      itemId, 
      horseId, 
      costCoins, 
      costGems,
      statBoost 
    }: { 
      itemId: string; 
      horseId?: string;
      costCoins?: number;
      costGems?: number;
      statBoost?: {
        speed?: number;
        stamina?: number;
        acceleration?: number;
        temperament?: number;
      };
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check currency
      const { data: currency } = await supabase
        .from("horse_currency")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!currency) throw new Error("Currency not found");

      if (costCoins && currency.coins < costCoins) {
        throw new Error("Insufficient coins");
      }

      if (costGems && currency.gems < costGems) {
        throw new Error("Insufficient gems");
      }

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

      // Deduct currency
      const currencyUpdate: Record<string, number> = {};
      if (costCoins) currencyUpdate.coins = currency.coins - costCoins;
      if (costGems) currencyUpdate.gems = currency.gems - costGems;

      await supabase
        .from("horse_currency")
        .update(currencyUpdate as any)
        .eq("user_id", user.id);

      // Record purchase
      await supabase
        .from("horse_shop_purchases")
        .insert({
          user_id: user.id,
          item_id: itemId,
          horse_id: horseId || null,
          cost_coins: costCoins || 0,
          cost_gems: costGems || 0,
        });

      return { itemId, horseId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-horses"] });
      queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
      toast.success("Item purchased successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
