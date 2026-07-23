// Realtime Governor — obmedzí počet paralelných Supabase Realtime kanálov na
// klienta a zdieľa jeden kanál pre viacero volaní s tou istou "topic" adresou.
//
// Motivácia: pri 10 000+ concurrent používateľoch je nemysliteľné, aby jeden
// browser držal desiatky WebSocket subscriptions. Governor:
//   1) Zdieľa jeden `RealtimeChannel` pre rovnaké `key` (napr. `notifications:<uid>`).
//   2) Reference-count-uje odbery a `unsubscribe`-uje až keď posledný listener odíde.
//   3) Enforce-uje strop `MAX_CHANNELS` na klienta (soft-fail s console.warn).
//
// Použitie:
//   const release = subscribeShared("notifications:" + uid, (ch) => {
//     ch.on("postgres_changes", { ... }, handler);
//   });
//   // ...neskôr:
//   release();

import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

const MAX_CHANNELS = 12;

type Entry = {
  channel: RealtimeChannel;
  refs: number;
  subscribed: boolean;
};

const registry = new Map<string, Entry>();

export function activeChannelCount(): number {
  return registry.size;
}

/** Zdieľaný subscribe — vráti `release()` funkciu. */
export function subscribeShared(
  key: string,
  configure: (channel: RealtimeChannel) => void,
): () => void {
  let entry = registry.get(key);
  if (!entry) {
    if (registry.size >= MAX_CHANNELS) {
      // eslint-disable-next-line no-console
      console.warn(
        `[realtimeGovernor] MAX_CHANNELS (${MAX_CHANNELS}) reached, refusing "${key}"`,
      );
      return () => {};
    }
    const channel = supabase.channel(key);
    entry = { channel, refs: 0, subscribed: false };
    registry.set(key, entry);
    try {
      configure(channel);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[realtimeGovernor] configure failed", e);
    }
    channel.subscribe((status) => {
      if (entry) entry.subscribed = status === "SUBSCRIBED";
    });
  }
  entry.refs += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    const e = registry.get(key);
    if (!e) return;
    e.refs -= 1;
    if (e.refs <= 0) {
      try {
        supabase.removeChannel(e.channel);
      } catch {
        /* noop */
      }
      registry.delete(key);
    }
  };
}
