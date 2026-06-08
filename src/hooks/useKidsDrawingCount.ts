import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/** Count of saved drawings for the current user (from public.kids_drawings). */
export function useKidsDrawingCount() {
  const { user } = useAuth();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["kids-drawing-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from("kids_drawings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (error) return 0;
      return count ?? 0;
    },
    enabled: !!user,
  });
  return { count: data ?? 0, isLoading, refetch };
}
