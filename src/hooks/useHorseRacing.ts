import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useHorseCurrency = () => {
  const queryClient = useQueryClient();

  const { data: currency, isLoading } = useQuery({
    queryKey: ["horse-currency"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_currencies")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from("user_currencies")
          .insert({
            user_id: user.id,
            gems: 0,
            coins: 100,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newData;
      }

      return data;
    },
  });

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
        .from("user_currencies")
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
        .from("user_currencies")
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
    refetchInterval: 5000, // Poll every 5 seconds
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
        .from("user_currencies")
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
        .from("user_currencies")
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
