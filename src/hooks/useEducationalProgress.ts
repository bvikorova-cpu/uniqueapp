import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EducationalProgress {
  id: string;
  user_id: string;
  topic_id: string;
  lessons_completed: number;
  total_lessons: number;
  quiz_score: number;
  quiz_attempts: number;
  stars_earned: number;
  is_completed: boolean;
  last_accessed_at: string;
  completed_at: string | null;
}

export const useEducationalProgress = (topicId?: string) => {
  const queryClient = useQueryClient();

  const { data: progressData, isLoading } = useQuery({
    queryKey: ["educational-progress", topicId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      if (topicId) {
        const { data, error } = await supabase
          .from("educational_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("topic_id", topicId)
          .maybeSingle();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("educational_progress")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;
        return data;
      }
    } });

  const updateProgress = useMutation({
    mutationFn: async (params: {
      topicId: string;
      totalLessons: number;
      lessonsCompleted?: number;
      quizScore?: number;
      starsEarned?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("educational_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("topic_id", params.topicId)
        .maybeSingle();

      const isCompleted = params.lessonsCompleted === params.totalLessons && (params.quizScore || 0) >= 70;

      if (existing) {
        const { error } = await supabase
          .from("educational_progress")
          .update({ lessons_completed: params.lessonsCompleted ?? existing.lessons_completed,
            total_lessons: params.totalLessons,
            quiz_score: params.quizScore ?? existing.quiz_score,
            quiz_attempts: params.quizScore !== undefined ? existing.quiz_attempts + 1 : existing.quiz_attempts,
            stars_earned: params.starsEarned ?? existing.stars_earned,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : existing.completed_at,
            last_accessed_at: new Date().toISOString() })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("educational_progress")
          .insert({ user_id: user.id,
            topic_id: params.topicId,
            lessons_completed: params.lessonsCompleted ?? 0,
            total_lessons: params.totalLessons,
            quiz_score: params.quizScore ?? 0,
            quiz_attempts: params.quizScore !== undefined ? 1 : 0,
            stars_earned: params.starsEarned ?? 0,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["educational-progress"] });
    },
    onError: (error) => {
      console.error("Error updating progress:", error);
      toast.error("Failed to save progress");
    } });

  const saveQuizAnswer = useMutation({
    mutationFn: async (params: {
      topicId: string;
      questionId: string;
      selectedAnswer: string;
      isCorrect: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("educational_quiz_answers")
        .insert({ user_id: user.id,
          topic_id: params.topicId,
          question_id: params.questionId,
          selected_answer: params.selectedAnswer,
          is_correct: params.isCorrect });

      if (error) throw error;
    } });

  const calculateTotalProgress = () => {
    if (!progressData || Array.isArray(progressData)) {
      const allProgress = progressData as EducationalProgress[] || [];
      if (allProgress.length === 0) return 0;
      
      const totalStars = allProgress.reduce((sum, p) => sum + p.stars_earned, 0);
      const completedTopics = allProgress.filter(p => p.is_completed).length;
      
      return {
        totalStars,
        completedTopics,
        overallProgress: Math.round((completedTopics / 8) * 100) // 8 topics total
      };
    }
    return null;
  };

  return { progress: progressData,
    isLoading,
    updateProgress: updateProgress.mutate,
    saveQuizAnswer: saveQuizAnswer.mutate,
    calculateTotalProgress };
};
