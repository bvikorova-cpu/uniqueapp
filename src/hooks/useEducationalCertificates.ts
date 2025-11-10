import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Certificate {
  id: string;
  user_id: string;
  certificate_number: string;
  student_name: string;
  total_topics_completed: number;
  total_stars_earned: number;
  average_quiz_score: number;
  issued_at: string;
  created_at: string;
}

export const useEducationalCertificates = () => {
  const queryClient = useQueryClient();

  const { data: certificates, isLoading } = useQuery({
    queryKey: ["educational-certificates"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("educational_certificates")
        .select("*")
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false });

      if (error) throw error;
      return data as Certificate[];
    },
  });

  const createCertificate = useMutation({
    mutationFn: async ({
      studentName,
      totalTopicsCompleted,
      totalStarsEarned,
      averageQuizScore,
    }: {
      studentName: string;
      totalTopicsCompleted: number;
      totalStarsEarned: number;
      averageQuizScore: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("educational_certificates")
        .insert({
          user_id: user.id,
          student_name: studentName,
          total_topics_completed: totalTopicsCompleted,
          total_stars_earned: totalStarsEarned,
          average_quiz_score: averageQuizScore,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Certificate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["educational-certificates"] });
      toast.success("🎓 Certificate created successfully!");
    },
    onError: (error: Error) => {
      toast.error("Failed to create certificate: " + error.message);
    },
  });

  return {
    certificates,
    isLoading,
    createCertificate: createCertificate.mutate,
    isCreating: createCertificate.isPending,
  };
};
