import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * GP Racing Arena — 100% AI-credit based (paid-only model).
 * Every paid action goes through the `gp-racing-action` edge function which
 * deducts from the unified `ai_credits` pool and writes a ledger/audit row.
 */

export const GP_CREDIT_COSTS = {
  buyCar: 5,
  joinRace: 2,
  upgrade: 2,
  livery: 1,
  shopPurchase: 3,
  raceStart: 1 } as const;

export type GPAction = "buy-car" | "join-race" | "shop-purchase" | "upgrade" | "livery" | "bet" | "race-start";

export async function chargeGPCredits(
  action: GPAction,
  extra: { item_name?: string; amount?: number; metadata?: Record<string, unknown> } = {},
): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke("gp-racing-action", {
    body: { action, ...extra } });

  if (error || (data as any)?.requiresPayment) {
    const msg = (error as any)?.message || "";
    if (/402|insufficient|requiresPayment/i.test(msg) || (data as any)?.requiresPayment) {
      toast.error("Not enough credits", {
        description: "Top up your AI credits to continue racing.",
        action: { label: "Top up", onClick: () => (window.location.href = "/ai-credits-store") } });
    } else {
      toast.error(msg || "Action failed");
    }
    return false;
  }
  window.dispatchEvent(new Event("ai-credits-updated"));
  return true;
}

/** Unified AI credit balance used across the whole GP Racing Arena. */
export const useGPCredits = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["gp-ai-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: row, error } = await supabase
        .from("ai_credits")
        .select("credits_remaining, total_credits_purchased")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return { credits_remaining: row?.credits_remaining ?? 0,
        total_credits_purchased: row?.total_credits_purchased ?? 0 };
    } });

  return { credits: data, isLoading, refetch };
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
    } });

  const createCar = useMutation({
    mutationFn: async ({ name, team, color }: {
      name: string;
      team: string;
      color: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const charged = await chargeGPCredits("buy-car", { item_name: name, metadata: { team, color } });
      if (!charged) throw new Error("__handled__");

      const stats = { engine_stat: Math.floor(Math.random() * 30) + 40,
        aero_stat: Math.floor(Math.random() * 30) + 40,
        tires_stat: Math.floor(Math.random() * 30) + 40,
        handling_stat: Math.floor(Math.random() * 30) + 40 };

      const { data, error } = await supabase
        .from("f1_cars")
        .insert({ user_id: user.id, name, team, color, ...stats })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-f1-cars"] });
      queryClient.invalidateQueries({ queryKey: ["gp-ai-credits"] });
      toast.success(`New racing car acquired! (−${GP_CREDIT_COSTS.buyCar} credits) 🏎️`);
    },
    onError: (error: Error) => {
      if (error.message !== "__handled__") toast.error(error.message);
    } });

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
    refetchInterval: 5000 });

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

      const charged = await chargeGPCredits("join-race", { metadata: { raceId, carId, strategy } });
      if (!charged) throw new Error("__handled__");

      const { data, error } = await supabase
        .from("f1_race_participants")
        .insert({ race_id: raceId,
          car_id: carId,
          user_id: user.id,
          strategy })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-f1-races"] });
      queryClient.invalidateQueries({ queryKey: ["gp-ai-credits"] });
      toast.success(`Joined the race! (−${GP_CREDIT_COSTS.joinRace} credits) 🏁`);
    },
    onError: (error: Error) => {
      if (error.message !== "__handled__") toast.error(error.message);
    } });
};

export const useUpgradeCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ carId, statType }: { carId: string; statType: 'engine' | 'aero' | 'tires' | 'handling' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const STAT_INCREASE = 5;

      const charged = await chargeGPCredits("upgrade", { item_name: statType, metadata: { carId } });
      if (!charged) throw new Error("__handled__");

      const { data: car } = await supabase
        .from("f1_cars")
        .select("*")
        .eq("id", carId)
        .single();

      if (!car) throw new Error("Car not found");

      const statField = `${statType}_stat`;
      const currentValue = car[statField as keyof typeof car] as number;
      const newStatValue = Math.min(currentValue + STAT_INCREASE, 100);
      const newXP = (car.experience || 0) + 10;
      const newLevel = Math.floor(newXP / 100) + 1;

      await supabase
        .from("f1_cars")
        .update({ [statField]: newStatValue,
          experience: newXP,
          level: newLevel } as any)
        .eq("id", carId);

      return { statType, newValue: newStatValue };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-f1-cars"] });
      queryClient.invalidateQueries({ queryKey: ["gp-ai-credits"] });
      toast.success(`${data.statType} upgraded to ${data.newValue}! (−${GP_CREDIT_COSTS.upgrade} credits) 🔧`);
    },
    onError: (error: Error) => {
      if (error.message !== "__handled__") toast.error(error.message);
    } });
};

export const usePurchaseCarColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ carId, newColor }: { carId: string; newColor: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const charged = await chargeGPCredits("livery", { metadata: { carId, newColor } });
      if (!charged) throw new Error("__handled__");

      await supabase
        .from("f1_cars")
        .update({ color: newColor })
        .eq("id", carId);

      return { carId, newColor };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-f1-cars"] });
      queryClient.invalidateQueries({ queryKey: ["gp-ai-credits"] });
      toast.success(`Car livery changed! (−${GP_CREDIT_COSTS.livery} credit) 🎨`);
    },
    onError: (error: Error) => {
      if (error.message !== "__handled__") toast.error(error.message);
    } });
};
