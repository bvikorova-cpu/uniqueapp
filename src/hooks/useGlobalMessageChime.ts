import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { playMessageChime } from "@/lib/messageChime";

/**
 * Globally subscribe to new messages in any conversation the current user
 * participates in, and play the message chime when one arrives from someone
 * else — even if the user is not currently on the Messenger page.
 */
export const useGlobalMessageChime = () => {
  const { user } = useAuth();
  const convIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const loadConvIds = async () => {
      const { data } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);
      if (cancelled) return;
      convIdsRef.current = new Set((data || []).map((r: any) => r.conversation_id));
    };

    loadConvIds();

    // Refresh participant list when user is added to a new conversation
    const partsChannel = supabase
      .channel(`participants-watch-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversation_participants",
          filter: `user_id=eq.${user.id}`,
        },
        () => loadConvIds(),
      )
      .subscribe();

    const msgChannel = supabase
      .channel(`global-messages-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m: any = payload.new;
          if (!m) return;
          if (m.sender_id === user.id) return;
          if (!convIdsRef.current.has(m.conversation_id)) return;
          playMessageChime();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(partsChannel);
      supabase.removeChannel(msgChannel);
    };
  }, [user?.id]);
};
