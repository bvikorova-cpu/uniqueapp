import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pages, isLoading } = useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*, page_followers(count)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((p: any) => ({
        ...p,
        follower_count: p.page_followers?.[0]?.count ?? 0,
      }));
    },
  });

  const invalidateAll = () => {
    invalidateAll();
    queryClient.invalidateQueries({ queryKey: ["suggested-pages"] });
  };

  const createPage = useMutation({
    mutationFn: async ({
      name,
      description,
      category,
      coverImage,
    }: {
      name: string;
      description?: string;
      category?: string;
      coverImage?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: page, error: pageError } = await supabase
        .from("pages")
        .insert({
          name,
          description,
          category,
          cover_image_url: coverImage,
          user_id: user.id,
        })
        .select()
        .single();

      if (pageError) throw pageError;

      // Add owner as follower
      const { error: followerError } = await supabase
        .from("page_followers")
        .insert({
          page_id: page.id,
          user_id: user.id,
        });

      if (followerError) throw followerError;
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Page created!" });
    },
  });

  const followPage = useMutation({
    mutationFn: async (pageId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Use upsert to avoid duplicate key errors
      const { error } = await supabase.from("page_followers").upsert(
        {
          page_id: pageId,
          user_id: user.id,
        },
        {
          onConflict: "page_id,user_id",
          ignoreDuplicates: true,
        }
      );

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Following page!" });
    },
  });

  const unfollowPage = useMutation({
    mutationFn: async (pageId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("page_followers")
        .delete()
        .eq("page_id", pageId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Unfollowed page" });
    },
  });

  return {
    pages: pages || [],
    isLoading,
    createPage: createPage.mutate,
    followPage: followPage.mutate,
    unfollowPage: unfollowPage.mutate,
  };
};
