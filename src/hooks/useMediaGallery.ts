import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MediaItem {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  post_id: string | null;
  album_name: string | null;
  description: string | null;
  created_at: string;
}

export const useMediaGallery = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: media, isLoading } = useQuery({
    queryKey: ["media-gallery", userId],
    queryFn: async () => {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from("user_media_gallery")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } });

  const { data: albums } = useQuery({
    queryKey: ["media-albums", userId],
    queryFn: async () => {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from("user_media_gallery")
        .select("album_name")
        .eq("user_id", targetUserId)
        .not("album_name", "is", null);

      if (error) throw error;

      // Get unique album names
      const uniqueAlbums = [...new Set(data.map((item) => item.album_name))];
      return uniqueAlbums.filter(Boolean) as string[];
    } });

  const addToGallery = useMutation({ mutationFn: async ({
      mediaUrl,
      mediaType,
      postId,
      albumName,
      description }: {
      mediaUrl: string;
      mediaType: string;
      postId?: string;
      albumName?: string;
      description?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("user_media_gallery").insert({ user_id: user.id,
        media_url: mediaUrl,
        media_type: mediaType,
        post_id: postId,
        album_name: albumName,
        description });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["media-albums"] });
    } });

  const deleteMedia = useMutation({
    mutationFn: async (mediaId: string) => {
      const { error } = await supabase
        .from("user_media_gallery")
        .delete()
        .eq("id", mediaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-gallery"] });
      toast({ title: "Media deleted" });
    } });

  const photos = media?.filter((m) => m.media_type === "image") || [];
  const videos = media?.filter((m) => m.media_type === "video") || [];

  return { media: media || [],
    albums: albums || [],
    photos,
    videos,
    isLoading,
    addToGallery: addToGallery.mutate,
    deleteMedia: deleteMedia.mutate };
};
