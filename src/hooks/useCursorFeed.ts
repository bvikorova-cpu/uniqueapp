// cursorFeed — keyset (cursor-based) pagination hook pre verejný feed.
//
// Klasický OFFSET pagination je pri 10k+ CCU pomalý (Postgres musí preskočiť
// N riadkov). Keyset používa `WHERE (created_at, id) < (cursor_ts, cursor_id)`,
// čo je O(log n) cez existujúci index `idx_posts_feed_keyset`.

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FeedRow {
  id: string;
  user_id: string;
  content: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
}

interface State {
  rows: FeedRow[];
  loading: boolean;
  done: boolean;
  error: string | null;
}

export function useCursorFeed(pageSize = 20) {
  const [state, setState] = useState<State>({
    rows: [],
    loading: false,
    done: false,
    error: null,
  });
  const cursorRef = useRef<{ ts: string | null; id: string | null }>({
    ts: null,
    id: null,
  });
  const inflight = useRef(false);

  const loadMore = useCallback(async () => {
    if (inflight.current || state.done) return;
    inflight.current = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { data, error } = await supabase.rpc("feed_page_after", {
        cursor_ts: cursorRef.current.ts,
        cursor_id: cursorRef.current.id,
        page_size: pageSize,
      });
      if (error) throw error;
      const rows = (data ?? []) as FeedRow[];
      if (rows.length > 0) {
        const last = rows[rows.length - 1];
        cursorRef.current = { ts: last.created_at, id: last.id };
      }
      setState((s) => ({
        rows: [...s.rows, ...rows],
        loading: false,
        done: rows.length < pageSize,
        error: null,
      }));
    } catch (e) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e instanceof Error ? e.message : "load failed",
      }));
    } finally {
      inflight.current = false;
    }
  }, [pageSize, state.done]);

  const reset = useCallback(() => {
    cursorRef.current = { ts: null, id: null };
    setState({ rows: [], loading: false, done: false, error: null });
  }, []);

  useEffect(() => {
    void loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, loadMore, reset };
}
