import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRecommendations = () => {
  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ["user-recommendations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_recommendations")
        .select("*")
        .eq("user_id", user.id)
        .order("score", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Fetch profile information for recommended users
      if (!data || data.length === 0) return [];

      const userIds = data.map((r) => r.recommended_user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      return data.map((rec) => ({ ...rec,
        profile: profiles?.find((p) => p.id === rec.recommended_user_id) }));
    } });

  return { recommendations,
    isLoading };
};
