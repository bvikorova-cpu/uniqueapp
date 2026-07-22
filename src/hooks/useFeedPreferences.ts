import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FeedPreferences {
  id: string;
  user_id: string;
  preferred_categories: string[];
  hidden_users: string[];
  sort_preference: string;
}

export const useFeedPreferences = () => {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ["feed-preferences"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("feed_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      // Create default preferences if none exist
      if (!data) {
        const { data: newPrefs, error: insertError } = await supabase
          .from("feed_preferences")
          .insert({ user_id: user.id,
            preferred_categories: [],
            hidden_users: [],
            sort_preference: "smart" })
          .select()
          .single();

        if (insertError) throw insertError;
        return newPrefs;
      }

      return data;
    } });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<FeedPreferences>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("feed_preferences")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-preferences"] });
    } });

  return { preferences,
    isLoading,
    updatePreferences: updatePreferences.mutate };
};
