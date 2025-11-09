import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useQuizzes = (userId?: string) => {
  return useQuery({
    queryKey: ["quizzes", userId],
    queryFn: async () => {
      let query = supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("creator_id", userId);
      } else {
        query = query.eq("is_published", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!userId || true,
  });
};

export const useQuizDetails = (quizId: string) => {
  return useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single();

      if (quizError) throw quizError;

      const { data: questions, error: questionsError } = await supabase
        .from("quiz_questions")
        .select(`
          *,
          quiz_answers(*)
        `)
        .eq("quiz_id", quizId)
        .order("question_order");

      if (questionsError) throw questionsError;

      return { ...quiz, questions };
    },
    enabled: !!quizId,
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quiz: {
      title: string;
      description: string;
      time_limit_minutes?: number;
      passing_score: number;
      creator_id: string;
    }) => {
      const { data, error } = await supabase
        .from("quizzes")
        .insert(quiz)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create quiz");
    },
  });
};

export const useAddQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      quiz_id: string;
      question_text: string;
      question_order: number;
      points: number;
      answers: Array<{
        answer_text: string;
        is_correct: boolean;
        answer_order: number;
      }>;
    }) => {
      const { data: question, error: questionError } = await supabase
        .from("quiz_questions")
        .insert({
          quiz_id: params.quiz_id,
          question_text: params.question_text,
          question_order: params.question_order,
          points: params.points,
        })
        .select()
        .single();

      if (questionError) throw questionError;

      const answersWithQuestionId = params.answers.map((answer) => ({
        ...answer,
        question_id: question.id,
      }));

      const { error: answersError } = await supabase
        .from("quiz_answers")
        .insert(answersWithQuestionId);

      if (answersError) throw answersError;

      return question;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz"] });
      toast.success("Question added successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add question");
    },
  });
};

export const usePublishQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      const { data, error } = await supabase
        .from("quizzes")
        .update({ is_published: true })
        .eq("id", quizId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz published successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to publish quiz");
    },
  });
};

export const useSubmitQuizAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      quiz_id: string;
      user_id: string;
      score: number;
      total_points: number;
      percentage: number;
      time_taken_seconds?: number;
    }) => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .insert(params)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
      toast.success("Quiz submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit quiz");
    },
  });
};

export const useQuizAttempts = (quizId: string, userId?: string) => {
  return useQuery({
    queryKey: ["quiz-attempts", quizId, userId],
    queryFn: async () => {
      let query = supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quizId)
        .order("completed_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!quizId,
  });
};
