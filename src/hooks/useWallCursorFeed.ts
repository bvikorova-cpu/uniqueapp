// useWallCursorFeed — keyset (cursor-based) pagination for the main Wall feed.
//
// Wraps the `get_wall_feed` RPC, which returns posts + reposts + profiles +
// media + original_post in a single round-trip. Mirrors the shape and pattern
// of `useCursorFeed` (loading / done / error / loadMore / reset) but preserves
// the rich payload the Wall UI needs.
//
// Why keyset: OFFSET pagination is O(n) — Postgres has to skip N rows every
// page. Keyset is O(log n) via the `idx_posts_feed_keyset` index. At 10k+ CCU
// the difference is orders of magnitude.

import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { tracedRpc } from "@/utils/wallPerf";
import type { FeedItem, Post, Repost } from "@/components/wall/WallPost";

interface State {
  items: FeedItem[];
  loading: boolean;       // initial load
  loadingMore: boolean;   // subsequent pages
  done: boolean;          // no more pages
  error: string | null;
}

const fallbackProfile = (id: string) => ({ id, full_name: null, avatar_url: null });

export function useWallCursorFeed(pageSize = 10) {
  const [state, setState] = useState<State>({
    items: [],
    loading: true,
    loadingMore: false,
    done: false,
    error: null,
  });

  const cursorRef = useRef<string | null>(null);
  const inflight = useRef(false);

  const fetchPage = useCallback(
    async (isLoadMore: boolean) => {
      if (inflight.current) return;
      inflight.current = true;

      setState((s) => ({
        ...s,
        loading: !isLoadMore && s.items.length === 0,
        loadingMore: isLoadMore,
        error: isLoadMore ? s.error : null,
      }));

      const cursor = isLoadMore ? cursorRef.current : null;

      try {
        // One auto-retry on transient errors — matches previous Wall behavior.
        const call = () =>
          tracedRpc("get_wall_feed", () =>
            supabase.rpc("get_wall_feed", { _cursor: cursor, _limit: pageSize }),
          );
        let { data, error } = await call();
        if (error) {
          await new Promise((r) => setTimeout(r, 400));
          ({ data, error } = await call());
        }
        if (error) throw error;

        const payload = (data as any) || { posts: [], reposts: [] };
        const postsData: any[] = payload.posts || [];
        const repostsData: any[] = payload.reposts || [];

        const postsWithProfiles = postsData.map((post: any) => ({
          ...post,
          media: post.media || [],
          profiles: post.profiles || fallbackProfile(post.user_id),
        })) as Post[];

        const repostsWithData = repostsData
          .map((repost: any) => {
            const op = repost.original_post;
            if (!op) return null;
            return {
              ...repost,
              profiles: repost.profiles || fallbackProfile(repost.user_id),
              original_post: {
                ...op,
                media: op.media || [],
                profiles: op.profiles || fallbackProfile(op.user_id),
              },
            };
          })
          .filter(Boolean) as Repost[];

        const newItems: FeedItem[] = [
          ...postsWithProfiles.map((p) => ({ type: "post" as const, data: p })),
          ...repostsWithData.map((r) => ({ type: "repost" as const, data: r })),
        ].sort(
          (a, b) =>
            new Date(b.data.created_at).getTime() -
            new Date(a.data.created_at).getTime(),
        );

        const totalRows = postsData.length + repostsData.length;
        const done = totalRows < pageSize;

        if (newItems.length > 0) {
          cursorRef.current = newItems[newItems.length - 1].data.created_at;
        }

        setState((s) => {
          const merged = isLoadMore ? [...s.items, ...newItems] : newItems;
          const seen = new Set<string>();
          const deduped = merged.filter((it) => {
            const k = `${it.type}-${it.data.id}`;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
          return {
            items: deduped,
            loading: false,
            loadingMore: false,
            done,
            error: null,
          };
        });
      } catch (e) {
        setState((s) => ({
          ...s,
          loading: false,
          loadingMore: false,
          error: e instanceof Error ? e.message : "Failed to load posts",
        }));
      } finally {
        inflight.current = false;
      }
    },
    [pageSize],
  );

  const loadMore = useCallback(() => {
    if (state.done) return;
    void fetchPage(true);
  }, [fetchPage, state.done]);

  const reset = useCallback(() => {
    cursorRef.current = null;
    setState((s) => ({ ...s, done: false }));
    void fetchPage(false);
  }, [fetchPage]);

  return {
    items: state.items,
    loading: state.loading,
    loadingMore: state.loadingMore,
    hasMore: !state.done,
    error: state.error,
    loadMore,
    reset,
    isInflight: () => inflight.current,
  };
}
