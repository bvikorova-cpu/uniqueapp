import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Achievement } from "@/types/entities";

export const useAchievements = () => {
  const { data: userAchievements, isLoading: loadingUser } = useQuery<Achievement[]>({
    queryKey: ["user-achievements"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_achievements")
        .select("*, achievements(*)")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map(ua => ({
        ...ua.achievements,
        earned_at: ua.unlocked_at
      })) as Achievement[];
    },
  });

  const { data: allAchievements, isLoading: loadingAll } = useQuery<Achievement[]>({
    queryKey: ["all-achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("points", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const totalPoints = userAchievements?.reduce((sum, a) => sum + (a.points || 0), 0) || 0;

  return {
    userAchievements: userAchievements || [],
    allAchievements: allAchievements || [],
    totalPoints,
    isLoading: loadingUser || loadingAll,
  };
};
