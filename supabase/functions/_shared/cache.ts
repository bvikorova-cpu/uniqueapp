/**
 * Caching utilities for Edge Functions
 * Supports both in-memory cache and persistent database cache
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============= In-Memory Cache =============
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class EdgeCache { private cache = new Map<string, CacheEntry<unknown>>();
  
  set<T>(key: string, data: T, ttlSeconds: number = 60): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000 });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// Singleton instance for in-memory cache
export const edgeCache = new EdgeCache();

// ============= Persistent Database Cache =============

/**
 * Get value from persistent cache
 */
export async function dbCacheGet<T>(key: string): Promise<T | null> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[Cache] Missing Supabase credentials');
    return null;
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { data, error } = await supabase.rpc('cache_get', { p_key: key });
    
    if (error) {
      console.error('[Cache] DB get error:', error);
      return null;
    }
    
    return data as T;
  } catch (err) {
    console.error('[Cache] DB get exception:', err);
    return null;
  }
}

/**
 * Set value in persistent cache
 */
export async function dbCacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number = 300,
  tags: string[] = []
): Promise<boolean> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[Cache] Missing Supabase credentials');
    return false;
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { error } = await supabase.rpc('cache_set', { p_key: key,
      p_value: value,
      p_ttl_seconds: ttlSeconds,
      p_tags: tags });
    
    if (error) {
      console.error('[Cache] DB set error:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('[Cache] DB set exception:', err);
    return false;
  }
}

/**
 * Invalidate cache entries by tag
 */
export async function dbCacheInvalidateByTag(tag: string): Promise<number> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return 0;
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { data, error } = await supabase.rpc('cache_invalidate_by_tag', { p_tag: tag });
    
    if (error) {
      console.error('[Cache] Invalidate error:', error);
      return 0;
    }
    
    return data || 0;
  } catch (err) {
    console.error('[Cache] Invalidate exception:', err);
    return 0;
  }
}

// ============= Response Caching =============

/**
 * Cached fetch with in-memory fallback to DB
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttlSeconds?: number;
    tags?: string[];
    useDbCache?: boolean;
  } = {}
): Promise<T> {
  const { ttlSeconds = 300, tags = [], useDbCache = false } = options;
  
  // Try in-memory cache first
  const memCached = edgeCache.get<T>(key);
  if (memCached !== null) {
    console.log(`[Cache] Memory HIT: ${key}`);
    return memCached;
  }
  
  // Try DB cache if enabled
  if (useDbCache) {
    const dbCached = await dbCacheGet<T>(key);
    if (dbCached !== null) {
      console.log(`[Cache] DB HIT: ${key}`);
      // Warm up in-memory cache
      edgeCache.set(key, dbCached, ttlSeconds);
      return dbCached;
    }
  }
  
  console.log(`[Cache] MISS: ${key}`);
  const data = await fetcher();
  
  // Store in memory
  edgeCache.set(key, data, ttlSeconds);
  
  // Store in DB if enabled
  if (useDbCache) {
    await dbCacheSet(key, data, ttlSeconds, tags);
  }
  
  return data;
}

// ============= HTTP Cache Headers =============

/**
 * Get cache control headers for HTTP responses
 */
export function getCacheHeaders(
  maxAgeSeconds: number = 300,
  options: {
    isPublic?: boolean;
    staleWhileRevalidate?: number;
    staleIfError?: number;
  } = {}
): Record<string, string> {
  const { isPublic = true, staleWhileRevalidate = 60, staleIfError = 86400 } = options;
  
  const directives = [
    isPublic ? 'public' : 'private',
    `max-age=${maxAgeSeconds}`,
    `s-maxage=${maxAgeSeconds}`,
    `stale-while-revalidate=${staleWhileRevalidate}`,
    `stale-if-error=${staleIfError}`,
  ];
  
  return {
    'Cache-Control': directives.join(', '),
    'CDN-Cache-Control': `max-age=${maxAgeSeconds}`,
    'Vercel-CDN-Cache-Control': `max-age=${maxAgeSeconds}` };
}

/**
 * Get no-cache headers
 */
export function getNoCacheHeaders(): Record<string, string> { return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0' };
}

// ============= Cache Key Generators =============

/**
 * Generate cache key for user-specific data
 */
export function userCacheKey(userId: string, resource: string, ...args: string[]): string {
  return `user:${userId}:${resource}:${args.join(':')}`;
}

/**
 * Generate cache key for global data
 */
export function globalCacheKey(resource: string, ...args: string[]): string {
  return `global:${resource}:${args.join(':')}`;
}

export default { edgeCache,
  dbCacheGet,
  dbCacheSet,
  dbCacheInvalidateByTag,
  cachedFetch,
  getCacheHeaders,
  getNoCacheHeaders,
  userCacheKey,
  globalCacheKey };
