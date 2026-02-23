/**
 * Database-backed rate limiting utilities for edge functions
 * Uses Supabase check_rate_limit RPC function for distributed rate limiting
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
  resetAt: Date;
  currentCount: number;
}

// Default rate limit configurations
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  checkout: { action: "checkout", maxRequests: 10, windowMinutes: 60 },
  ai_generation: { action: "ai_generation", maxRequests: 20, windowMinutes: 60 },
  api_call: { action: "api_call", maxRequests: 100, windowMinutes: 60 },
  login: { action: "login", maxRequests: 5, windowMinutes: 15 },
  signup: { action: "signup", maxRequests: 3, windowMinutes: 60 },
  password_reset: { action: "password_reset", maxRequests: 3, windowMinutes: 60 },
  file_upload: { action: "file_upload", maxRequests: 50, windowMinutes: 60 },
  message_send: { action: "message_send", maxRequests: 100, windowMinutes: 60 },
};

/**
 * Get identifier from request (user ID or IP)
 */
export function getIdentifier(req: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const cfConnectingIp = req.headers.get("cf-connecting-ip");

  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || cfConnectingIp || "unknown";
  return `ip:${ip}`;
}

/**
 * Check rate limit using database RPC function
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_identifier: identifier,
      p_action_type: config.action,
      p_max_requests: config.maxRequests,
      p_window_seconds: config.windowMinutes * 60,
    });

    if (error) {
      console.error("Rate limit check error:", error);
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetAt: new Date(Date.now() + config.windowMinutes * 60 * 1000),
        currentCount: 0,
      };
    }

    const result = data?.[0] || data;

    return {
      allowed: result?.allowed ?? true,
      remaining: result?.remaining ?? config.maxRequests,
      resetAt: new Date(result?.reset_at || Date.now() + config.windowMinutes * 60 * 1000),
      currentCount: result?.current_count ?? 0,
    };
  } catch (err) {
    console.error("Rate limit error:", err);
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: new Date(Date.now() + config.windowMinutes * 60 * 1000),
      currentCount: 0,
    };
  }
}

/**
 * Rate limit exceeded response
 */
export function rateLimitExceededResponse(
  result: RateLimitResult,
  corsHeaders: Record<string, string>
): Response {
  const retryAfter = Math.ceil((result.resetAt.getTime() - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter,
      resetAt: result.resetAt.toISOString(),
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Limit": result.currentCount.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": Math.ceil(result.resetAt.getTime() / 1000).toString(),
      },
    }
  );
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  headers: Record<string, string>,
  result: RateLimitResult,
  config: RateLimitConfig
): Record<string, string> {
  return {
    ...headers,
    "X-RateLimit-Limit": config.maxRequests.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(result.resetAt.getTime() / 1000).toString(),
  };
}

/**
 * Middleware-style rate limit check
 * Returns Response if rate limit exceeded, null if allowed
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
    return rateLimitExceededResponse(result, corsHeaders);
  }

  return null;
}
