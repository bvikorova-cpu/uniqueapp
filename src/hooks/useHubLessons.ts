import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface HubProgressRow {
  course_key: string;
  lesson_key: string;
}

/** Completed lessons of the current user across all Education Hub courses. */
export const useHubLessonProgress = () => {
  return useQuery({
    queryKey: ["hub-lesson-progress"],
    queryFn: async (): Promise<HubProgressRow[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("education_lesson_progress")
        .select("course_key, lesson_key")
        .eq("user_id", user.id);
      return (data ?? []) as HubProgressRow[];
    },
    staleTime: 30_000,
  });
};

/** Exercise (quiz) submissions of the current user. */
export const useHubExerciseScores = () => {
  return useQuery({
    queryKey: ["hub-exercise-scores"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [] as { course_key: string; lesson_key: string; score: number | null }[];
      const { data } = await supabase
        .from("education_exercise_submissions")
        .select("course_key, lesson_key, score")
        .eq("user_id", user.id);
      return (data ?? []) as { course_key: string; lesson_key: string; score: number | null }[];
    },
    staleTime: 30_000,
  });
};

const invalidate = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ["hub-lesson-progress"] });
  qc.invalidateQueries({ queryKey: ["hub-exercise-scores"] });
  qc.invalidateQueries({ queryKey: ["education-stats"] });
};

/** Marks a lesson complete (+15 Education XP) or removes it. */
export const useCompleteHubLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseKey, lessonKey, completed = true }: { courseKey: string; lessonKey: string; completed?: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to track your progress.");
      if (completed) {
        const { error } = await supabase
          .from("education_lesson_progress")
          .upsert(
            { user_id: user.id, course_key: courseKey, lesson_key: lessonKey },
            { onConflict: "user_id,course_key,lesson_key" },
          );
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("education_lesson_progress")
          .delete()
          .eq("user_id", user.id)
          .eq("course_key", courseKey)
          .eq("lesson_key", lessonKey);
        if (error) throw error;
      }
      return completed;
    },
    onSuccess: (completed) => {
      invalidate(qc);
      toast.success(completed ? "Lesson completed · +15 XP" : "Lesson marked as not done");
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not save progress"),
  });
};

/** Saves an exercise (quiz) result (+10 Education XP for the first submission). */
export const useSubmitHubExercise = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseKey, lessonKey, score, answers }: { courseKey: string; lessonKey: string; score: number; answers: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to save your result.");
      const { error } = await supabase
        .from("education_exercise_submissions")
        .upsert(
          {
            user_id: user.id,
            course_key: courseKey,
            lesson_key: lessonKey,
            submission_text: answers.join(" | "),
            score,
          },
          { onConflict: "user_id,course_key,lesson_key" },
        );
      if (error) throw error;
      return score;
    },
    onSuccess: (score) => {
      invalidate(qc);
      toast.success(`Exercise saved · ${score}% · +10 XP`);
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not save your result"),
  });
};
