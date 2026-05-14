import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface StoryReply {
  id: string;
  story_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export const useStoryReplies = (storyId?: string) => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: replies = [], isLoading } = useQuery({
    queryKey: ["story-replies", storyId],
    enabled: !!storyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("story_replies" as any)
        .select("*")
        .eq("story_id", storyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as StoryReply[];
    },
  });

  const sendReply = useMutation({
    mutationFn: async ({ recipientId, content }: { recipientId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !storyId) throw new Error("Missing context");
      const { error } = await supabase.from("story_replies" as any).insert({
        story_id: storyId,
        sender_id: user.id,
        recipient_id: recipientId,
        content,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["story-replies", storyId] });
      toast({ title: "Reply sent" });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const markRead = useMutation({
    mutationFn: async (replyId: string) => {
      const { error } = await supabase
        .from("story_replies" as any)
        .update({ read_at: new Date().toISOString() } as any)
        .eq("id", replyId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["story-replies"] }),
  });

  return { replies, isLoading, sendReply: sendReply.mutate, markRead: markRead.mutate };
};
