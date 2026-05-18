import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ConversationSummary {
  property_id: string;
  buyer_id: string;
  seller_id: string;
  other_id: string;
  last_content: string;
  last_at: string;
  unread: number;
  property_title?: string;
}

interface Options {
  notifyToasts?: boolean;
}

/**
 * Tracks unread incoming property messages for the current user in realtime.
 * Returns total unread count, per-conversation summaries, and a refresh fn.
 */
export function usePropertyUnread({ notifyToasts = true }: Options = {}) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setConversations([]);
      setTotalUnread(0);
      setLoading(false);
      return;
    }
    const { data: msgs } = await supabase
      .from("property_messages")
      .select("id, property_id, buyer_id, seller_id, sender_id, content, created_at, read_at")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(500);

    const map = new Map<string, ConversationSummary>();
    (msgs || []).forEach((m: any) => {
      const key = `${m.property_id}|${m.buyer_id}|${m.seller_id}`;
      const other = m.buyer_id === user.id ? m.seller_id : m.buyer_id;
      const existing = map.get(key);
      const isUnread = m.sender_id !== user.id && !m.read_at;
      if (!existing) {
        map.set(key, {
          property_id: m.property_id,
          buyer_id: m.buyer_id,
          seller_id: m.seller_id,
          other_id: other,
          last_content: m.content,
          last_at: m.created_at,
          unread: isUnread ? 1 : 0,
        });
      } else if (isUnread) {
        existing.unread += 1;
      }
    });

    const list = Array.from(map.values()).sort((a, b) => b.last_at.localeCompare(a.last_at));

    // hydrate property titles
    const ids = Array.from(new Set(list.map((c) => c.property_id)));
    if (ids.length) {
      const { data: props } = await supabase.from("properties").select("id, title").in("id", ids);
      const titleMap = new Map((props || []).map((p: any) => [p.id, p.title]));
      list.forEach((c) => (c.property_title = titleMap.get(c.property_id)));
    }

    if (!mountedRef.current) return;
    setConversations(list);
    setTotalUnread(list.reduce((s, c) => s + c.unread, 0));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    if (!user) return;

    const channel = supabase
      .channel(`property-unread-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "property_messages" },
        (payload) => {
          const m: any = payload.new;
          if (m.sender_id === user.id) return;
          if (m.buyer_id !== user.id && m.seller_id !== user.id) return;
          if (notifyToasts) {
            toast("New property message", {
              description: m.content.length > 90 ? m.content.slice(0, 90) + "…" : m.content,
            });
          }
          refresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "property_messages" },
        (payload) => {
          const m: any = payload.new;
          if (m.buyer_id !== user.id && m.seller_id !== user.id) return;
          refresh();
        },
      )
      .subscribe();

    return () => {
      mountedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [user, refresh, notifyToasts]);

  return { conversations, totalUnread, loading, refresh };
}
