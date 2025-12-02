import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// XP required for each level (level -> xp needed)
export const calculateXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.15, level - 1));
};

export const calculateLevelFromXP = (totalXP: number): { level: number; currentXP: number; xpForNextLevel: number } => {
  let level = 1;
  let xpRemaining = totalXP;
  
  while (level < 100) {
    const xpNeeded = calculateXPForLevel(level);
    if (xpRemaining < xpNeeded) {
      return {
        level,
        currentXP: xpRemaining,
        xpForNextLevel: xpNeeded,
      };
    }
    xpRemaining -= xpNeeded;
    level++;
  }
  
  return { level: 100, currentXP: xpRemaining, xpForNextLevel: 0 };
};

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  rarity: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  level: number;
  current_xp: number;
  total_xp: number;
  gifts_sent: number;
  gifts_received: number;
  total_credits_spent: number;
  streak_days: number;
  last_gift_date: string | null;
}

export const useSocialGiftsProgress = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get user progress
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["social-gifts-progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      let { data, error } = await supabase
        .from("social_gifts_user_progress")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data && !error) {
        // Create initial progress
        const { data: newData, error: createError } = await supabase
          .from("social_gifts_user_progress")
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (createError) throw createError;
        return newData;
      }

      if (error) throw error;
      return data;
    },
  });

  // Get all badges
  const { data: allBadges = [], isLoading: badgesLoading } = useQuery({
    queryKey: ["social-gifts-badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_gifts_badges")
        .select("*")
        .order("requirement_value", { ascending: true });

      if (error) throw error;
      return data as Badge[];
    },
  });

  // Get user's earned badges
  const { data: earnedBadges = [], isLoading: earnedLoading } = useQuery({
    queryKey: ["social-gifts-user-badges"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("social_gifts_user_badges")
        .select("*, social_gifts_badges(*)")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
  });

  // Award badge
  const awardBadge = useMutation({
    mutationFn: async (badgeId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("social_gifts_user_badges")
        .insert({ user_id: user.id, badge_id: badgeId });

      if (error && error.code !== "23505") throw error; // Ignore duplicate
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-gifts-user-badges"] });
    },
  });

  // Add XP and update progress
  const addXP = useMutation({
    mutationFn: async ({ xp, type }: { xp: number; type: "gift_sent" | "gift_received" | "badge" }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const currentProgress = progress || { total_xp: 0, gifts_sent: 0, gifts_received: 0 };
      const newTotalXP = (currentProgress.total_xp || 0) + xp;
      const { level, currentXP } = calculateLevelFromXP(newTotalXP);

      const updates: any = {
        total_xp: newTotalXP,
        current_xp: currentXP,
        level,
        updated_at: new Date().toISOString(),
      };

      if (type === "gift_sent") {
        updates.gifts_sent = (currentProgress.gifts_sent || 0) + 1;
        updates.last_gift_date = new Date().toISOString().split("T")[0];
      } else if (type === "gift_received") {
        updates.gifts_received = (currentProgress.gifts_received || 0) + 1;
      }

      const { error } = await supabase
        .from("social_gifts_user_progress")
        .upsert({ 
          user_id: user.id, 
          ...updates 
        }, { 
          onConflict: "user_id" 
        });

      if (error) throw error;

      return { newLevel: level, previousLevel: progress?.level || 1 };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["social-gifts-progress"] });
      
      if (data.newLevel > data.previousLevel) {
        toast({
          title: `🎉 Level Up! You're now level ${data.newLevel}!`,
          description: "Keep sending gifts to level up more!",
        });
      }
    },
  });

  const levelInfo = progress 
    ? calculateLevelFromXP(progress.total_xp || 0)
    : { level: 1, currentXP: 0, xpForNextLevel: 100 };

  return {
    progress,
    progressLoading,
    allBadges,
    earnedBadges,
    earnedBadgeIds: earnedBadges.map((eb: any) => eb.badge_id),
    isLoading: progressLoading || badgesLoading || earnedLoading,
    awardBadge: awardBadge.mutate,
    addXP: addXP.mutate,
    levelInfo,
  };
};
