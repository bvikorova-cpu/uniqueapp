import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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