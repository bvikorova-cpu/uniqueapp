// Simple in-memory cache for edge functions
// Note: Edge functions are stateless, so this cache only works within a single request
// For persistent caching, use Supabase KV or external Redis

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class EdgeCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  
  set<T>(key: string, data: T, ttlSeconds: number = 60): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
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

// Singleton instance
export const edgeCache = new EdgeCache();

// Response caching helper for expensive operations
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const cached = edgeCache.get<T>(key);
  
  if (cached !== null) {
    console.log(`[Cache] HIT: ${key}`);
    return cached;
  }
  
  console.log(`[Cache] MISS: ${key}`);
  const data = await fetcher();
  edgeCache.set(key, data, ttlSeconds);
  return data;
}

// Headers for HTTP cache control
export function getCacheHeaders(maxAgeSeconds: number = 300, isPublic: boolean = true): Record<string, string> {
  return {
    'Cache-Control': `${isPublic ? 'public' : 'private'}, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}`,
    'CDN-Cache-Control': `max-age=${maxAgeSeconds}`,
    'Vercel-CDN-Cache-Control': `max-age=${maxAgeSeconds}`,
  };
}
