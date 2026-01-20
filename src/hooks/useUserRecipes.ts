import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserRecipe {
  id: string;
  user_id: string;
  title: string;
  category: string;
  difficulty: string;
  time: string;
  servings: number;
  calories: number | null;
  description: string | null;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  image_url: string | null;
  video_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export function useUserRecipes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: userRecipes = [], isLoading, refetch } = useQuery({
    queryKey: ["user-recipes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_recipes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserRecipe[];
    },
  });

  const deleteRecipe = useMutation({
    mutationFn: async (recipeId: string) => {
      const { error } = await supabase
        .from("user_recipes")
        .delete()
        .eq("id", recipeId)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-recipes"] });
    },
  });

  return {
    userRecipes,
    isLoading,
    refetch,
    deleteRecipe: deleteRecipe.mutate,
    isDeleting: deleteRecipe.isPending,
  };
}
