import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useOnlineStatus = (userId: string | null) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const updateMyStatus = useCallback(async (isOnline: boolean) => {
    if (!userId) return;

    await supabase
      .from("user_online_status")
      .upsert({
        user_id: userId,
        is_online: isOnline,
        last_seen: new Date().toISOString(),
      }, { onConflict: 'user_id' });
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // Set online when component mounts
    updateMyStatus(true);

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
            const newStatus = payload.new as { user_id: string; is_online: boolean };
            setOnlineUsers(prev => {
              const updated = new Set(prev);
              if (newStatus.is_online) {
                updated.add(newStatus.user_id);
              } else {
                updated.delete(newStatus.user_id);
              }
              return updated;
            });
          }
        }
      )
      .subscribe();

    // Fetch initial online statuses
    const fetchOnlineStatuses = async () => {
      const { data } = await supabase
        .from("user_online_status")
        .select("user_id")
        .eq("is_online", true);

      if (data) {
        setOnlineUsers(new Set(data.map(d => d.user_id)));
      }
    };

    fetchOnlineStatuses();

    // Set offline on page unload
    const handleBeforeUnload = () => {
      updateMyStatus(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Heartbeat to maintain online status
    const heartbeat = setInterval(() => {
      updateMyStatus(true);
    }, 30000);

    return () => {
      updateMyStatus(false);
      supabase.removeChannel(channel);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(heartbeat);
    };
  }, [userId, updateMyStatus]);

  const isUserOnline = useCallback((targetUserId: string) => {
    return onlineUsers.has(targetUserId);
  }, [onlineUsers]);

  return { isUserOnline, onlineUsers };
};
