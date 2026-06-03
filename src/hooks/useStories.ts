import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackChallengeAction } from "@/lib/trackChallenge";

export const useStories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stories, isLoading } = useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .gt("expires_at", now)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Manually fetch profiles for each story
      const storiesWithProfiles = await Promise.all(
        (data || []).map(async (story) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", story.user_id)
            .single();
          return { ...story, profiles: profile };
        })
      );
      
      return storiesWithProfiles;
    },
  });

  const createStory = useMutation({
    mutationFn: async ({
      mediaFile,
      caption,
    }: {
      mediaFile: File;
      caption?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload media
      const fileExt = mediaFile.name.split(".").pop();
      const fileName = `${user.id}/stories/${Date.now()}.${fileExt}`;
      const mediaType = mediaFile.type.startsWith("image/") ? "image" : "video";

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, mediaFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(fileName);

      // Create story (expires in 24 hours)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error } = await supabase.from("stories").insert({
        user_id: user.id,
        media_url: publicUrl,
        media_type: mediaType,
        caption,
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      toast({ title: "Story created!" });
    },
  });

  const viewStory = useMutation({
    mutationFn: async (storyId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("story_views").insert({
        story_id: storyId,
        user_id: user.id,
      });
    },
  });

  return {
    stories: stories || [],
    isLoading,
    createStory: createStory.mutate,
    viewStory: viewStory.mutate,
  };
};
