import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SkillConversation {
  offering_id: string;
  other_id: string;
  other_name: string;
  offering_title: string;
  last_message: string;
  last_at: string;
  /** true when the last message was sent by the current user */
  last_mine: boolean;
  unread: number;
  /** the conversation contains at least one message received by me */
  has_incoming: boolean;
  /** the conversation contains at least one message sent by me */
  has_outgoing: boolean;
}

interface Options {
  notifyToasts?: boolean;
}

/**
 * Tracks Skills Marketplace conversations (marketplace_responses) for the
 * current user in realtime — incoming and outgoing threads.
 */
export function useSkillUnread({ notifyToasts = false }: Options = {}) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<SkillConversation[]>([]);
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
      .from("marketplace_responses")
      .select("id, offering_id, sender_id, receiver_id, message, is_read, created_at")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(500);

    const map = new Map<string, SkillConversation>();
    (msgs || []).forEach((m: any) => {
      const other = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      const key = `${m.offering_id}|${other}`;
      const mine = m.sender_id === user.id;
      const isUnread = !mine && !m.is_read;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          offering_id: m.offering_id,
          other_id: other,
          other_name: "User",
          offering_title: "Offering",
          last_message: m.message,
          last_at: m.created_at,
          last_mine: mine,
          unread: isUnread ? 1 : 0,
          has_incoming: !mine,
          has_outgoing: mine,
        });
      } else {
        if (isUnread) existing.unread += 1;
        if (mine) existing.has_outgoing = true;
        else existing.has_incoming = true;
      }
    });

    const list = Array.from(map.values()).sort((a, b) => b.last_at.localeCompare(a.last_at));

    const offeringIds = Array.from(new Set(list.map((c) => c.offering_id)));
    const userIds = Array.from(new Set(list.map((c) => c.other_id)));

    const [offRes, profRes] = await Promise.all([
      offeringIds.length
        ? supabase.from("skill_offerings").select("id, title").in("id", offeringIds)
        : Promise.resolve({ data: [] as any[] }),
      userIds.length
        ? supabase.from("public_profiles").select("id, full_name, username").in("id", userIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const titles = new Map((offRes.data || []).map((o: any) => [o.id, o.title]));
    const names = new Map(
      (profRes.data || []).map((p: any) => [p.id, p.full_name || p.username || "User"]),
    );
    list.forEach((c) => {
      c.offering_title = titles.get(c.offering_id) ?? "Offering";
      c.other_name = names.get(c.other_id) ?? "User";
    });

    if (!mountedRef.current) return;
    setConversations(list);
    setTotalUnread(list.reduce((s, c) => s + c.unread, 0));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    if (!user) return;

    const rand =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    const channel = supabase
      .channel(`skill-messages-${user.id}-${rand}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "marketplace_responses" },
        (payload) => {
          const m: any = payload.new;
          if (m.sender_id !== user.id && m.receiver_id !== user.id) return;
          if (notifyToasts && m.sender_id !== user.id) {
            toast("New skills message", {
              description: m.message.length > 90 ? `${m.message.slice(0, 90)}…` : m.message,
            });
          }
          refresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "marketplace_responses" },
        (payload) => {
          const m: any = payload.new;
          if (m.sender_id !== user.id && m.receiver_id !== user.id) return;
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
