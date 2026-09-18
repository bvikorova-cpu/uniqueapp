import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * ONE shared realtime channel for like/comment/repost activity instead of one
 * channel per feed card. Ten post cards used to open ten websocket channels,
 * which made the Wall feed slow to become interactive.
 */
type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();
let channel: RealtimeChannel | null = null;

const notify = (postId?: string | null) => {
  if (!postId) return;
  listeners.get(postId)?.forEach((fn) => fn());
};

function ensureChannel() {
  if (channel) return;
  channel = supabase
    .channel("post-counts-shared")
    .on("postgres_changes", { event: "*", schema: "public", table: "post_likes" }, (p: any) =>
      notify(p.new?.post_id ?? p.old?.post_id),
    )
    .on("postgres_changes", { event: "*", schema: "public", table: "post_comments" }, (p: any) =>
      notify(p.new?.post_id ?? p.old?.post_id),
    )
    .on("postgres_changes", { event: "*", schema: "public", table: "reposts" }, (p: any) =>
      notify(p.new?.original_post_id ?? p.old?.original_post_id),
    )
    .subscribe();
}

export function subscribePostCounts(postId: string, listener: Listener): () => void {
  ensureChannel();
  let set = listeners.get(postId);
  if (!set) {
    set = new Set();
    listeners.set(postId, set);
  }
  set.add(listener);

  return () => {
    const current = listeners.get(postId);
    if (!current) return;
    current.delete(listener);
    if (current.size === 0) listeners.delete(postId);
    if (listeners.size === 0 && channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
  };
}
