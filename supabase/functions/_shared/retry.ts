// Retry utilities for resilient API calls in edge functions

interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: unknown) => boolean;
}

const defaultOptions: Required<RetryOptions> = { maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
  retryCondition: () => true };

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const exponentialDelay = options.initialDelayMs * Math.pow(options.backoffMultiplier, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter
  return Math.min(exponentialDelay + jitter, options.maxDelayMs);
}

/**
 * Execute a function with automatic retries
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      const isLastAttempt = attempt === opts.maxRetries;
      const shouldRetry = opts.retryCondition(error);

      if (isLastAttempt || !shouldRetry) {
        console.error(`[Retry] Failed after ${attempt + 1} attempts:`, error);
        throw error;
      }

      const delay = calculateDelay(attempt, opts);
      console.log(`[Retry] Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms`);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Check if an error is retryable (network errors, 5xx responses)
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch failed') || 
        error.message.includes('network') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ETIMEDOUT')) {
      return true;
    }
  }

  // HTTP response errors
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    // Retry on server errors and rate limiting
    return status >= 500 || status === 429;
  }

  return false;
}

/**
 * Retry a fetch request with exponential backoff
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryOptions?: RetryOptions
): Promise<Response> {
  return withRetry(
    async () => {
      const response = await fetch(url, options);
      
      if (!response.ok && (response.status >= 500 || response.status === 429)) {
        throw { status: response.status, statusText: response.statusText };
      }
      
      return response;
    },
    { ...retryOptions,
      retryCondition: isRetryableError }
  );
}

/**
 * Circuit breaker pattern for protecting against cascading failures
 */
interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeoutMs?: number;
}

class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private readonly name: string,
    private readonly options: Required<CircuitBreakerOptions>
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      const timeSinceFailure = Date.now() - this.lastFailureTime;
      
      if (timeSinceFailure >= this.options.resetTimeoutMs) {
        this.state = 'half-open';
        console.log(`[CircuitBreaker:${this.name}] Moving to half-open state`);
      } else {
        throw new Error(`Circuit breaker ${this.name} is open`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === 'half-open') {
      this.state = 'closed';
      console.log(`[CircuitBreaker:${this.name}] Circuit closed`);
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.options.failureThreshold) {
      this.state = 'open';
      console.log(`[CircuitBreaker:${this.name}] Circuit opened after ${this.failures} failures`);
    }
  }

  getState(): string {
    return this.state;
  }
}

// Store circuit breakers by name
const circuitBreakers = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(
  name: string,
  options: CircuitBreakerOptions = {}
): CircuitBreaker { if (!circuitBreakers.has(name)) {
    circuitBreakers.set(
      name,
      new CircuitBreaker(name, {
        failureThreshold: options.failureThreshold ?? 5,
        resetTimeoutMs: options.resetTimeoutMs ?? 30000 })
    );
  }
  return circuitBreakers.get(name)!;
}
