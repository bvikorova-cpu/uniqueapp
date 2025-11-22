import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Hashtag {
  id: string;
  tag: string;
  use_count: number;
}

export const useHashtags = () => {
  const { data: trending } = useQuery({
    queryKey: ["trending-hashtags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hashtags")
        .select("*")
        .order("use_count", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const searchHashtags = async (query: string) => {
    const { data, error } = await supabase
      .from("hashtags")
      .select("*")
      .ilike("tag", `%${query}%`)
      .order("use_count", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data;
  };

  const extractHashtags = (text: string): string[] => {
    const regex = /#[\w]+/g;
    const matches = text.match(regex);
    return matches ? matches.map(tag => tag.substring(1).toLowerCase()) : [];
  };

  const createHashtagsForPost = async (postId: string, text: string) => {
    const tags = extractHashtags(text);
    if (tags.length === 0) return;

    for (const tag of tags) {
      // Get or create hashtag
      let { data: hashtag } = await supabase
        .from("hashtags")
        .select("id")
        .eq("tag", tag)
        .single();

      if (!hashtag) {
        const { data: newHashtag } = await supabase
          .from("hashtags")
          .insert({ tag })
          .select("id")
          .single();
        hashtag = newHashtag;
      }

      if (hashtag) {
        // Link hashtag to post
        await supabase
          .from("post_hashtags")
          .insert({
            post_id: postId,
            hashtag_id: hashtag.id,
          });
      }
    }
  };

  return {
    trending: trending || [],
    searchHashtags,
    extractHashtags,
    createHashtagsForPost,
  };
};
