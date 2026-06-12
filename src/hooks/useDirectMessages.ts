import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Direct Messages — 1:1 thin layer over the unified `conversations` schema.
 *
 * The legacy `direct_messages` table is deprecated. Reads/writes go through
 * `conversations` + `conversation_participants` + `conversation_messages`
 * via the `get_or_create_dm_conversation(uuid)` RPC, which lazily creates
 * a 1:1 conversation between the current user and the counterpart.
 *
 * External hook API is preserved so existing callers (SharePostToDM,
 * MessageButton, DirectMessagesDialog) keep working without changes.
 */
export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

const KEY_THREAD = (otherUserId?: string) => ["direct-messages", otherUserId];
const KEY_LIST = ["conversations-list"] as const;

async function ensureDmConversation(otherUserId: string): Promise<string> {
  const { data, error } = await (supabase as any).rpc("get_or_create_dm_conversation", {
    _other_user: otherUserId,
  });
  if (error) throw error;
  return data as string;
}

export const useDirectMessages = (otherUserId?: string) => {
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: KEY_THREAD(otherUserId),
    queryFn: async (): Promise<DirectMessage[]> => {
      if (!otherUserId) return [];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const convId = await ensureDmConversation(otherUserId);

      const { data, error } = await (supabase as any)
        .from("conversation_messages")
        .select("id, sender_id, content, created_at, is_read")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      return (data ?? []).map((m: any): DirectMessage => ({
        id: m.id,
        sender_id: m.sender_id,
        receiver_id: m.sender_id === user.id ? otherUserId : user.id,
        content: m.content,
        is_read: !!m.is_read,
        created_at: m.created_at,
      }));
    },
    enabled: !!otherUserId,
  });

  // Realtime: refresh when new messages arrive in the resolved conversation.
  useEffect(() => {
    if (!otherUserId) return;
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      try {
        const convId = await ensureDmConversation(otherUserId);
        if (!active) return;
        channel = supabase
          .channel(`dm:${convId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "conversation_messages",
              filter: `conversation_id=eq.${convId}`,
            },
            () => {
              queryClient.invalidateQueries({ queryKey: KEY_THREAD(otherUserId) });
              queryClient.invalidateQueries({ queryKey: KEY_LIST });
            },
          )
          .subscribe();
      } catch {
        /* no-op */
      }
    })();

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [otherUserId, queryClient]);

  const { data: conversations } = useQuery({
    queryKey: KEY_LIST,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // My non-group conversations + their other participant
      const { data: parts } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);
      const ids = (parts ?? []).map((p: any) => p.conversation_id);
      if (!ids.length) return [];

      const { data: convs } = await (supabase as any)
        .from("conversations")
        .select("id, is_group, updated_at")
        .in("id", ids)
        .eq("is_group", false);

      const dmIds = (convs ?? []).map((c: any) => c.id);
      if (!dmIds.length) return [];

      // Other participants
      const { data: others } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", dmIds)
        .neq("user_id", user.id);

      // Latest message per conversation (simple per-conv query; fine for typical list sizes)
      const list = await Promise.all(
        (others ?? []).map(async (row: any) => {
          const { data: last } = await (supabase as any)
            .from("conversation_messages")
            .select("content, created_at")
            .eq("conversation_id", row.conversation_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          return {
            userId: row.user_id as string,
            lastMessage: last?.content ?? "",
            lastMessageAt: last?.created_at ?? null,
          };
        }),
      );

      return list
        .filter((x) => x.lastMessageAt)
        .sort((a, b) => (a.lastMessageAt! < b.lastMessageAt! ? 1 : -1));
    },
  });

  const sendMessage = useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Scale guard: server-authoritative rate limit (30 DMs / 60s)
      const { rateLimit, moderateText } = await import("@/lib/scaleGuards");
      const ok = await rateLimit("dm.send", 30, 60);
      if (!ok) throw new Error("Too many messages. Slow down.");

      // Soft moderation — block only high severity
      const mod = await moderateText(content);
      if (!mod.allowed) throw new Error(mod.reason || "Message blocked by safety filter.");

      const convId = await ensureDmConversation(receiverId);

      const { data, error } = await (supabase as any)
        .from("conversation_messages")
        .insert({
          conversation_id: convId,
          sender_id: user.id,
          content,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: KEY_THREAD(vars.receiverId) });
      queryClient.invalidateQueries({ queryKey: KEY_LIST });
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await (supabase as any)
        .from("conversation_messages")
        .update({ is_read: true })
        .eq("id", messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY_THREAD(otherUserId) });
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
