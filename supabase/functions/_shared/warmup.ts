// Cold start optimization utilities for edge functions
// These help reduce cold start latency

// Pre-initialize common dependencies at module level
// This code runs once when the function container starts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Lazy-initialized Supabase client
let _supabaseAdmin: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  
  return _supabaseAdmin;
}

// Warmup handler - call this at the start of your function
export async function warmup(): Promise<void> {
  // Initialize Supabase client early
  getSupabaseAdmin();
  
  // Pre-resolve common DNS
  // This is a no-op but helps with DNS resolution caching
  console.log('[Warmup] Edge function initialized');
}

// Health check endpoint helper
export function handleHealthCheck(req: Request): Response | null {
  const url = new URL(req.url);
  
  if (url.pathname.endsWith('/health') || url.searchParams.get('health') === 'true') {
    return new Response(JSON.stringify({ status: 'healthy', timestamp: Date.now() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  return null;
}

// Request timing helper
export function createRequestTimer() {
  const start = performance.now();
  
  return {
    elapsed: () => Math.round(performance.now() - start),
    log: (label: string) => {
      console.log(`[Timer] ${label}: ${Math.round(performance.now() - start)}ms`);
    },
  };
}
