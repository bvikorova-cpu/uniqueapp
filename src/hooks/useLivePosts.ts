import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useLivePosts = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: livePosts = [], isLoading } = useQuery({
    queryKey: ["live-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_posts")
        .select(`
          *,
          posts (*)
        `)
        .eq("is_active", true)
        .order("started_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const startLive = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("live_posts").insert({
        post_id: postId,
        is_active: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Live post started!" });
      queryClient.invalidateQueries({ queryKey: ["live-posts"] });
    },
  });

  const endLive = useMutation({
    mutationFn: async (livePostId: string) => {
      const { error } = await supabase
        .from("live_posts")
        .update({
          is_active: false,
          ended_at: new Date().toISOString(),
        })
        .eq("id", livePostId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Live post ended" });
      queryClient.invalidateQueries({ queryKey: ["live-posts"] });
    },
  });

  const joinLive = useMutation({
    mutationFn: async (livePostId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Record viewer
      await supabase.from("live_viewers").upsert({
        live_post_id: livePostId,
        viewer_id: user.id,
        last_seen: new Date().toISOString(),
      });

      // Increment viewers count
      const { data: livePost } = await supabase
        .from("live_posts")
        .select("viewers_count")
        .eq("id", livePostId)
        .single();

      if (livePost) {
        await supabase
          .from("live_posts")
          .update({ viewers_count: livePost.viewers_count + 1 })
          .eq("id", livePostId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-posts"] });
    },
  });

  return {
    livePosts,
    isLoading,
    startLive: startLive.mutate,
    endLive: endLive.mutate,
    joinLive: joinLive.mutate,
  };
};
