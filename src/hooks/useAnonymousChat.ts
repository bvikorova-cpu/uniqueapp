import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface ChatMessage {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  message_type: string | null;
  voice_url: string | null;
  is_read: boolean | null;
  created_at: string | null;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export function useAnonymousChat(matchId: string | null, currentUserId: string | null, partnerId: string | null) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const lastTypingSentRef = useRef<number>(0);
  const typingDebounceRef = useRef<number | null>(null);


  // Fetch messages + reactions
  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const [{ data: msgs }, { data: rxs }] = await Promise.all([
        supabase.from("anonymous_dating_messages").select("*").eq("match_id", matchId).order("created_at", { ascending: true }),
        supabase.from("anonymous_dating_message_reactions").select("*"),
      ]);
      if (cancelled) return;
      setMessages((msgs as ChatMessage[]) ?? []);
      const msgIds = new Set((msgs ?? []).map((m: any) => m.id));
      setReactions(((rxs as MessageReaction[]) ?? []).filter(r => msgIds.has(r.message_id)));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [matchId]);

  // Realtime subscription + presence
  useEffect(() => {
    if (!matchId || !currentUserId) return;

    const channel = supabase.channel(`anon-chat:${matchId}`, {
      config: { presence: { key: currentUserId } },
    });

    channel
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "anonymous_dating_messages", filter: `match_id=eq.${matchId}` },
        (payload) => {
          const m = payload.new as ChatMessage;
          setMessages(prev => prev.some(p => p.id === m.id) ? prev : [...prev, m]);
        })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "anonymous_dating_messages", filter: `match_id=eq.${matchId}` },
        (payload) => {
          const m = payload.new as ChatMessage;
          setMessages(prev => prev.map(p => p.id === m.id ? m : p));
        })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "anonymous_dating_message_reactions" },
        (payload) => {
          const r = payload.new as MessageReaction;
          setReactions(prev => prev.some(p => p.id === r.id) ? prev : [...prev, r]);
        })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "anonymous_dating_message_reactions" },
        (payload) => {
          const r = payload.old as MessageReaction;
          setReactions(prev => prev.filter(p => p.id !== r.id));
        })
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload?.user_id && payload.payload.user_id !== currentUserId) {
          setPartnerTyping(true);
          if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = window.setTimeout(() => setPartnerTyping(false), 3000);
        }
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const online = partnerId ? Object.keys(state).includes(partnerId) : false;
        setPartnerOnline(online);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: currentUserId, online_at: new Date().toISOString() });
        }
      });

    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
      if (typingDebounceRef.current) window.clearTimeout(typingDebounceRef.current);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [matchId, currentUserId, partnerId]);


  // Mark partner messages as read
  useEffect(() => {
    if (!matchId || !currentUserId) return;
    const unread = messages.filter(m => m.sender_id !== currentUserId && !m.is_read).map(m => m.id);
    if (!unread.length) return;
    supabase.from("anonymous_dating_messages").update({ is_read: true }).in("id", unread).then();
  }, [messages, matchId, currentUserId]);

  const sendMessage = useCallback(async (content: string, messageType: "text" | "voice" = "text", voiceUrl?: string) => {
    if (!matchId || !currentUserId) return;
    const trimmed = content.trim();
    if (!trimmed && !voiceUrl) return;
    const { error } = await supabase.from("anonymous_dating_messages").insert({
      match_id: matchId,
      sender_id: currentUserId,
      content: trimmed || (messageType === "voice" ? "🎤 Voice message" : ""),
      message_type: messageType,
      voice_url: voiceUrl ?? null,
      is_read: false,
    });
    if (error) toast({ title: "Send failed", description: error.message, variant: "destructive" });
  }, [matchId, currentUserId, toast]);

  const broadcastTyping = useCallback(() => {
    channelRef.current?.send({ type: "broadcast", event: "typing", payload: { user_id: currentUserId } });
  }, [currentUserId]);

  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!currentUserId) return;
    const existing = reactions.find(r => r.message_id === messageId && r.user_id === currentUserId && r.emoji === emoji);
    if (existing) {
      await supabase.from("anonymous_dating_message_reactions").delete().eq("id", existing.id);
    } else {
      await supabase.from("anonymous_dating_message_reactions").insert({ message_id: messageId, user_id: currentUserId, emoji });
    }
  }, [reactions, currentUserId]);

  return { messages, reactions, partnerTyping, partnerOnline, loading, sendMessage, broadcastTyping, toggleReaction };
}
