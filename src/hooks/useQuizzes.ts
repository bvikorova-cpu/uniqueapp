import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface QuizQuestion {
  id?: string;
  quiz_id?: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  order_index: number;
}

export interface Quiz {
  id?: string;
  title: string;
  passing_score?: number;
  lesson_id: string;
  difficulty?: string;
  created_at?: string;
}

export const useQuizzes = () => {
  return useQuery({
    queryKey: ["quizzes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_quizzes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } });
};

export const useQuiz = (quizId: string | undefined) => {
  return useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      if (!quizId) return null;

      const { data: quiz, error: quizError } = await supabase
        .from("course_quizzes")
        .select("*")
        .eq("id", quizId)
        .single();

      if (quizError) throw quizError;

      const { data: questions, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("order_index");

      if (questionsError) throw questionsError;

      return { quiz, questions };
    },
    enabled: !!quizId });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quiz, questions }: { quiz: Quiz; questions: QuizQuestion[] }) => {
      const resolveLessonId = async () => {
        if (quiz.lesson_id && quiz.lesson_id !== "default") return quiz.lesson_id;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Please sign in to create a quiz");

        const courseTitle = "My Custom Quizzes";
        const { data: existingCourse, error: courseLookupError } = await supabase
          .from("courses")
          .select("id")
          .eq("creator_id", user.id)
          .eq("title", courseTitle)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        if (courseLookupError) throw courseLookupError;

        let courseId = existingCourse?.id;
        if (!courseId) {
          const { data: newCourse, error: courseCreateError } = await supabase
            .from("courses")
            .insert({
              creator_id: user.id,
              title: courseTitle,
              description: "Private workspace for manually created Education quizzes.",
              category: "education",
              difficulty_level: "beginner",
              price: 0,
              is_published: false,
            })
            .select("id")
            .single();
          if (courseCreateError) throw courseCreateError;
          courseId = newCourse.id;
        }

        const { data: existingLesson, error: lessonLookupError } = await supabase
          .from("course_lessons")
          .select("id")
          .eq("course_id", courseId)
          .eq("title", "Manual Quiz Bank")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        if (lessonLookupError) throw lessonLookupError;
        if (existingLesson?.id) return existingLesson.id;

        const { data: newLesson, error: lessonCreateError } = await supabase
          .from("course_lessons")
          .insert({
            course_id: courseId,
            title: "Manual Quiz Bank",
            description: "Private manual quiz storage.",
            duration_minutes: 0,
            order_index: 0,
            is_preview: false,
          })
          .select("id")
          .single();
        if (lessonCreateError) throw lessonCreateError;
        return newLesson.id;
      };

      const lessonId = await resolveLessonId();
      // Create quiz
      const { data: quizData, error: quizError } = await supabase
        .from("course_quizzes")
        .insert([{ ...quiz, lesson_id: lessonId }])
        .select()
        .single();

      if (quizError) throw quizError;

      // Create questions
      const questionsWithQuizId = questions.map((q, index) => ({ quiz_id: quizData.id,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        order_index: index }));

      const { error: questionsError } = await supabase
        .from("quiz_questions")
        .insert(questionsWithQuizId);

      if (questionsError) throw questionsError;

      return quizData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz created successfully!");
    },
    onError: (error) => {
      console.error("Error creating quiz:", error);
      toast.error("Failed to create quiz");
    } });
};

export const useSubmitQuizAttempt = () => { const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quizId,
      answers,
      score,
      passed }: {
      quizId: string;
      answers: Record<string, string>;
      score: number;
      passed: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("quiz_attempts")
        .insert({ quiz_id: quizId,
          user_id: user.id,
          answers,
          score,
          passed })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
      toast.success("Quiz submitted successfully!");
    },
    onError: () => {
      toast.error("Failed to submit quiz");
    } });
};

export const useQuizAttempts = (quizId: string | undefined) => {
  return useQuery({
    queryKey: ["quiz-attempts", quizId],
    queryFn: async () => {
      if (!quizId) return [];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("user_id", user.id)
        .order("attempted_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!quizId });
};
