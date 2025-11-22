import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useInterests = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: interests } = useQuery({
    queryKey: ["user-interests", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("user_interests")
        .select("*")
        .eq("user_id", userId)
        .order("interest_level", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const addInterest = useMutation({
    mutationFn: async ({ interest, level }: {
      interest: string;
      level?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_interests")
        .insert({
          user_id: user.id,
          interest: interest.toLowerCase(),
          interest_level: level || 5,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-interests"] });
      toast({ title: "Interest added!" });
    },
  });

  const removeInterest = useMutation({
    mutationFn: async (interestId: string) => {
      const { error } = await supabase
        .from("user_interests")
        .delete()
        .eq("id", interestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-interests"] });
      toast({ title: "Interest removed" });
    },
  });

  return {
    interests: interests || [],
    addInterest: addInterest.mutate,
    removeInterest: removeInterest.mutate,
  };
};
