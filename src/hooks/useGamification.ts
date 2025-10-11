import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserPoints = (userId?: string) => {
  return useQuery({
    queryKey: ["user-points", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("user_points")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      
      // Create initial points record if doesn't exist
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from("user_points")
          .insert({ user_id: userId })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newData;
      }

      return data;
    },
    enabled: !!userId,
  });
};

export const useUserBadges = (userId?: string) => {
  return useQuery({
    queryKey: ["user-badges", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data: userBadgesData, error } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", userId)
        .order("earned_at", { ascending: false });

      if (error) throw error;

      // Get badge details
      const badgeIds = userBadgesData.map((ub) => ub.badge_id);
      const { data: badgesData } = await supabase
        .from("badges")
        .select("*")
        .in("id", badgeIds);

      return userBadgesData.map((ub) => ({
        ...ub,
        badges: badgesData?.find((b) => b.id === ub.badge_id),
      }));
    },
    enabled: !!userId,
  });
};

export const useAllBadges = () => {
  return useQuery({
    queryKey: ["all-badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("requirement_value");

      if (error) throw error;
      return data;
    },
  });
};

export const useLeaderboard = (limit = 10) => {
  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: async () => {
      const { data: pointsData, error } = await supabase
        .from("user_points")
        .select("*")
        .order("total_points", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Get profiles
      const userIds = pointsData.map((p) => p.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      return pointsData.map((points) => ({
        ...points,
        profile: profiles?.find((p) => p.id === points.user_id),
      }));
    },
  });
};

export const useDailyReward = () => {
  const queryClient = useQueryClient();

  const checkCanClaim = useQuery({
    queryKey: ["can-claim-daily"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { canClaim: false, streak: 0 };

      const { data } = await supabase
        .from("daily_rewards")
        .select("*")
        .eq("user_id", user.id)
        .order("claimed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!data) {
        return { canClaim: true, streak: 0 };
      }

      const lastClaim = new Date(data.claimed_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24));

      return {
        canClaim: daysDiff >= 1,
        streak: daysDiff === 1 ? data.day_streak : daysDiff > 1 ? 0 : data.day_streak,
        lastClaimDate: lastClaim,
      };
    },
  });

  const claimReward = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const checkResult = await checkCanClaim.refetch();
      if (!checkResult.data?.canClaim) {
        throw new Error("Už si dnes získal odmenu");
      }

      const newStreak = (checkResult.data.streak || 0) + 1;
      const basePoints = 10;
      const streakBonus = Math.min(newStreak * 5, 50);
      const totalPoints = basePoints + streakBonus;

      const { error: rewardError } = await supabase.from("daily_rewards").insert({
        user_id: user.id,
        day_streak: newStreak,
        points_earned: totalPoints,
      });

      if (rewardError) throw rewardError;

      // Add points via RPC
      const { error: pointsError } = await supabase.rpc("add_user_points", {
        p_user_id: user.id,
        p_points: totalPoints,
        p_activity_type: "daily_reward",
      });

      if (pointsError) throw pointsError;

      return { points: totalPoints, streak: newStreak };
    },
    onSuccess: (data) => {
      toast.success(`🎁 Získal si ${data.points} bodov! Streak: ${data.streak} dní`, {
        duration: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ["can-claim-daily"] });
      queryClient.invalidateQueries({ queryKey: ["user-points"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Chyba pri získavaní odmeny");
    },
  });

  return { checkCanClaim, claimReward };
};

export const useActivityLogs = (userId?: string) => {
  return useQuery({
    queryKey: ["activity-logs", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};
