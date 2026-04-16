import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FRIEND_CHALLENGE_ACHIEVEMENTS } from '@/types/brain-duel-achievements';

export const useBrainDuelRealTimeNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Listen for new friend achievements
    const achievementsChannel = supabase
      .channel(`brain-duel-achievements-toast-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'brain_duel_friend_achievements',
        },
        async (payload) => {
          const newAchievement = payload.new as { user_id: string; achievement_type: string };
          
          // Don't notify about your own achievements
          if (newAchievement.user_id === user.id) return;

          // Get the achiever's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', newAchievement.user_id)
            .single();

          const achievement = FRIEND_CHALLENGE_ACHIEVEMENTS[newAchievement.achievement_type];
          
          if (achievement && profile) {
            toast.success(`🎉 ${profile.full_name} unlocked an achievement!`, {
              description: `${achievement.name}: ${achievement.description}`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // Listen for new friend challenges
    const challengesChannel = supabase
      .channel(`brain-duel-challenges-toast-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'brain_duel_friend_challenges',
        },
        async (payload) => {
          const newChallenge = payload.new as { challenged_id: string; challenger_id: string; stake_credits: number };
          
          // Only notify if you're the challenged player
          if (newChallenge.challenged_id !== user.id) return;

          // Get the challenger's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', newChallenge.challenger_id)
            .single();

          if (profile) {
            toast.info(`⚔️ ${profile.full_name} challenged you!`, {
              description: `Stake: ${newChallenge.stake_credits} credits`,
              duration: 7000,
            });
          }
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      void supabase.removeChannel(achievementsChannel);
      void supabase.removeChannel(challengesChannel);
    };
  }, [user]);
};
