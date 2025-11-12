import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export const useKidsDailyChallenge = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  // Generate challenge on mount if needed
  useEffect(() => {
    const generateChallenge = async () => {
      try {
        await supabase.rpc('generate_daily_homework_challenge');
      } catch (error) {
        console.error('Error generating challenge:', error);
      }
    };
    generateChallenge();
  }, []);

  const { data: challenge, isLoading: challengeLoading } = useQuery({
    queryKey: ['daily-challenge', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kids_homework_daily_challenges')
        .select('*')
        .eq('challenge_date', today)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['daily-progress', user?.id, today],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('kids_homework_daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_date', today)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: completion, isLoading: completionLoading } = useQuery({
    queryKey: ['challenge-completion', user?.id, challenge?.id],
    queryFn: async () => {
      if (!user || !challenge) return null;
      
      const { data, error } = await supabase
        .from('kids_homework_challenge_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_id', challenge.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!challenge,
  });

  return {
    challenge,
    progress,
    isCompleted: !!completion,
    isLoading: challengeLoading || progressLoading || completionLoading,
  };
};
