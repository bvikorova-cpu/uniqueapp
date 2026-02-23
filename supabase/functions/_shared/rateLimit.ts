/**
 * Server-side Rate Limiting Module
 * Uses Supabase database for distributed rate limiting across all Edge functions
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface RateLimitConfig {
  action: string;
  maxRequests: number;
  windowMinutes: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset_at: string;
  current_count: number;
}

// Default rate limit configurations for different actions
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  checkout: { action: 'checkout', maxRequests: 10, windowMinutes: 5 },
  subscription: { action: 'subscription', maxRequests: 5, windowMinutes: 5 },
  payment: { action: 'payment', maxRequests: 10, windowMinutes: 5 },
  ai_generation: { action: 'ai_generation', maxRequests: 20, windowMinutes: 5 },
  ai_chat: { action: 'ai_chat', maxRequests: 50, windowMinutes: 5 },
  image_generation: { action: 'image_generation', maxRequests: 10, windowMinutes: 5 },
  api_call: { action: 'api_call', maxRequests: 100, windowMinutes: 1 },
  search: { action: 'search', maxRequests: 30, windowMinutes: 1 },
  login: { action: 'login', maxRequests: 5, windowMinutes: 15 },
  signup: { action: 'signup', maxRequests: 3, windowMinutes: 60 },
  password_reset: { action: 'password_reset', maxRequests: 3, windowMinutes: 60 },
  upload: { action: 'upload', maxRequests: 20, windowMinutes: 5 },
  post_create: { action: 'post_create', maxRequests: 30, windowMinutes: 5 },
  file_upload: { action: 'file_upload', maxRequests: 50, windowMinutes: 60 },
  message_send: { action: 'message_send', maxRequests: 100, windowMinutes: 60 },
};

/**
 * Get identifier from request (user ID or IP)
 */
export function getIdentifier(req: Request, userId?: string): string {
  if (userId) return userId;
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  return cfConnectingIp || realIp || forwardedFor?.split(',')[0]?.trim() || 'unknown';
}

/**
 * Check rate limit using Supabase database function
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return { allowed: true, remaining: 999, reset_at: new Date().toISOString(), current_count: 0 };
  }
  
  const windowSeconds = config.windowMinutes * 60;
  const resetAt = new Date(Date.now() + windowSeconds * 1000).toISOString();
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_action_type: config.action,
      p_max_requests: config.maxRequests,
      p_window_seconds: windowSeconds,
    });
    
    if (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true, remaining: 999, reset_at: resetAt, current_count: 0 };
    }
    
    const allowed = data === true;
    return {
      allowed,
      remaining: allowed ? config.maxRequests - 1 : 0,
      reset_at: resetAt,
      current_count: allowed ? 1 : config.maxRequests,
    };
  } catch (err) {
    console.error('Rate limit exception:', err);
    return { allowed: true, remaining: 999, reset_at: resetAt, current_count: 0 };
  }
}

/**
 * Create rate limit exceeded response
 */
export function rateLimitExceededResponse(
  result: RateLimitResult,
  corsHeaders: Record<string, string>
): Response {
  const resetDate = new Date(result.reset_at);
  const retryAfter = Math.ceil((resetDate.getTime() - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retry_after: retryAfter,
      reset_at: result.reset_at,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      },
    }
  );
}

/**
 * Add rate limit headers to successful response
 */
export function addRateLimitHeaders(
  headers: Record<string, string>,
  result: RateLimitResult,
  config: RateLimitConfig
): Record<string, string> {
  return {
    ...headers,
    'X-RateLimit-Limit': String(config.maxRequests),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': result.reset_at,
  };
}

/**
 * Middleware-style rate limit check
 * Returns null if allowed, or a Response if rate limited
 */
export async function withRateLimit(
  req: Request,
  config: RateLimitConfig,
  corsHeaders: Record<string, string>,
  userId?: string
): Promise<Response | null> {
  const identifier = getIdentifier(req, userId);
  const result = await checkRateLimit(identifier, config);
  
  if (!result.allowed) {
    console.warn(`Rate limit exceeded for ${identifier} on action ${config.action}`);
    return rateLimitExceededResponse(result, corsHeaders);
  }
  
  return null;
}

export default {
  checkRateLimit,
  withRateLimit,
  rateLimitExceededResponse,
  addRateLimitHeaders,
  getIdentifier,
  RATE_LIMITS,
};
