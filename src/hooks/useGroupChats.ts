import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GroupChat {
  id: string;
  name: string | null;
  avatar_url: string | null;
  is_group: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useGroupChats = () => {
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["group-chats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: parts } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      const ids = (parts ?? []).map((p) => p.conversation_id);
      if (!ids.length) return [];

      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .in("id", ids)
        .eq("is_group", true)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as GroupChat[];
    },
  });

  const createGroup = useMutation({
    mutationFn: async ({ name, memberIds }: { name: string; memberIds: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: conv, error } = await supabase
        .from("conversations")
        .insert({ name, is_group: true, created_by: user.id })
        .select()
        .single();
      if (error) throw error;

      const members = [user.id, ...memberIds.filter((id) => id !== user.id)];
      const { error: e2 } = await supabase
        .from("conversation_participants")
        .insert(members.map((uid) => ({ conversation_id: conv.id, user_id: uid })));
      if (e2) throw e2;
      return conv;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["group-chats"] }),
  });

  return { groups, isLoading, createGroup: createGroup.mutateAsync };
};

export const useGroupMessages = (conversationId?: string) => {
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ["group-messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("conversation_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!conversationId,
  });

  // P1 — realtime so new messages appear instantly.
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversation_messages", filter: `conversation_id=eq.${conversationId}` },
        () => queryClient.invalidateQueries({ queryKey: ["group-messages", conversationId] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, queryClient]);

  const send = useMutation({
    mutationFn: async ({ content, sharedPostId }: { content: string; sharedPostId?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !conversationId) throw new Error("Missing context");
      const { error } = await supabase.from("conversation_messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        shared_post_id: sharedPostId,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["group-messages", conversationId] }),
  });

  return { messages, send: send.mutate };
};
