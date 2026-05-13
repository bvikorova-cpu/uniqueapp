import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFollowedTopics = () => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ["followed-topics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("followed_topics")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const follow = useMutation({
    mutationFn: async (topic: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const cleaned = topic.trim().toLowerCase().replace(/^#/, "");
      const { error } = await supabase
        .from("followed_topics")
        .upsert({ user_id: user.id, topic: cleaned }, { onConflict: "user_id,topic" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["followed-topics"] });
      toast({ title: "Topic followed" });
    },
  });

  const unfollow = useMutation({
    mutationFn: async (topic: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("followed_topics")
        .delete()
        .eq("user_id", user.id)
        .eq("topic", topic);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["followed-topics"] }),
  });

  return {
    topics,
    topicNames: topics.map((t: any) => t.topic),
    isLoading,
    followTopic: follow.mutate,
    unfollowTopic: unfollow.mutate,
  };
};
