import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePostPolls = (postId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: poll, isLoading } = useQuery({
    queryKey: ["post-poll", postId],
    queryFn: async () => {
      if (!postId) return null;

      const { data, error } = await supabase
        .from("post_polls")
        .select("*, poll_votes(*)")
        .eq("post_id", postId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!postId,
  });

  const createPoll = useMutation({
    mutationFn: async ({ postId, question, options, multipleChoice, endsAt }: {
      postId: string;
      question: string;
      options: string[];
      multipleChoice?: boolean;
      endsAt?: Date;
    }) => {
      const { error } = await supabase.from("post_polls").insert({
        post_id: postId,
        question,
        options: options.map((text, index) => ({ index, text, votes: 0 })),
        multiple_choice: multipleChoice,
        ends_at: endsAt?.toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-poll"] });
      toast({ title: "Poll created!" });
    },
  });

  const vote = useMutation({
    mutationFn: async ({ pollId, optionIndex }: {
      pollId: string;
      optionIndex: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("poll_votes").insert({
        poll_id: pollId,
        user_id: user.id,
        option_id: `option_${optionIndex}`,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-poll"] });
      toast({ title: "Vote recorded!" });
    },
  });

  return {
    poll,
    isLoading,
    createPoll: createPoll.mutate,
    vote: vote.mutate,
  };
};
