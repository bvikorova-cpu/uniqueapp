import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Counts unread incoming messages for tables that use
 * (sender_id, receiver_id, is_read) — bazaar_messages, coupon_messages.
 * Keeps the count live via realtime INSERT/UPDATE events.
 */
export function useSimpleUnread(table: "bazaar_messages" | "coupon_messages") {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setUnread(0);
      return;
    }
    const { count } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", user.id)
      .eq("is_read", false);
    if (mounted.current) setUnread(count ?? 0);
  }, [user, table]);

  useEffect(() => {
    mounted.current = true;
    refresh();
    if (!user) return;

    const rand =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    const channel = supabase
      .channel(`${table}-unread-${user.id}-${rand}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table }, (payload) => {
        const m: any = payload.new;
        if (m.receiver_id !== user.id) return;
        refresh();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table }, (payload) => {
        const m: any = payload.new;
        if (m.receiver_id !== user.id && m.sender_id !== user.id) return;
        refresh();
      })
      .subscribe();

    return () => {
      mounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [user, table, refresh]);

  return { unread, refresh };
}

export const useBazaarUnread = () => useSimpleUnread("bazaar_messages");
export const useCouponUnread = () => useSimpleUnread("coupon_messages");
