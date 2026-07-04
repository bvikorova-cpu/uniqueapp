import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useOnlineStatus = (userId: string | null) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [lastSeenMap, setLastSeenMap] = useState<Record<string, string>>({});

  const fetchPresence = useCallback(async () => {
    if (!userId) return;

    const { data } = await supabase.rpc("get_my_conversation_presence_v1" as any, {
      _user_ids: null,
    });

    if (!Array.isArray(data)) return;

    const online = new Set<string>();
    const seen: Record<string, string> = {};

    data.forEach((row: any) => {
      if (!row?.user_id) return;
      if (row.is_online) online.add(row.user_id);
      if (row.last_seen) seen[row.user_id] = row.last_seen;
    });

    setOnlineUsers(online);
    setLastSeenMap(seen);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    fetchPresence();

    // Subscribe to online status changes
    const channel = supabase
      .channel('online-status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_online_status',
        },
        (payload) => {
          if (payload.new) {
            const newStatus = payload.new as { user_id: string; is_online: boolean; last_seen?: string };
            const activeNow = Boolean(
              newStatus.is_online &&
              newStatus.last_seen &&
              Date.now() - new Date(newStatus.last_seen).getTime() < 2 * 60_000
            );
            setOnlineUsers(prev => {
              const updated = new Set(prev);
              if (activeNow) {
                updated.add(newStatus.user_id);
              } else {
                updated.delete(newStatus.user_id);
              }
              return updated;
            });
            if (newStatus.last_seen) {
              setLastSeenMap(prev => {
                const current = prev[newStatus.user_id];
                if (current && new Date(current).getTime() > new Date(newStatus.last_seen!).getTime()) return prev;
                return { ...prev, [newStatus.user_id]: newStatus.last_seen! };
              });
            }
          }
        }
      )
      .subscribe();

    // Refresh periodically because real account activity (sign-in/profile updates)
    // is not emitted through the online-status realtime table.
    const refresh = setInterval(fetchPresence, 60_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(refresh);
    };
  }, [userId, fetchPresence]);

  const isUserOnline = useCallback((targetUserId: string) => {
    return onlineUsers.has(targetUserId);
  }, [onlineUsers]);

  const getLastSeen = useCallback((targetUserId: string): string | null => {
    return lastSeenMap[targetUserId] ?? null;
  }, [lastSeenMap]);

  return { isUserOnline, onlineUsers, getLastSeen, lastSeenMap };
};
