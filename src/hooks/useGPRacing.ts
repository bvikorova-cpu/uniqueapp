import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useGPCurrency = () => {
  const queryClient = useQueryClient();

  const { data: currency, isLoading } = useQuery({
    queryKey: ["f1-currency"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null; // Return null instead of throwing for unauthenticated users

      const { data, error } = await supabase
        .from("f1_currency")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Give starter balance
        const { error: starterError } = await supabase.rpc(
          "give_f1_starter_balance",
          { p_user_id: user.id }
        );

        if (starterError) {
          console.error("Error giving F1 starter balance:", starterError);
          throw starterError;
        }

        const { data: newData, error: fetchError } = await supabase
          .from("f1_currency")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (fetchError) throw fetchError;
        return newData;
      }

      return data;
    },
  });

  return { currency, isLoading };
};

export const useUserCars = () => {
  const queryClient = useQueryClient();

  const { data: cars, isLoading } = useQuery({
    queryKey: ["user-f1-cars"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("f1_cars")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createCar = useMutation({
    mutationFn: async ({ name, team, color, costCoins }: { 
      name: string; 
      team: string; 
      color: string;
      costCoins: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check coins
      const { data: currency } = await supabase
        .from("f1_currency")
        .select("coins")
        .eq("user_id", user.id)
        .single();

      if (!currency || currency.coins < costCoins) {
        throw new Error("Insufficient coins");
      }

      // Random stats
      const stats = {
        engine_stat: Math.floor(Math.random() * 30) + 40,
        aero_stat: Math.floor(Math.random() * 30) + 40,
        tires_stat: Math.floor(Math.random() * 30) + 40,
        handling_stat: Math.floor(Math.random() * 30) + 40,
      };

      const { data, error } = await supabase
        .from("f1_cars")
        .insert({
          user_id: user.id,
          name,
          team,
          color,
          ...stats,
        })
        .select()
        .single();

      if (error) throw error;

      // Deduct coins
      await supabase
        .from("f1_currency")
        .update({ coins: currency.coins - costCoins })
        .eq("user_id", user.id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-f1-cars"] });
      queryClient.invalidateQueries({ queryKey: ["f1-currency"] });
      toast.success("New racing car acquired! 🏎️");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return { cars, isLoading, createCar };
};

export const useGPRaces = () => {
  const { data: races, isLoading } = useQuery({
    queryKey: ["active-f1-races"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("f1_races")
        .select(`
          *,
          f1_race_participants(
            id,
            car_id,
            user_id,
            strategy,
            position,
            f1_cars(name, team, engine_stat, aero_stat, color)
          )
        `)
        .in("status", ["open", "waiting", "starting", "running"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 5000,
  });

  return { races, isLoading };
};

export const useJoinGPRace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ raceId, carId, strategy }: { 
      raceId: string; 
      carId: string; 
      strategy: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get race entry fee
      const { data: race } = await supabase
        .from("f1_races")
        .select("entry_fee_coins")
        .eq("id", raceId)
        .single();

      if (!race) throw new Error("Race not found");

      // Check coins
      const { data: currency } = await supabase
        .from("f1_currency")
        .select("coins")
        .eq("user_id", user.id)
        .single();

      if (!currency || currency.coins < race.entry_fee_coins) {
        throw new Error("Insufficient coins");
      }

      // Join race
      const { data, error } = await supabase
        .from("f1_race_participants")
        .insert({
          race_id: raceId,
          car_id: carId,
          user_id: user.id,
          strategy,
        })
        .select()
        .single();

      if (error) throw error;

      // Deduct entry fee
      await supabase
        .from("f1_currency")
        .update({ coins: currency.coins - race.entry_fee_coins })
        .eq("user_id", user.id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-f1-races"] });
      queryClient.invalidateQueries({ queryKey: ["f1-currency"] });
      toast.success("Joined the race! 🏁");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpgradeCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ carId, statType }: { carId: string; statType: 'engine' | 'aero' | 'tires' | 'handling' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const UPGRADE_COST = 25;
      const STAT_INCREASE = 5;

      // Check coins
      const { data: currency } = await supabase
        .from("f1_currency")
        .select("coins")
        .eq("user_id", user.id)
        .single();

      if (!currency || currency.coins < UPGRADE_COST) {
        throw new Error("Insufficient coins for upgrade");
      }

      // Get current car stats
      const { data: car } = await supabase
        .from("f1_cars")
        .select("*")
        .eq("id", carId)
        .single();

      if (!car) throw new Error("Car not found");

      // Update stat
      const statField = `${statType}_stat`;
      const currentValue = car[statField as keyof typeof car] as number;
      const newStatValue = Math.min(currentValue + STAT_INCREASE, 100);
      const newXP = (car.experience || 0) + 10;
      const newLevel = Math.floor(newXP / 100) + 1;

      await supabase
        .from("f1_cars")
        .update({
          [statField]: newStatValue,
          experience: newXP,
          level: newLevel,
        } as any)
        .eq("id", carId);

      // Deduct coins
      await supabase
        .from("f1_currency")
        .update({ coins: currency.coins - UPGRADE_COST })
        .eq("user_id", user.id);

      return { statType, newValue: newStatValue };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-f1-cars"] });
      queryClient.invalidateQueries({ queryKey: ["f1-currency"] });
      toast.success(`${data.statType} upgraded to ${data.newValue}! 🔧`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const usePurchaseCarColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ carId, newColor }: { carId: string; newColor: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const COLOR_COST = 50; // Gems

      // Check gems
      const { data: currency } = await supabase
        .from("f1_currency")
        .select("gems")
        .eq("user_id", user.id)
        .single();

      if (!currency || currency.gems < COLOR_COST) {
        throw new Error("Insufficient gems");
      }

      // Update car color
      await supabase
        .from("f1_cars")
        .update({ color: newColor })
        .eq("id", carId);

      // Deduct gems
      await supabase
        .from("f1_currency")
        .update({ gems: currency.gems - COLOR_COST })
        .eq("user_id", user.id);

      return { carId, newColor };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-f1-cars"] });
      queryClient.invalidateQueries({ queryKey: ["f1-currency"] });
      toast.success("Car livery changed! 🎨");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
