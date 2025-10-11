import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const POINT_VALUES = {
  post: 10,
  comment: 5,
  like: 2,
  video: 15,
  story: 8,
  friend: 20,
  daily_login: 10,
};

export const useGamification = (userId?: string) => {
  const queryClient = useQueryClient();

  // Get user points
  const { data: userPoints } = useQuery({
    queryKey: ["user-points", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("user_points")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      // Create if doesn't exist
      if (!data) {
        const { data: newData, error: createError } = await supabase
          .from("user_points")
          .insert({ user_id: userId })
          .select()
          .single();

        if (createError) throw createError;
        return newData;
      }

      return data;
    },
    enabled: !!userId,
  });

  // Get user badges
  const { data: userBadges = [] } = useQuery({
    queryKey: ["user-badges", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("user_badges")
        .select(`
          *,
          badges(*)
        `)
        .eq("user_id", userId)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Get all badges
  const { data: allBadges = [] } = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("requirement_value", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Add points
  const addPointsMutation = useMutation({
    mutationFn: async ({
      points,
      activityType,
    }: {
      points: number;
      activityType: string;
    }) => {
      if (!userId) throw new Error("No user ID");

      const { error } = await supabase.rpc("add_user_points", {
        p_user_id: userId,
        p_points: points,
        p_activity_type: activityType,
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-points", userId] });
      queryClient.invalidateQueries({ queryKey: ["activity-logs", userId] });
      toast.success(`+${variables.points} bodov! 🎉`);
    },
  });

  // Claim daily reward
  const claimDailyRewardMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("No user ID");

      // Check last claim
      const { data: lastClaim } = await supabase
        .from("daily_rewards")
        .select("*")
        .eq("user_id", userId)
        .order("claimed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      let streak = 1;
      let points = POINT_VALUES.daily_login;

      if (lastClaim) {
        const lastClaimDate = new Date(lastClaim.claimed_at);
        const hoursSinceLastClaim =
          (now.getTime() - lastClaimDate.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastClaim < 24) {
          throw new Error("Already claimed today");
        }

        // Check if consecutive day
        if (
          lastClaimDate >= yesterday &&
          lastClaimDate < now
        ) {
          streak = lastClaim.day_streak + 1;
          points = POINT_VALUES.daily_login * streak; // Bonus for streak
        }
      }

      // Insert daily reward
      const { error: rewardError } = await supabase
        .from("daily_rewards")
        .insert({
          user_id: userId,
          day_streak: streak,
          points_earned: points,
        });

      if (rewardError) throw rewardError;

      // Add points
      const { error: pointsError } = await supabase.rpc("add_user_points", {
        p_user_id: userId,
        p_points: points,
        p_activity_type: "daily_login",
      });

      if (pointsError) throw pointsError;

      return { streak, points };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-points", userId] });
      queryClient.invalidateQueries({ queryKey: ["daily-rewards", userId] });
      toast.success(
        `Denná odmena získaná! ${data.streak} dní v rade! +${data.points} bodov 🎁`
      );
    },
    onError: (error: any) => {
      if (error.message === "Already claimed today") {
        toast.info("Dnes už si odmenu získal. Príď zajtra!");
      } else {
        toast.error("Chyba pri získavaní odmeny");
      }
    },
  });

  // Check if can claim daily reward
  const { data: canClaimDaily } = useQuery({
    queryKey: ["can-claim-daily", userId],
    queryFn: async () => {
      if (!userId) return false;

      const { data: lastClaim } = await supabase
        .from("daily_rewards")
        .select("claimed_at")
        .eq("user_id", userId)
        .order("claimed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!lastClaim) return true;

      const now = new Date();
      const lastClaimDate = new Date(lastClaim.claimed_at);
      const hoursSinceLastClaim =
        (now.getTime() - lastClaimDate.getTime()) / (1000 * 60 * 60);

      return hoursSinceLastClaim >= 24;
    },
    enabled: !!userId,
    refetchInterval: 60000, // Check every minute
  });

  // Calculate points needed for next level
  const pointsForNextLevel = userPoints
    ? Math.pow(userPoints.level, 2) * 100
    : 100;

  const progressToNextLevel = userPoints
    ? (userPoints.current_level_points / pointsForNextLevel) * 100
    : 0;

  return {
    userPoints,
    userBadges,
    allBadges,
    addPoints: addPointsMutation.mutate,
    claimDailyReward: claimDailyRewardMutation.mutate,
    canClaimDaily,
    pointsForNextLevel,
    progressToNextLevel,
  };
};
