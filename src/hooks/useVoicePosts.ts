import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useVoicePosts = (postId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: voicePost, isLoading } = useQuery({
    queryKey: ["voice-post", postId],
    queryFn: async () => {
      if (!postId) return null;

      const { data, error } = await supabase
        .from("voice_posts")
        .select("*")
        .eq("post_id", postId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!postId });

  const createVoicePost = useMutation({ mutationFn: async ({
      postId,
      audioFile,
      transcript }: {
      postId: string;
      audioFile: File;
      transcript?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload audio file
      const fileExt = audioFile.name.split(".").pop();
      const fileName = `${user.id}/voice/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, audioFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(fileName);

      // Create voice post record
      const { error } = await supabase.from("voice_posts").insert({ post_id: postId,
        audio_url: publicUrl,
        duration: Math.floor(audioFile.size / 16000), // Rough estimate
        transcript });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Voice post created!" });
      queryClient.invalidateQueries({ queryKey: ["voice-post"] });
    },
    onError: () => {
      toast({ title: "Failed to create voice post", variant: "destructive" });
    } });

  return { voicePost,
    isLoading,
    createVoicePost: createVoicePost.mutate };
};
