import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FeaturedLink {
  id: string;
  user_id: string;
  title: string;
  url: string;
  icon: string | null;
  position: number;
}

export interface PinnedPost {
  id: string;
  user_id: string;
  post_id: string;
  position: number;
}

export const useProfileCustomization = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: pinnedPosts = [] } = useQuery({
    queryKey: ["pinned-posts", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("profile_pinned_posts")
        .select("*")
        .eq("user_id", userId)
        .order("position");
      if (error) throw error;
      return data as PinnedPost[];
    },
    enabled: !!userId,
  });

  const { data: featuredLinks = [] } = useQuery({
    queryKey: ["featured-links", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("profile_featured_links")
        .select("*")
        .eq("user_id", userId)
        .order("position");
      if (error) throw error;
      return data as FeaturedLink[];
    },
    enabled: !!userId,
  });

  const pinPost = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profile_pinned_posts")
        .insert({ user_id: user.id, post_id: postId });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pinned-posts"] }),
  });

  const unpinPost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("profile_pinned_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pinned-posts"] }),
  });

  const addLink = useMutation({
    mutationFn: async ({ title, url, icon }: { title: string; url: string; icon?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("profile_featured_links").insert({
        user_id: user.id,
        title,
        url,
        icon,
        position: featuredLinks.length,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["featured-links"] }),
  });

  const removeLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("profile_featured_links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["featured-links"] }),
  });

  const updateBanner = useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const path = `${user.id}/banner-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("user-uploads").upload(path, file);
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("user-uploads").getPublicUrl(path);
      const { error } = await supabase
        .from("profiles")
        .update({ banner_url: pub.publicUrl })
        .eq("id", user.id);
      if (error) throw error;
      return pub.publicUrl;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });

  return {
    pinnedPosts,
    featuredLinks,
    pinPost: pinPost.mutate,
    unpinPost: unpinPost.mutate,
    addLink: addLink.mutate,
    removeLink: removeLink.mutate,
    updateBanner: updateBanner.mutateAsync,
  };
};
