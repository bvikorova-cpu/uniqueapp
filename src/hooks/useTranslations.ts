import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTranslations = (postId?: string, targetLanguage?: string) => {
  const queryClient = useQueryClient();

  const { data: translation, isLoading } = useQuery({
    queryKey: ["translation", postId, targetLanguage],
    queryFn: async () => {
      if (!postId || !targetLanguage) return null;

      const { data, error } = await supabase
        .from("post_translations")
        .select("*")
        .eq("post_id", postId)
        .eq("language", targetLanguage)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!postId && !!targetLanguage });

  const translatePost = useMutation({ mutationFn: async ({
      postId,
      language,
      content }: {
      postId: string;
      language: string;
      content: string;
    }) => {
      // In production, this would call a translation API
      // For now, we'll just store the mock translation
      const { error } = await supabase.from("post_translations").upsert({
        post_id: postId,
        language,
        translated_content: `[${language.toUpperCase()}] ${content}` });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["translation"] });
    } });

  return { translation,
    isLoading,
    translatePost: translatePost.mutate };
};

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
];
