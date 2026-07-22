import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useRecipeLikes = (recipeId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: likes } = useQuery({
    queryKey: ["recipe-likes", recipeId],
    queryFn: async () => {
      const { data } = await supabase
        .from("recipe_likes")
        .select("*")
        .eq("recipe_id", recipeId);
      return data || [];
    } });

  const toggleLike = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in");

      const existing = likes?.find(l => l.user_id === user.id);
      
      if (existing) {
        await supabase.from("recipe_likes").delete().eq("id", existing.id);
      } else { await supabase.from("recipe_likes").insert({
          recipe_id: recipeId,
          user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipe-likes", recipeId] });
    },
    onError: () => { toast({
        title: "Error",
        description: "Please log in to like recipes",
        variant: "destructive" });
    } });

  return { likes, toggleLike };
};

export const useRecipeComments = (recipeId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: comments } = useQuery({
    queryKey: ["recipe-comments", recipeId],
    queryFn: async () => {
      const { data } = await supabase
        .from("recipe_comments")
        .select("*")
        .eq("recipe_id", recipeId)
        .order("created_at", { ascending: false });
      return data || [];
    } });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in");

      await supabase.from("recipe_comments").insert({ recipe_id: recipeId,
        user_id: user.id,
        content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipe-comments", recipeId] });
      toast({ title: "Success",
        description: "Comment added!" });
    },
    onError: () => { toast({
        title: "Error",
        description: "Please log in to comment",
        variant: "destructive" });
    } });

  return { comments, addComment };
};

export const useRecipeRating = (recipeId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: ratings } = useQuery({
    queryKey: ["recipe-ratings", recipeId],
    queryFn: async () => {
      const { data } = await supabase
        .from("recipe_ratings")
        .select("*")
        .eq("recipe_id", recipeId);
      return data || [];
    } });

  const averageRating = ratings?.length
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  const setRating = useMutation({
    mutationFn: async (rating: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in");

      await supabase.from("recipe_ratings").upsert({ recipe_id: recipeId,
        user_id: user.id,
        rating });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipe-ratings", recipeId] });
      toast({ title: "Success",
        description: "Rating saved!" });
    },
    onError: () => { toast({
        title: "Error",
        description: "Please log in to rate",
        variant: "destructive" });
    } });

  return { ratings, averageRating, setRating };
};