import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface AchievementCheck {
  code: string;
  check: () => Promise<boolean>;
}

export const useAchievementChecker = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const awardAchievement = useCallback(async (userId: string, achievementCode: string) => {
    // Get achievement by code
    const { data: achievement } = await supabase
      .from("achievements")
      .select("id, name, icon, points")
      .eq("code", achievementCode)
      .maybeSingle();

    if (!achievement) return false;

    // Check if already earned
    const { data: existing } = await supabase
      .from("user_achievements")
      .select("id")
      .eq("user_id", userId)
      .eq("achievement_id", achievement.id)
      .maybeSingle();

    if (existing) return false;

    // Award achievement
    const { error } = await supabase
      .from("user_achievements")
      .insert({
        user_id: userId,
        achievement_id: achievement.id,
      });

    if (error) {
      console.error("Failed to award achievement:", error);
      return false;
    }

    // Add points
    await supabase.rpc('add_user_points', {
      p_user_id: userId,
      p_points: achievement.points || 0,
      p_activity_type: `achievement_${achievementCode}`
    });

    // Show toast
    toast({
      title: `🏆 Achievement Unlocked!`,
      description: `${achievement.icon} ${achievement.name} (+${achievement.points} pts)`,
    });

    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ["user-achievements"] });
    queryClient.invalidateQueries({ queryKey: ["gamification"] });

    return true;
  }, [queryClient, toast]);

  const checkFollowerAchievements = useCallback(async (userId: string) => {
    const { count } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);

    const followers = count || 0;

    const milestones = [
      { count: 1, code: "first_follower" },
      { count: 10, code: "rising_star" },
      { count: 50, code: "popular" },
      { count: 100, code: "influencer" },
      { count: 500, code: "celebrity" },
      { count: 1000, code: "superstar" },
    ];

    for (const milestone of milestones) {
      if (followers >= milestone.count) {
        await awardAchievement(userId, milestone.code);
      }
    }
  }, [awardAchievement]);

  const checkPostAchievements = useCallback(async (userId: string) => {
    const { count } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const posts = count || 0;

    const milestones = [
      { count: 1, code: "first_post" },
      { count: 10, code: "content_creator" },
      { count: 50, code: "prolific_poster" },
      { count: 100, code: "content_master" },
    ];

    for (const milestone of milestones) {
      if (posts >= milestone.count) {
        await awardAchievement(userId, milestone.code);
      }
    }
  }, [awardAchievement]);

  const checkLikeAchievements = useCallback(async (userId: string) => {
    // Likes given
    const { count: likesGiven } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const given = likesGiven || 0;

    const givenMilestones = [
      { count: 10, code: "like_giver_1" },
      { count: 50, code: "like_giver_2" },
      { count: 100, code: "super_liker" },
      { count: 500, code: "like_master" },
    ];

    for (const milestone of givenMilestones) {
      if (given >= milestone.count) {
        await awardAchievement(userId, milestone.code);
      }
    }

    // Likes received
    const { data: userPosts } = await supabase
      .from("posts")
      .select("id")
      .eq("user_id", userId);

    if (userPosts && userPosts.length > 0) {
      const postIds = userPosts.map(p => p.id);
      const { count: likesReceived } = await supabase
        .from("post_likes")
        .select("*", { count: "exact", head: true })
        .in("post_id", postIds);

      const received = likesReceived || 0;

      const receivedMilestones = [
        { count: 10, code: "liked_1" },
        { count: 50, code: "liked_2" },
        { count: 100, code: "like_magnet" },
        { count: 500, code: "viral" },
      ];

      for (const milestone of receivedMilestones) {
        if (received >= milestone.count) {
          await awardAchievement(userId, milestone.code);
        }
      }
    }
  }, [awardAchievement]);

  const checkCommentAchievements = useCallback(async (userId: string) => {
    const { count } = await supabase
      .from("post_comments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const comments = count || 0;

    const milestones = [
      { count: 1, code: "first_comment" },
      { count: 25, code: "commentator" },
      { count: 50, code: "engager_2" },
      { count: 100, code: "discussion_starter" },
    ];

    for (const milestone of milestones) {
      if (comments >= milestone.count) {
        await awardAchievement(userId, milestone.code);
      }
    }
  }, [awardAchievement]);

  const checkXPAchievements = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("user_points")
      .select("total_points")
      .eq("user_id", userId)
      .single();

    const xp = data?.total_points || 0;

    const milestones = [
      { xp: 100, code: "xp_hunter_1" },
      { xp: 500, code: "xp_hunter_2" },
      { xp: 1000, code: "xp_hunter_3" },
      { xp: 5000, code: "xp_hunter_4" },
      { xp: 10000, code: "xp_hunter_5" },
    ];

    for (const milestone of milestones) {
      if (xp >= milestone.xp) {
        await awardAchievement(userId, milestone.code);
      }
    }
  }, [awardAchievement]);

  const checkProfileAchievements = useCallback(async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url, bio, full_name")
      .eq("id", userId)
      .single();

    if (profile) {
      if (profile.avatar_url) {
        await awardAchievement(userId, "profile_picture");
      }
      if (profile.bio) {
        await awardAchievement(userId, "bio_added");
      }
      if (profile.avatar_url && profile.bio && profile.full_name) {
        await awardAchievement(userId, "profile_complete");
      }
    }
  }, [awardAchievement]);

  const checkStreakAchievements = useCallback(async (userId: string) => {
    const { data: rewards } = await supabase
      .from("daily_rewards")
      .select("day_streak")
      .eq("user_id", userId)
      .order("claimed_at", { ascending: false })
      .limit(1);

    const streak = rewards?.[0]?.day_streak || 0;

    const milestones = [
      { streak: 3, code: "streak_3" },
      { streak: 7, code: "streak_7" },
      { streak: 14, code: "streak_14" },
      { streak: 30, code: "streak_30" },
    ];

    for (const milestone of milestones) {
      if (streak >= milestone.streak) {
        await awardAchievement(userId, milestone.code);
      }
    }
  }, [awardAchievement]);

  const checkStoryAchievements = useCallback(async (userId: string) => {
    const { count } = await supabase
      .from("stories")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const stories = count || 0;

    const milestones = [
      { count: 1, code: "first_story" },
      { count: 10, code: "story_teller" },
      { count: 50, code: "story_master" },
    ];

    for (const milestone of milestones) {
      if (stories >= milestone.count) {
        await awardAchievement(userId, milestone.code);
      }
    }
  }, [awardAchievement]);

  const checkPurchaseAchievements = useCallback(async (userId: string) => {
    // Check various purchase tables
    const tables = [
      { table: "ai_credits", code: "ai_studio_buyer" },
      { table: "coloring_credits", code: "coloring_buyer" },
      { table: "astrology_credits", code: "astrology_buyer" },
    ];

    for (const { table, code } of tables) {
      const { data } = await supabase
        .from(table as any)
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      if (data && data.length > 0) {
        await awardAchievement(userId, code);
      }
    }
  }, [awardAchievement]);

  const checkAllAchievements = useCallback(async (userId: string) => {
    if (!userId) return;

    await Promise.all([
      checkFollowerAchievements(userId),
      checkPostAchievements(userId),
      checkLikeAchievements(userId),
      checkCommentAchievements(userId),
      checkXPAchievements(userId),
      checkProfileAchievements(userId),
      checkStreakAchievements(userId),
      checkStoryAchievements(userId),
      checkPurchaseAchievements(userId),
    ]);
  }, [
    checkFollowerAchievements,
    checkPostAchievements,
    checkLikeAchievements,
    checkCommentAchievements,
    checkXPAchievements,
    checkProfileAchievements,
    checkStreakAchievements,
    checkStoryAchievements,
    checkPurchaseAchievements,
  ]);

  return {
    awardAchievement,
    checkAllAchievements,
    checkFollowerAchievements,
    checkPostAchievements,
    checkLikeAchievements,
    checkCommentAchievements,
    checkXPAchievements,
    checkProfileAchievements,
    checkStreakAchievements,
    checkStoryAchievements,
    checkPurchaseAchievements,
  };
};
