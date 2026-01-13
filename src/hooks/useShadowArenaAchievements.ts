import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ShadowArenaAchievement {
  id: string;
  user_id: string;
  battle_id: string | null;
  placement: number;
  badge_type: string;
  awarded_at: string;
  notified_teen_career: boolean;
  created_at: string;
}

export const useShadowArenaAchievements = (userId?: string) => {
  const { data: achievements, isLoading } = useQuery<ShadowArenaAchievement[]>({
    queryKey: ["shadow-arena-achievements", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("shadow_arena_achievements")
        .select("*")
        .eq("user_id", userId)
        .order("awarded_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  return {
    achievements: achievements || [],
    isLoading,
    hasTalentBadge: (achievements?.length || 0) > 0,
    highestPlacement: achievements?.reduce((min, a) => Math.min(min, a.placement), 4) || null,
  };
};

export const useAwardShadowArenaBadge = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      battleId,
      placement,
    }: {
      userId: string;
      battleId: string;
      placement: number;
    }) => {
      // First, check if already awarded for this battle
      const { data: existing } = await supabase
        .from("shadow_arena_achievements")
        .select("id")
        .eq("user_id", userId)
        .eq("battle_id", battleId)
        .single();

      if (existing) {
        return { alreadyAwarded: true };
      }

      // Award the Shadow Arena achievement
      const { error: achievementError } = await supabase
        .from("shadow_arena_achievements")
        .insert({
          user_id: userId,
          battle_id: battleId,
          placement,
          badge_type: "shadow_arena_talent",
        });

      if (achievementError) throw achievementError;

      // Get the Shadow Arena Talent badge ID
      const { data: badge } = await supabase
        .from("badges")
        .select("id")
        .eq("requirement_type", "shadow_arena_winner")
        .single();

      if (badge) {
        // Check if user already has this badge
        const { data: existingBadge } = await supabase
          .from("user_badges")
          .select("id")
          .eq("user_id", userId)
          .eq("badge_id", badge.id)
          .single();

        if (!existingBadge) {
          // Award the badge to user
          await supabase.from("user_badges").insert({
            user_id: userId,
            badge_id: badge.id,
          });
        }
      }

      // Insert placement record
      await supabase.from("shadow_battle_placements").insert({
        battle_id: battleId,
        user_id: userId,
        placement,
      });

      return { success: true, placement };
    },
    onSuccess: (data) => {
      if (!data.alreadyAwarded) {
        queryClient.invalidateQueries({ queryKey: ["shadow-arena-achievements"] });
        queryClient.invalidateQueries({ queryKey: ["user-badges"] });
        
        toast({
          title: "🏆 Shadow Arena Talent Badge Awarded!",
          description: "Congratulations! Your win has been added to your Teen Career Profile as a new achievement.",
        });
      }
    },
    onError: (error: Error) => {
      console.error("Error awarding badge:", error);
      toast({
        title: "Error",
        description: "Failed to award badge",
        variant: "destructive",
      });
    },
  });
};

// Hook to check if user has Shadow Arena achievements for Teen Career
export const useHasShadowArenaAchievementsForCareer = () => {
  return useQuery({
    queryKey: ["shadow-arena-career-check"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { hasBadge: false, achievements: [] };

      const { data, error } = await supabase
        .from("shadow_arena_achievements")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      return {
        hasBadge: (data?.length || 0) > 0,
        achievements: data || [],
        placementLabels: data?.map((a) => {
          switch (a.placement) {
            case 1: return "1st Place Winner";
            case 2: return "2nd Place Winner";
            case 3: return "3rd Place Winner";
            default: return "Top Performer";
          }
        }) || [],
      };
    },
  });
};
