import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UserBadge } from "@/types/entities";

export const useBadges = (userId?: string) => {
  const { data: badges, isLoading } = useQuery<UserBadge[]>({
    queryKey: ["user-badges", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", userId)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId });

  return { badges: badges || [],
    isLoading };
};

// Helper function to award badges (would typically be called from backend)
export const awardBadge = async (
  userId: string,
  badgeId: string
) => {
  const { error } = await supabase.from("user_badges").insert({ user_id: userId,
    badge_id: badgeId });

  if (error) throw error;
};
