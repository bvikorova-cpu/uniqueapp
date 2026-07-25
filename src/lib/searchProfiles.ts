import { supabase } from "@/integrations/supabase/client";

export interface PublicProfileResult {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
}

/**
 * Diacritic-insensitive, token-order-independent profile search.
 * Uses the `search_public_profiles` SECURITY DEFINER RPC that normalizes
 * accents via `unaccent` and matches all whitespace-separated tokens in
 * any order across full_name and username.
 *
 * Use this everywhere in the platform when searching for users.
 */
export async function searchProfiles(
  query: string,
  opts: { limit?: number; restrictToIds?: string[] } = {}
): Promise<PublicProfileResult[]> {
  const q = (query || "").trim();
  if (q.length < 1) return [];

  const { data, error } = await supabase.rpc("search_public_profiles" as any, {
    _query: q,
  });
  if (error) {
    console.error("searchProfiles error:", error);
    return [];
  }

  let rows = (data || []) as PublicProfileResult[];
  if (opts.restrictToIds && opts.restrictToIds.length > 0) {
    const allow = new Set(opts.restrictToIds);
    rows = rows.filter((r) => allow.has(r.id));
  }
  if (opts.limit) rows = rows.slice(0, opts.limit);
  return rows;
}
