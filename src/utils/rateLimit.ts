// Client-side rate limiting utilities

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitState {
  requests: number;
  windowStart: number;
}

const rateLimitStates = new Map<string, RateLimitState>();

/**
 * Check if an action should be rate limited
 */
export function checkRateLimit(key: string, config: RateLimitConfig): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  const now = Date.now();
  const state = rateLimitStates.get(key);
  
  if (!state || now - state.windowStart >= config.windowMs) {
    // New window
    rateLimitStates.set(key, { requests: 1, windowStart: now });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }
  
  if (state.requests >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: config.windowMs - (now - state.windowStart),
    };
  }
  
  state.requests++;
  rateLimitStates.set(key, state);
  
  return {
    allowed: true,
    remaining: config.maxRequests - state.requests,
    resetIn: config.windowMs - (now - state.windowStart),
  };
}

/**
 * Rate limiter for API calls
 */
export function createRateLimiter(config: RateLimitConfig) {
  return {
    check: (key: string) => checkRateLimit(key, config),
    reset: (key: string) => rateLimitStates.delete(key),
    clear: () => rateLimitStates.clear(),
  };
}

/**
 * Preset rate limiters
 */
export const rateLimiters = {
  // For authentication attempts
  auth: createRateLimiter({ maxRequests: 5, windowMs: 60 * 1000 }), // 5 per minute
  
  // For API calls
  api: createRateLimiter({ maxRequests: 100, windowMs: 60 * 1000 }), // 100 per minute
  
  // For form submissions
  form: createRateLimiter({ maxRequests: 10, windowMs: 60 * 1000 }), // 10 per minute
  
  // For search
  search: createRateLimiter({ maxRequests: 30, windowMs: 60 * 1000 }), // 30 per minute
  
  // For file uploads
  upload: createRateLimiter({ maxRequests: 20, windowMs: 60 * 1000 }), // 20 per minute
  
  // For comments/posts
  content: createRateLimiter({ maxRequests: 15, windowMs: 60 * 1000 }), // 15 per minute
};

/**
 * Debounce function with rate limiting
 */
export function debounceWithRateLimit<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number,
  rateLimitKey: string,
  config: RateLimitConfig
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      const { allowed } = checkRateLimit(rateLimitKey, config);
      if (allowed) {
        fn(...args);
      }
    }, delayMs);
  };
}

/**
 * Throttle with rate limiting
 */
export function throttleWithRateLimit<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number,
  rateLimitKey: string,
  config: RateLimitConfig
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delayMs) {
      const { allowed } = checkRateLimit(rateLimitKey, config);
      if (allowed) {
        lastCall = now;
        fn(...args);
      }
    }
  };
}

export default {
  checkRateLimit,
  createRateLimiter,
  rateLimiters,
  debounceWithRateLimit,
  throttleWithRateLimit,
};
