import { supabase } from "@/integrations/supabase/client";

export const useMentions = () => {
  const searchUsers = async (query: string) => {
    if (!query.trim()) return [];
    const { data, error } = await (supabase as any).rpc("search_users", { q: query, lim: 10 });
    if (error) throw error;
    return data || [];
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map(m => m.substring(1)) : [];
  };

  return { searchUsers, extractMentions };
};
