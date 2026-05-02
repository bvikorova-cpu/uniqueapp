/**
 * Standard CORS headers for edge functions
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Returns a CORS preflight response
 */
export function handleCors(): Response {
  return new Response(null, { headers: corsHeaders });
}

/**
 * Returns a successful JSON response with CORS headers
 */
export function successResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

/**
 * Returns an error JSON response with CORS headers
 */
export function errorResponse(error: unknown, status = 500): Response {
  const message = error instanceof Error ? error.message : String(error);
  // Auto-detect auth errors and surface a clean 401 instead of a generic 500.
  // Keeps button audits and clients from seeing crashes when no JWT is sent.
  let finalStatus = status;
  if (status === 500) {
    const lower = message.toLowerCase();
    if (
      lower.includes("authorization header") ||
      lower.includes("bearer token") ||
      lower.includes("not authenticated") ||
      lower.includes("unauthorized") ||
      lower.includes("invalid jwt") ||
      lower.includes("jwt expired")
    ) {
      finalStatus = 401;
    } else if (
      lower.includes("missing ") ||
      lower.includes("invalid ") ||
      lower.includes("required")
    ) {
      finalStatus = 400;
    }
  }
  return new Response(JSON.stringify({ error: message }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: finalStatus,
  });
}

/**
 * Returns a 401 Unauthorized response
 */
export function unauthorizedResponse(message = "Unauthorized"): Response {
  return errorResponse(message, 401);
}

/**
 * Returns a 400 Bad Request response
 */
export function badRequestResponse(message: string): Response {
  return errorResponse(message, 400);
}

/**
 * Returns a 404 Not Found response
 */
export function notFoundResponse(message = "Not found"): Response {
  return errorResponse(message, 404);
}

/**
 * Returns a 403 Forbidden response
 */
export function forbiddenResponse(message = "Forbidden"): Response {
  return errorResponse(message, 403);
}

/**
 * Returns a 429 Rate Limit Exceeded response
 */
export function rateLimitResponse(retryAfterSeconds = 60): Response {
  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: retryAfterSeconds,
    }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSeconds),
      },
      status: 429,
    }
  );
}

/**
 * Returns a validation error response
 */
export function validationErrorResponse(
  errors: Array<{ field: string; message: string }>
): Response {
  return new Response(
    JSON.stringify({
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details: errors,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    }
  );
}

/**
 * Streaming response for AI endpoints
 */
export function streamResponse(
  body: ReadableStream,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      ...corsHeaders,
      ...extraHeaders,
    },
  });
}

/**
 * Wraps a handler with automatic CORS handling
 */
export function withCors(handler: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
      return handleCors();
    }
    return handler(req);
  };
}

/**
 * Wraps a handler with automatic error handling
 */
export function withErrorHandling(
  handler: (req: Request) => Promise<Response>,
  logPrefix?: string
) {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (error) {
      if (logPrefix) {
        console.error(`[${logPrefix}] ERROR:`, error);
      }
      return errorResponse(error);
    }
  };
}

/**
 * Combines CORS and error handling
 */
export function createHandler(
  handler: (req: Request) => Promise<Response>,
  logPrefix?: string
) {
  return withCors(withErrorHandling(handler, logPrefix));
}
