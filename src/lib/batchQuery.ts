import { supabase } from "@/integrations/supabase/client";

/**
 * Tiny DataLoader for Supabase reads keyed by a single column.
 *
 * Feed pages used to fire one request per post (reactions, gifts, follow state),
 * which produced 100+ parallel REST calls and made the Wall feel slow.
 * This collects all ids requested inside the same tick and issues ONE
 * `.in(column, ids)` query, then hands each caller its own slice.
 *
 * Results are cached for `ttlMs` so re-mounting cards (virtualised lists) does
 * not re-fetch immediately. Data itself is always real DB data.
 */
type Row = Record<string, any>;

interface LoaderOptions {
  table: string;
  column: string;
  select: string;
  /** Extra equality filters applied to every batch. */
  eq?: Record<string, string>;
  ttlMs?: number;
  /** Max ids per REST call (URL length safety). */
  chunkSize?: number;
}

interface Loader<T extends Row> {
  load: (id: string) => Promise<T[]>;
  invalidate: (id?: string) => void;
}

export function createBatchLoader<T extends Row = Row>(opts: LoaderOptions): Loader<T> {
  const { table, column, select, eq, ttlMs = 30_000, chunkSize = 60 } = opts;

  const cache = new Map<string, { at: number; rows: T[] }>();
  const inflight = new Map<string, Promise<T[]>>();
  let pending: string[] = [];
  let pendingResolvers: Array<{ id: string; resolve: (rows: T[]) => void }> = [];
  let scheduled = false;

  const runBatch = async () => {
    const ids = Array.from(new Set(pending));
    const resolvers = pendingResolvers;
    pending = [];
    pendingResolvers = [];
    scheduled = false;

    const grouped = new Map<string, T[]>();
    ids.forEach((id) => grouped.set(id, []));

    try {
      for (let i = 0; i < ids.length; i += chunkSize) {
        const chunk = ids.slice(i, i + chunkSize);
        let q = (supabase as any).from(table).select(select).in(column, chunk);
        if (eq) {
          Object.entries(eq).forEach(([k, v]) => {
            q = q.eq(k, v);
          });
        }
        const { data } = await q;
        ((data ?? []) as T[]).forEach((row) => {
          const key = String(row[column]);
          const bucket = grouped.get(key);
          if (bucket) bucket.push(row);
        });
      }
    } catch {
      // Leave buckets empty on failure; callers render an empty state.
    }

    const now = Date.now();
    grouped.forEach((rows, id) => {
      cache.set(id, { at: now, rows });
      inflight.delete(id);
    });
    resolvers.forEach(({ id, resolve }) => resolve(grouped.get(id) ?? []));
  };

  return {
    load(id: string) {
      if (!id) return Promise.resolve([]);
      const hit = cache.get(id);
      if (hit && Date.now() - hit.at < ttlMs) return Promise.resolve(hit.rows);

      const running = inflight.get(id);
      if (running) return running;

      const promise = new Promise<T[]>((resolve) => {
        pending.push(id);
        pendingResolvers.push({ id, resolve });
        if (!scheduled) {
          scheduled = true;
          // Coalesce every id requested during this render pass.
          setTimeout(runBatch, 16);
        }
      });
      inflight.set(id, promise);
      return promise;
    },
    invalidate(id?: string) {
      if (id) cache.delete(id);
      else cache.clear();
    } };
}

/** Reactions of many posts, batched into one request. */
export const postReactionsLoader = createBatchLoader({
  table: "post_reactions",
  column: "post_id",
  select: "*" });

/** Gifts received by many posts, batched into one request. */
export const postGiftsLoader = createBatchLoader({
  table: "gift_transactions",
  column: "post_id",
  select: "post_id, gift_id, created_at, gift_catalog(slug, name, animation, image_url)" });

/** "Am I following X?" for many users at once (one loader per signed-in user). */
const followLoaders = new Map<string, Loader<Row>>();
export function getFollowLoader(followerId: string): Loader<Row> {
  let loader = followLoaders.get(followerId);
  if (!loader) {
    loader = createBatchLoader({
      table: "user_follows",
      column: "following_id",
      select: "following_id",
      eq: { follower_id: followerId } });
    followLoaders.set(followerId, loader);
  }
  return loader;
}

/** "Did I save post X?" for many posts at once (one loader per signed-in user). */
const savedPostLoaders = new Map<string, Loader<Row>>();
export function getSavedPostLoader(userId: string): Loader<Row> {
  let loader = savedPostLoaders.get(userId);
  if (!loader) {
    loader = createBatchLoader({
      table: "saved_posts",
      column: "post_id",
      select: "post_id",
      eq: { user_id: userId } });
    savedPostLoaders.set(userId, loader);
  }
  return loader;
}
