import { supabase } from "@/integrations/supabase/client";

/**
 * The Wall feed RPC used to fire only after the (large) Wall route chunk had
 * mounted, several seconds into page load, while dozens of secondary widget
 * queries went first. We kick the first page off as early as the app boots so
 * the posts are already in flight (or done) by the time the feed renders.
 */
type FeedResult = Awaited<ReturnType<typeof runFetch>>;

const MAX_AGE_MS = 15_000;
let cached: { at: number; limit: number; promise: Promise<FeedResult> } | null = null;

function runFetch(limit: number) {
  return (async () => {
    // Local (no network) session restore so the RPC runs as the logged-in user.
    await supabase.auth.getSession();
    return supabase.rpc("get_wall_feed", { _cursor: null, _limit: limit });
  })();
}

export function prefetchWallFeed(limit = 10) {
  if (cached && cached.limit === limit && Date.now() - cached.at < MAX_AGE_MS) {
    return cached.promise;
  }
  const promise = runFetch(limit);
  promise.catch(() => { cached = null; });
  cached = { at: Date.now(), limit, promise };
  return promise;
}

/** Consume the prefetched first page once; returns null when stale/absent. */
export function takeWallFeedPrefetch(limit = 10) {
  if (cached && cached.limit === limit && Date.now() - cached.at < MAX_AGE_MS) {
    const { promise } = cached;
    cached = null;
    return promise;
  }
  cached = null;
  return null;
}
