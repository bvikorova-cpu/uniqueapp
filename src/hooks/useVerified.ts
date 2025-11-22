import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useVerified = (userId?: string) => {
  const { data: isVerified } = useQuery({
    queryKey: ["verified", userId],
    queryFn: async () => {
      if (!userId) return false;

      const { data, error } = await supabase
        .from("verified_users")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return !!data;
    },
    enabled: !!userId,
  });

  return { isVerified: isVerified || false };
};
