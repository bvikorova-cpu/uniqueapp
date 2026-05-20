// Module-level profile cache shared across Messenger mounts/conversations.
// Avoids redundant network round-trips and dedupes concurrent fetches.

import { supabase } from "@/integrations/supabase/client";

export type CachedProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

const cache = new Map<string, CachedProfile>();
const inflight = new Map<string, Promise<CachedProfile | null>>();

export const getCachedProfile = (id: string): CachedProfile | undefined =>
  cache.get(id);

export const primeProfileCache = (profiles: CachedProfile[]) => {
  for (const p of profiles) {
    if (p?.id) cache.set(p.id, p);
  }
};

export const fetchProfileCached = async (
  userId: string
): Promise<CachedProfile | null> => {
  if (cache.has(userId)) return cache.get(userId)!;
  if (inflight.has(userId)) return inflight.get(userId)!;

  const p = (async () => {
    const { data, error } = await supabase
      .from("public_profiles" as any)
      .select("id, full_name, avatar_url")
      .eq("id", userId)
      .single();
    if (error || !data) return null;
    const row = data as unknown as CachedProfile;
    cache.set(userId, row);
    return row;
  })();

  inflight.set(userId, p);
  try {
    return await p;
  } finally {
    inflight.delete(userId);
  }
};

export const fetchProfilesCachedBatch = async (
  ids: string[]
): Promise<Map<string, CachedProfile>> => {
  const result = new Map<string, CachedProfile>();
  const missing: string[] = [];
  for (const id of ids) {
    const c = cache.get(id);
    if (c) result.set(id, c);
    else missing.push(id);
  }
  if (missing.length === 0) return result;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", missing);

  (data || []).forEach((p) => {
    cache.set(p.id, p);
    result.set(p.id, p);
  });
  return result;
};
