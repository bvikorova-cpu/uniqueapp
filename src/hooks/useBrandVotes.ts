import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBrandVotes = () => {
  return useQuery({
    queryKey: ["brand-votes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { total: 1, used: 0, remaining: 1 };

      const today = new Date().toISOString().split('T')[0];
      const { data: voteTracking } = await supabase
        .from("user_daily_votes")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      const freeVotes = 1;
      const purchasedVotes = voteTracking?.votes_purchased || 0;
      const totalVotes = freeVotes + purchasedVotes;
      const usedVotes = voteTracking?.votes_used || 0;
      const remainingVotes = totalVotes - usedVotes;

      return {
        total: totalVotes,
        used: usedVotes,
        remaining: Math.max(0, remainingVotes),
        purchased: purchasedVotes,
      };
    },
  });
};
