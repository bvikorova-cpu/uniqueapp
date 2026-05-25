import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSearch = () => {
  const [searching, setSearching] = useState(false);

  const searchPosts = async (query: string) => {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .ilike("content", `%${query}%`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    return data;
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) return [];

    const { data, error } = await (supabase as any).rpc("search_users", { q: query, lim: 20 });

    if (error) throw error;
    return data;
  };

  const searchHashtags = async (query: string) => {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from("hashtags")
      .select("*")
      .ilike("tag", `%${query}%`)
      .order("use_count", { ascending: false })
      .limit(20);

    if (error) throw error;
    return data;
  };

  const saveSearchHistory = async (query: string, resultType: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("search_history")
      .insert({
        user_id: user.id,
        query,
        result_type: resultType,
      });
  };

  const search = async (query: string, type: "all" | "posts" | "users" | "hashtags" = "all") => {
    setSearching(true);
    try {
      let results: any = {};

      if (type === "all" || type === "posts") {
        results.posts = await searchPosts(query);
      }
      if (type === "all" || type === "users") {
        results.users = await searchUsers(query);
      }
      if (type === "all" || type === "hashtags") {
        results.hashtags = await searchHashtags(query);
      }

      await saveSearchHistory(query, type);
      return results;
    } finally {
      setSearching(false);
    }
  };

  return {
    search,
    searching,
    searchPosts,
    searchUsers,
    searchHashtags,
  };
};
