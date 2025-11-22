import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePostEmbeds = (postId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: embeds = [], isLoading } = useQuery({
    queryKey: ["post-embeds", postId],
    queryFn: async () => {
      if (!postId) return [];

      const { data, error } = await supabase
        .from("post_embeds")
        .select("*")
        .eq("post_id", postId);

      if (error) throw error;
      return data;
    },
    enabled: !!postId,
  });

  const addEmbed = useMutation({
    mutationFn: async ({
      postId,
      embedType,
      embedUrl,
      embedTitle,
      embedDescription,
      embedImage,
    }: {
      postId: string;
      embedType: "link" | "video" | "music" | "location" | "product";
      embedUrl: string;
      embedTitle?: string;
      embedDescription?: string;
      embedImage?: string;
    }) => {
      const { error } = await supabase.from("post_embeds").insert({
        post_id: postId,
        embed_type: embedType,
        embed_url: embedUrl,
        embed_title: embedTitle,
        embed_description: embedDescription,
        embed_image: embedImage,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Embed added!" });
      queryClient.invalidateQueries({ queryKey: ["post-embeds"] });
    },
    onError: () => {
      toast({ title: "Failed to add embed", variant: "destructive" });
    },
  });

  const deleteEmbed = useMutation({
    mutationFn: async (embedId: string) => {
      const { error } = await supabase
        .from("post_embeds")
        .delete()
        .eq("id", embedId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Embed removed" });
      queryClient.invalidateQueries({ queryKey: ["post-embeds"] });
    },
  });

  return {
    embeds,
    isLoading,
    addEmbed: addEmbed.mutate,
    deleteEmbed: deleteEmbed.mutate,
  };
};
