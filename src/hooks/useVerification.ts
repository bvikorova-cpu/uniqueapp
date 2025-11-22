import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useVerification = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: verification } = useQuery({
    queryKey: ["user-verification", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("user_verification")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!userId,
  });

  const requestVerification = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_verification")
        .insert({
          user_id: user.id,
          documents_submitted: true,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-verification"] });
      toast({ title: "Verification request submitted!" });
    },
  });

  return {
    verification,
    isVerified: verification?.verification_type !== "none",
    requestVerification: requestVerification.mutate,
  };
};
