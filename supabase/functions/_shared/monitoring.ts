// Monitoring and metrics utilities for edge functions

interface MetricData {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp: number;
}

interface RequestMetrics {
  functionName: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  userId?: string;
  error?: string;
}

/**
 * Log a metric in a structured format for easy parsing
 */
export function logMetric(metric: MetricData): void { console.log(JSON.stringify({
    type: 'metric',
    ...metric,
    timestamp: metric.timestamp || Date.now() }));
}

/**
 * Log request metrics for observability
 */
export function logRequestMetrics(metrics: RequestMetrics): void { console.log(JSON.stringify({
    type: 'request_metrics',
    ...metrics,
    timestamp: Date.now() }));
}

/**
 * Create a request context for tracking
 */
export function createRequestContext(req: Request, functionName: string) { const startTime = performance.now();
  const url = new URL(req.url);
  const requestId = crypto.randomUUID();

  console.log(JSON.stringify({
    type: 'request_start',
    requestId,
    functionName,
    method: req.method,
    path: url.pathname,
    timestamp: Date.now() }));

  return { requestId,
    functionName,
    method: req.method,
    path: url.pathname,
    startTime,

    /**
     * Complete the request and log metrics
     */
    complete(statusCode: number, userId?: string, error?: string): void {
      const durationMs = Math.round(performance.now() - startTime);
      
      logRequestMetrics({
        functionName,
        method: req.method,
        path: url.pathname,
        statusCode,
        durationMs,
        userId,
        error });

      console.log(JSON.stringify({ type: 'request_complete',
        requestId,
        functionName,
        statusCode,
        durationMs,
        timestamp: Date.now() }));
    },

    /**
     * Log a span within the request
     */
    span(name: string): { end: () => void } { const spanStart = performance.now();
      
      return {
        end: () => {
          const spanDuration = Math.round(performance.now() - spanStart);
          console.log(JSON.stringify({
            type: 'span',
            requestId,
            name,
            durationMs: spanDuration,
            timestamp: Date.now() }));
        } };
    } };
}

/**
 * Error tracking with structured logging
 */
export function trackError(
  error: unknown,
  context: {
    functionName: string;
    requestId?: string;
    userId?: string;
    metadata?: Record<string, unknown>;
  }
): void { const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error(JSON.stringify({
    type: 'error',
    message: errorMessage,
    stack: errorStack,
    ...context,
    timestamp: Date.now() }));
}

/**
 * Performance tracking decorator-like function
 */
export async function trackPerformance<T>(
  name: string,
  fn: () => Promise<T>,
  requestId?: string
): Promise<T> { const start = performance.now();
  
  try {
    const result = await fn();
    const duration = Math.round(performance.now() - start);
    
    console.log(JSON.stringify({
      type: 'performance',
      name,
      durationMs: duration,
      success: true,
      requestId,
      timestamp: Date.now() }));
    
    return result;
  } catch (error) { const duration = Math.round(performance.now() - start);
    
    console.log(JSON.stringify({
      type: 'performance',
      name,
      durationMs: duration,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      requestId,
      timestamp: Date.now() }));
    
    throw error;
  }
}

/**
 * Health check response builder
 */
export function buildHealthResponse(checks: Record<string, boolean>): Response { const allHealthy = Object.values(checks).every(Boolean);
  
  return new Response(
    JSON.stringify({
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks,
      timestamp: Date.now() }),
    {
      status: allHealthy ? 200 : 503,
      headers: { 'Content-Type': 'application/json' } }
  );
}
