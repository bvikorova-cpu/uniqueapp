import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface FavoriteSection {
  id: string;
  user_id: string;
  path: string;
  title: string | null;
  category: string | null;
  position: number;
  created_at: string;
}

export const useFavoriteSections = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorite-sections", user?.id],
    queryFn: async (): Promise<FavoriteSection[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("favorite_sections")
        .select("*")
        .eq("user_id", user.id)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as FavoriteSection[];
    },
    enabled: !!user,
  });

  const isFavorite = (path: string) => favorites.some((f) => f.path === path);

  const toggleFavorite = useMutation({
    mutationFn: async (input: { path: string; title?: string; category?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const existing = favorites.find((f) => f.path === input.path);
      if (existing) {
        const { error } = await supabase
          .from("favorite_sections")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
        return { action: "removed" as const };
      }
      const { error } = await supabase.from("favorite_sections").insert({
        user_id: user.id,
        path: input.path,
        title: input.title ?? null,
        category: input.category ?? null,
        position: favorites.length,
      });
      if (error) throw error;
      return { action: "added" as const };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["favorite-sections"] });
      toast({
        title:
          data.action === "added"
            ? "Added to your favorites"
            : "Removed from favorites",
      });
    },
    onError: (e: any) => {
      toast({
        title: "Could not update favorites",
        description: e?.message ?? "Please sign in and try again.",
        variant: "destructive",
      });
    },
  });

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite: toggleFavorite.mutate,
  };
};
