/**
 * Realtime channel sharding helper.
 *
 * Supabase Realtime has a soft limit of ~500 concurrent clients per channel
 * before broadcast latency degrades. For very high-traffic topics (global
 * feeds, leaderboards, popular live streams), we hash the subscriber's user
 * id into N shards. All shards receive the same broadcast (publisher fans
 * out), but presence/typing/cursor events stay isolated per shard.
 *
 * For low-traffic topics (1:1 DM, small rooms) just use the raw topic.
 */

const DEFAULT_SHARDS = 8;

/**
 * Fast non-cryptographic hash → unsigned 32-bit int.
 * Used only for shard bucketing; not security-sensitive.
 */
function hash32(input: string): number {
  let h = 2166136261 >>> 0; // FNV-1a offset basis
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/**
 * Build a sharded channel name. Stable per (topic, subscriberId) pair.
 *
 * @example
 *   shardedChannel("wall:global", userId)              // → "wall:global:s3"
 *   shardedChannel("stream:abc", userId, { shards: 16 })
 */
export function shardedChannel(
  topic: string,
  subscriberId: string | null | undefined,
  opts: { shards?: number } = {}
): string {
  const shards = Math.max(1, opts.shards ?? DEFAULT_SHARDS);
  const key = subscriberId ?? "anon";
  const bucket = hash32(key) % shards;
  return `${topic}:s${bucket}`;
}

/**
 * For publishers that need to broadcast to ALL shards of a topic
 * (e.g. server-side via Edge Function), enumerate channel names.
 */
export function allShardChannels(topic: string, shards = DEFAULT_SHARDS): string[] {
  return Array.from({ length: shards }, (_, i) => `${topic}:s${i}`);
}

/**
 * Heuristic: topics that warrant sharding. Extend as new hot paths appear.
 */
const HOT_TOPIC_PREFIXES = [
  "wall:global",
  "leaderboard:",
  "presence:stream:",
  "presence:concert:",
  "presence:megatalent:",
  "presence:brand-battle:",
];

export function shouldShard(topic: string): boolean {
  return HOT_TOPIC_PREFIXES.some((p) => topic.startsWith(p));
}
