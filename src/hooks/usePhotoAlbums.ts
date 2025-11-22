import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePhotoAlbums = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: albums, isLoading } = useQuery({
    queryKey: ["photo-albums", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("photo_albums")
        .select("*, album_photos(count)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const createAlbum = useMutation({
    mutationFn: async ({
      title,
      description,
      isPublic,
    }: {
      title: string;
      description?: string;
      isPublic?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("photo_albums").insert({
        user_id: user.id,
        title,
        description,
        is_public: isPublic !== false,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photo-albums"] });
      toast({ title: "Album created!" });
    },
  });

  const addPhotos = useMutation({
    mutationFn: async ({
      albumId,
      photos,
    }: {
      albumId: string;
      photos: { file: File; caption?: string }[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      for (const photo of photos) {
        // Upload photo
        const fileExt = photo.file.name.split(".").pop();
        const fileName = `${user.id}/albums/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(fileName, photo.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("media")
          .getPublicUrl(fileName);

        // Add to album
        const { error } = await supabase.from("album_photos").insert({
          album_id: albumId,
          photo_url: publicUrl,
          caption: photo.caption,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photo-albums"] });
      toast({ title: "Photos added!" });
    },
  });

  return {
    albums: albums || [],
    isLoading,
    createAlbum: createAlbum.mutate,
    addPhotos: addPhotos.mutate,
  };
};
