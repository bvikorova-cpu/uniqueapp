import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export const useCollections = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: collections, isLoading } = useQuery({
    queryKey: ["saved-collections"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("saved_collections")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Collection[];
    } });

  const createCollection = useMutation({
    mutationFn: async ({ name, description, isPrivate }: {
      name: string;
      description?: string;
      isPrivate?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("saved_collections")
        .insert({ user_id: user.id,
          name,
          description,
          is_private: isPrivate ?? true })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-collections"] });
      toast({ title: "Collection created!" });
    } });

  const addToCollection = useMutation({
    mutationFn: async ({ collectionId, postId }: {
      collectionId: string;
      postId: string;
    }) => {
      const { error } = await supabase
        .from("collection_items")
        .insert({ collection_id: collectionId,
          post_id: postId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection-items"] });
      toast({ title: "Added to collection!" });
    } });

  const deleteCollection = useMutation({
    mutationFn: async (collectionId: string) => {
      const { error } = await supabase
        .from("saved_collections")
        .delete()
        .eq("id", collectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-collections"] });
      toast({ title: "Collection deleted" });
    } });

  return { collections: collections || [],
    isLoading,
    createCollection: createCollection.mutate,
    addToCollection: addToCollection.mutate,
    deleteCollection: deleteCollection.mutate };
};
