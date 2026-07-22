import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePostMood = (postId?: string) => {
  const queryClient = useQueryClient();

  const { data: mood, isLoading } = useQuery({
    queryKey: ["post-mood", postId],
    queryFn: async () => {
      if (!postId) return null;

      const { data, error } = await supabase
        .from("post_moods")
        .select("*")
        .eq("post_id", postId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!postId });

  const addMood = useMutation({ mutationFn: async ({
      postId,
      mood,
      emoji }: {
      postId: string;
      mood: string;
      emoji?: string;
    }) => {
      const { error } = await supabase.from("post_moods").insert({ post_id: postId,
        mood,
        emoji });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-mood"] });
    } });

  return { mood,
    isLoading,
    addMood: addMood.mutate };
};

export const MOOD_OPTIONS = [
  { value: "happy", label: "Happy", emoji: "😊" },
  { value: "excited", label: "Excited", emoji: "🤩" },
  { value: "grateful", label: "Grateful", emoji: "🙏" },
  { value: "loved", label: "Loved", emoji: "❤️" },
  { value: "sad", label: "Sad", emoji: "😢" },
  { value: "angry", label: "Angry", emoji: "😠" },
  { value: "tired", label: "Tired", emoji: "😴" },
  { value: "motivated", label: "Motivated", emoji: "💪" },
  { value: "blessed", label: "Blessed", emoji: "✨" },
  { value: "thoughtful", label: "Thoughtful", emoji: "🤔" },
];
