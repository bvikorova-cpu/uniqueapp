import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { shardedChannel, shouldShard } from "@/lib/realtimeSharding";


/**
 * PresenceUser — minimal payload tracked per user in a presence channel.
 * Keep it small: presence syncs run on every join/leave.
 */
export interface PresenceUser {
  user_id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  online_at: string;
}

interface UsePresenceChannelOptions {
  /** Unique channel key, e.g. `post:${postId}` or `room:${roomId}`. */
  channelKey: string;
  /** Current user — pass `null` to act as a passive observer (no self-tracking). */
  user: { id: string; display_name?: string | null; avatar_url?: string | null } | null;
  /** Disable to keep the channel idle (e.g. component not visible). */
  enabled?: boolean;
}

/**
 * Lightweight Realtime presence — no DB writes, scoped per channel key.
 * Returns a deduped list of currently-present users + a stable channel ref
 * that callers (e.g. typing indicator) can reuse to avoid double-subscribing.
 */
export function usePresenceChannel({
  channelKey,
  user,
  enabled = true,
}: UsePresenceChannelOptions) {
  const [presentUsers, setPresentUsers] = useState<PresenceUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled || !channelKey) return;

    const baseTopic = `presence:${channelKey}`;
    // Auto-shard hot topics (live streams, megatalent, brand-battle) to stay
    // under Supabase's ~500 clients-per-channel soft cap.
    const topic = shouldShard(baseTopic) ? shardedChannel(baseTopic, user?.id) : baseTopic;
    const channel = supabase.channel(topic, {
      config: { presence: { key: user?.id ?? `anon-${crypto.randomUUID()}` } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceUser>();
        const flat: PresenceUser[] = [];
        const seen = new Set<string>();
        for (const key of Object.keys(state)) {
          for (const meta of state[key]) {
            if (meta.user_id && !seen.has(meta.user_id)) {
              seen.add(meta.user_id);
              flat.push(meta);
            }
          }
        }
        setPresentUsers(flat);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && user) {
          await channel.track({
            user_id: user.id,
            display_name: user.display_name ?? null,
            avatar_url: user.avatar_url ?? null,
            online_at: new Date().toISOString(),
          } satisfies PresenceUser);
        }
      });

    channelRef.current = channel;

    return () => {
      channel.untrack().catch(() => {});
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [channelKey, user?.id, user?.display_name, user?.avatar_url, enabled]);

  return {
    presentUsers,
    channel: channelRef,
    count: presentUsers.length,
  };
}
