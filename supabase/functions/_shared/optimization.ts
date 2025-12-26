/**
 * Performance optimization utilities for Edge Functions
 * Helps minimize latency and improve response times
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============= Lazy Initialization =============

// Pre-initialized clients (module-level for cold start optimization)
let _supabaseAdmin: ReturnType<typeof createClient> | null = null;
let _initTime = 0;

/**
 * Get lazily initialized Supabase admin client
 * Reuses the same client across requests in the same container
 */
export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _initTime = performance.now();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          'x-my-custom-header': 'edge-function',
        },
      },
    });
    
    console.log(`[Optimization] Supabase client initialized in ${Math.round(performance.now() - _initTime)}ms`);
  }
  
  return _supabaseAdmin;
}

// ============= Request Timing =============

export interface RequestTimer {
  elapsed: () => number;
  log: (label: string) => void;
  getMetrics: () => { total: number; labels: Record<string, number> };
}

/**
 * Create a request timer for performance monitoring
 */
export function createRequestTimer(): RequestTimer {
  const start = performance.now();
  const labels: Record<string, number> = {};
  
  return {
    elapsed: () => Math.round(performance.now() - start),
    log: (label: string) => {
      const elapsed = Math.round(performance.now() - start);
      labels[label] = elapsed;
      console.log(`[Timer] ${label}: ${elapsed}ms`);
    },
    getMetrics: () => ({
      total: Math.round(performance.now() - start),
      labels,
    }),
  };
}

// ============= Connection Pooling Helpers =============

/**
 * Execute multiple database queries in parallel
 */
export async function parallelQueries<T extends Record<string, Promise<unknown>>>(
  queries: T
): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
  const keys = Object.keys(queries) as (keyof T)[];
  const promises = keys.map(key => queries[key]);
  const results = await Promise.all(promises);
  
  const output = {} as { [K in keyof T]: Awaited<T[K]> };
  keys.forEach((key, index) => {
    output[key] = results[index] as Awaited<T[keyof T]>;
  });
  
  return output;
}

// ============= Request Deduplication =============

const pendingRequests = new Map<string, Promise<unknown>>();

/**
 * Deduplicate concurrent identical requests
 * Useful for preventing duplicate API calls during high load
 */
export async function deduplicateRequest<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // Check if there's already a pending request for this key
  const pending = pendingRequests.get(key);
  if (pending) {
    console.log(`[Dedup] Reusing pending request: ${key}`);
    return pending as Promise<T>;
  }
  
  // Create new request
  const promise = fetcher().finally(() => {
    // Clean up after request completes
    pendingRequests.delete(key);
  });
  
  pendingRequests.set(key, promise);
  return promise;
}

// ============= Batch Processing =============

/**
 * Process items in batches to avoid overwhelming resources
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: {
    batchSize?: number;
    delayMs?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<R[]> {
  const { batchSize = 10, delayMs = 0, onProgress } = options;
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
    
    if (onProgress) {
      onProgress(results.length, items.length);
    }
    
    if (delayMs > 0 && i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

// ============= Timeout Wrapper =============

/**
 * Wrap a promise with a timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  let timeoutHandle: number;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });
  
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle!);
  }
}

// ============= Graceful Degradation =============

/**
 * Try primary operation, fallback to secondary on failure
 */
export async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  options: {
    primaryTimeout?: number;
    onFallback?: (error: Error) => void;
  } = {}
): Promise<T> {
  const { primaryTimeout = 5000, onFallback } = options;
  
  try {
    return await withTimeout(primary(), primaryTimeout);
  } catch (error) {
    console.warn('[Fallback] Primary failed, using fallback:', error);
    
    if (onFallback && error instanceof Error) {
      onFallback(error);
    }
    
    return fallback();
  }
}

// ============= Response Streaming Helpers =============

/**
 * Create a streaming response for long-running operations
 */
export function createStreamingResponse(
  generator: AsyncGenerator<string>,
  corsHeaders: Record<string, string>
): Response {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      try {
        for await (const chunk of generator) {
          controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        controller.enqueue(encoder.encode(`data: {"error": "${error}"}\n\n`));
      } finally {
        controller.close();
      }
    },
  });
  
  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// ============= Health Check =============

/**
 * Handle health check requests
 * Returns null if not a health check, Response if it is
 */
export function handleHealthCheck(req: Request): Response | null {
  const url = new URL(req.url);
  
  if (url.pathname.endsWith('/health') || url.searchParams.get('health') === 'true') {
    return new Response(
      JSON.stringify({
        status: 'healthy',
        timestamp: Date.now(),
        uptime: performance.now(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  
  return null;
}

export default {
  getSupabaseAdmin,
  createRequestTimer,
  parallelQueries,
  deduplicateRequest,
  processBatch,
  withTimeout,
  withFallback,
  createStreamingResponse,
  handleHealthCheck,
};
