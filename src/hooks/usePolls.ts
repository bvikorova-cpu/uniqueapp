import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Poll {
  id: string;
  post_id: string;
  question: string;
  ends_at: string;
  created_at: string;
}

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  vote_count: number;
}

export interface PollVote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
}

export const usePolls = (postId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: poll, isLoading: loadingPoll } = useQuery({
    queryKey: ["poll", postId],
    queryFn: async () => {
      if (!postId) return null;
      const { data, error } = await supabase
        .from("polls")
        .select("*")
        .eq("post_id", postId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!postId,
  });

  const { data: options, isLoading: loadingOptions } = useQuery({
    queryKey: ["poll-options", poll?.id],
    queryFn: async () => {
      if (!poll?.id) return [];
      const { data, error } = await supabase
        .from("poll_options")
        .select("*")
        .eq("poll_id", poll.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!poll?.id,
  });

  const { data: userVote } = useQuery({
    queryKey: ["poll-vote", poll?.id],
    queryFn: async () => {
      if (!poll?.id) return null;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("poll_votes")
        .select("*")
        .eq("poll_id", poll.id)
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!poll?.id,
  });

  const createPoll = useMutation({
    mutationFn: async ({ postId, question, options, endsAt }: {
      postId: string;
      question: string;
      options: string[];
      endsAt: Date;
    }) => {
      const { data: pollData, error: pollError } = await supabase
        .from("polls")
        .insert({
          post_id: postId,
          question,
          ends_at: endsAt.toISOString(),
        })
        .select()
        .single();

      if (pollError) throw pollError;

      const optionsData = options.map(opt => ({
        poll_id: pollData.id,
        option_text: opt,
      }));

      const { error: optionsError } = await supabase
        .from("poll_options")
        .insert(optionsData);

      if (optionsError) throw optionsError;
      return pollData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poll"] });
      toast({ title: "Poll created!" });
    },
  });

  const votePoll = useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: string; optionId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: voteError } = await supabase
        .from("poll_votes")
        .insert({
          poll_id: pollId,
          option_id: optionId,
          user_id: user.id,
        });

      if (voteError) throw voteError;

      // Update vote count
      const { data: option } = await supabase
        .from("poll_options")
        .select("vote_count")
        .eq("id", optionId)
        .single();

      if (option) {
        await supabase
          .from("poll_options")
          .update({ vote_count: option.vote_count + 1 })
          .eq("id", optionId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poll-options"] });
      queryClient.invalidateQueries({ queryKey: ["poll-vote"] });
      toast({ title: "Vote recorded!" });
    },
  });

  return {
    poll,
    options: options || [],
    userVote,
    isLoading: loadingPoll || loadingOptions,
    createPoll: createPoll.mutate,
    votePoll: votePoll.mutate,
  };
};
