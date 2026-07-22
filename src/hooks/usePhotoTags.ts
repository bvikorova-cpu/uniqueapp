import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PhotoTag {
  id: string;
  post_id: string;
  tagged_user_id: string;
  photo_url: string;
  x_position: number | null;
  y_position: number | null;
  created_at: string;
}

export const usePhotoTags = (postId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tags } = useQuery({
    queryKey: ["photo-tags", postId],
    queryFn: async () => {
      if (!postId) return [];

      const { data, error } = await supabase
        .from("photo_tags")
        .select("*, profiles(full_name, avatar_url)")
        .eq("post_id", postId);

      if (error) throw error;
      return data;
    },
    enabled: !!postId });

  const createTag = useMutation({
    mutationFn: async ({ 
      postId, 
      taggedUserId, 
      photoUrl, 
      xPosition, 
      yPosition 
    }: {
      postId: string;
      taggedUserId: string;
      photoUrl: string;
      xPosition?: number;
      yPosition?: number;
    }) => {
      const { error } = await supabase
        .from("photo_tags")
        .insert({ post_id: postId,
          tagged_user_id: taggedUserId,
          photo_url: photoUrl,
          x_position: xPosition,
          y_position: yPosition });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photo-tags"] });
      toast({ title: "User tagged in photo!" });
    } });

  const deleteTag = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from("photo_tags")
        .delete()
        .eq("id", tagId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photo-tags"] });
      toast({ title: "Tag removed" });
    } });

  return { tags: tags || [],
    createTag: createTag.mutate,
    deleteTag: deleteTag.mutate };
};
