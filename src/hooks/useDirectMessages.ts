import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const useDirectMessages = (otherUserId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ["direct-messages", otherUserId],
    queryFn: async () => {
      if (!otherUserId) return [];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!otherUserId,
  });

  const { data: conversations } = useQuery({
    queryKey: ["conversations-list"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get all unique conversation partners
      const { data, error } = await supabase
        .from("direct_messages")
        .select("sender_id, receiver_id, content, created_at")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Extract unique users and their last message
      const conversationsMap = new Map();
      data?.forEach((msg) => {
        const otherUser = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!conversationsMap.has(otherUser)) {
          conversationsMap.set(otherUser, {
            userId: otherUser,
            lastMessage: msg.content,
            lastMessageAt: msg.created_at,
          });
        }
      });

      return Array.from(conversationsMap.values());
    },
  });

  const sendMessage = useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("direct_messages")
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["direct-messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversations-list"] });
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("direct_messages")
        .update({ is_read: true })
        .eq("id", messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["direct-messages"] });
    },
  });

  return {
    messages: messages || [],
    conversations: conversations || [],
    isLoading,
    sendMessage: sendMessage.mutate,
    markAsRead: markAsRead.mutate,
  };
};
