import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TypingPayload {
  user_id: string;
  display_name?: string | null;
  ts: number;
}

interface UseTypingIndicatorOptions {
  /** Same channel key convention as `usePresenceChannel`, e.g. `post:${postId}`. */
  channelKey: string;
  user: { id: string; display_name?: string | null } | null;
  /** Stop showing a user as typing after this many ms of silence. */
  timeoutMs?: number;
  /** Throttle outgoing broadcasts so we don't flood the channel. */
  throttleMs?: number;
}

/**
 * Typing indicator over Supabase Realtime broadcast.
 * Uses a separate channel from presence to avoid resync churn on key strokes.
 */
export function useTypingIndicator({
  channelKey,
  user,
  timeoutMs = 4000,
  throttleMs = 1500,
}: UseTypingIndicatorOptions) {
  const [typingUsers, setTypingUsers] = useState<TypingPayload[]>([]);
  const lastSentRef = useRef(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const sweepRef = useRef<number | null>(null);

  useEffect(() => {
    if (!channelKey) return;

    const channel = supabase.channel(`typing:${channelKey}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const incoming = payload as TypingPayload;
        if (!incoming?.user_id || incoming.user_id === user?.id) return;
        setTypingUsers((prev) => {
          const others = prev.filter((p) => p.user_id !== incoming.user_id);
          return [...others, { ...incoming, ts: Date.now() }];
        });
      })
      .subscribe();

    channelRef.current = channel;

    // Sweep stale entries every second
    sweepRef.current = window.setInterval(() => {
      const cutoff = Date.now() - timeoutMs;
      setTypingUsers((prev) => prev.filter((p) => p.ts > cutoff));
    }, 1000);

    return () => {
      if (sweepRef.current) window.clearInterval(sweepRef.current);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [channelKey, user?.id, timeoutMs]);

  const notifyTyping = useCallback(() => {
    if (!user || !channelRef.current) return;
    const now = Date.now();
    if (now - lastSentRef.current < throttleMs) return;
    lastSentRef.current = now;
    channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: {
        user_id: user.id,
        display_name: user.display_name ?? null,
        ts: now,
      } satisfies TypingPayload,
    });
  }, [user, throttleMs]);

  return { typingUsers, notifyTyping };
}
