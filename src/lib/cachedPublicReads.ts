// Thin client for the edge-cached public reads.
// Prefer these on public landing pages (Wall preview, homepage leaderboard)
// so first-paint is served from CDN cache, not from Postgres.
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export interface CachedFeedRow {
  post_id: string;
  author_id: string;
  content: string | null;
  created_at: string;
  author_username: string | null;
  author_full_name: string | null;
  author_avatar_url: string | null;
}

export interface CachedLeaderboardRow {
  user_id: string;
  weekly_xp: number;
  view_count: number;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

async function fetchEdge<T>(path: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/public-feed${path}`);
  if (!res.ok) throw new Error(`public-feed ${res.status}`);
  const json = await res.json();
  return (json?.data ?? []) as T[];
}

export async function getCachedWallFeed(limit = 50, offset = 0): Promise<CachedFeedRow[]> {
  try {
    return await fetchEdge<CachedFeedRow>(`?kind=feed&limit=${limit}&offset=${offset}`);
  } catch {
    // Fallback to direct RPC if the edge is unreachable.
    const { data } = await supabase.rpc("get_cached_wall_feed", {
      _limit: limit,
      _offset: offset,
    });
    return (data as CachedFeedRow[]) ?? [];
  }
}

export async function getCachedWeeklyXpTop(limit = 10): Promise<CachedLeaderboardRow[]> {
  try {
    return await fetchEdge<CachedLeaderboardRow>(`?kind=leaderboard&limit=${limit}`);
  } catch {
    const { data } = await supabase.rpc("get_cached_weekly_xp_top", { _limit: limit });
    return (data as CachedLeaderboardRow[]) ?? [];
  }
}
