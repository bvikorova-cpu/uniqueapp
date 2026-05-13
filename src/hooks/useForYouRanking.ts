import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useForYouRanking = (enabled: boolean) => {
  return useQuery({
    queryKey: ["for-you-ranking"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("rank-feed", {
        body: { limit: 50 },
      });
      if (error) throw error;
      return (data?.ids ?? []) as string[];
    },
    enabled,
    staleTime: 60_000,
  });
};
