import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useKidsHomeworkProgress = () => {
  const { user } = useAuth();

  const { data: points, isLoading: pointsLoading } = useQuery({
    queryKey: ['kids-homework-points', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('kids_homework_points')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user });

  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['kids-homework-achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kids_homework_achievements')
        .select('*')
        .order('points_required', { ascending: true });

      if (error) throw error;
      return data;
    } });

  const { data: unlockedAchievements, isLoading: unlockedLoading } = useQuery({
    queryKey: ['kids-homework-user-achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('kids_homework_user_achievements')
        .select(`
          *,
          achievement:kids_homework_achievements(*)
        `)
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user });

  return { points,
    achievements,
    unlockedAchievements,
    isLoading: pointsLoading || achievementsLoading || unlockedLoading };
};
