import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGamification = (userId?: string) => {
  return useQuery({
    queryKey: ["gamification", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data: points } = await supabase
        .from("user_points")
        .select("*")
        .eq("user_id", userId)
        .single();

      const { data: userAchievements } = await supabase
        .from("user_achievements")
        .select(`
          *,
          achievements (*)
        `)
        .eq("user_id", userId);

      const { data: allAchievements } = await supabase
        .from("achievements")
        .select("*");

      return {
        points: points || { total_points: 0, level: 1 },
        userAchievements: userAchievements || [],
        allAchievements: allAchievements || [],
      };
    },
    enabled: !!userId,
  });
};

export const useUserBadges = (userId: string) => {
  return useQuery({
    queryKey: ["user-badges", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", userId);
      return data || [];
    },
    enabled: !!userId,
  });
};

export const useAllBadges = () => {
  return useQuery({
    queryKey: ["all-badges"],
    queryFn: async () => {
      const { data } = await supabase.from("badges").select("*");
      return data || [];
    },
  });
};

export const useDailyReward = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const checkCanClaim = useQuery({
    queryKey: ["daily-reward"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { canClaim: false, streak: 0 };

      const { data: rewards } = await supabase
        .from("daily_rewards")
        .select("*")
        .eq("user_id", user.id)
        .order("claimed_at", { ascending: false })
        .limit(1);

      const lastClaim = rewards?.[0]?.claimed_at;
      const canClaim = !lastClaim || new Date().toDateString() !== new Date(lastClaim).toDateString();

      return { canClaim, streak: rewards?.[0]?.day_streak || 0 };
    },
  });

  const claimReward = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("daily_rewards")
        .insert({ user_id: user.id });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-reward"] });
      toast({ title: "Success", description: "Daily reward claimed!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to claim reward", variant: "destructive" });
    },
  });

  return { checkCanClaim, claimReward };
};

export const useLeaderboard = (limit: number = 10) => {
  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_points")
        .select(`
          *,
          profile:profiles(*)
        `)
        .order("total_points", { ascending: false })
        .limit(limit);
      return data || [];
    },
  });
};