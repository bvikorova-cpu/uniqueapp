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
    },
  });
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
    enabled: !!quizId,
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quiz, questions }: { quiz: Quiz; questions: QuizQuestion[] }) => {
      // Create quiz
      const { data: quizData, error: quizError } = await supabase
        .from("course_quizzes")
        .insert([quiz])
        .select()
        .single();

      if (quizError) throw quizError;

      // Create questions
      const questionsWithQuizId = questions.map((q, index) => ({
        quiz_id: quizData.id,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        order_index: index,
      }));

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
    },
  });
};

export const useSubmitQuizAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quizId,
      answers,
      score,
      passed,
    }: {
      quizId: string;
      answers: Record<string, string>;
      score: number;
      passed: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("quiz_attempts")
        .insert({
          quiz_id: quizId,
          user_id: user.id,
          answers,
          score,
          passed,
        })
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
    },
  });
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
    enabled: !!quizId,
  });
};
