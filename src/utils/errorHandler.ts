/**
 * Utility function to convert technical error messages to user-friendly messages
 */

const TECHNICAL_ERROR_PATTERNS: [RegExp, string][] = [
  [/FunctionsHttpError/i, "Service temporarily unavailable. Please try again."],
  [/edge.*function.*returned/i, "Service temporarily unavailable. Please try again."],
  [/Failed to fetch/i, "Network error. Please check your connection."],
  [/Network.*error/i, "Network error. Please check your connection."],
  [/timeout/i, "Request timed out. Please try again."],
  [/CORS/i, "Service configuration error. Please try again later."],
  [/401|unauthorized/i, "Please sign in to continue."],
  [/403|forbidden/i, "You don't have permission for this action."],
  [/404|not found/i, "The requested resource was not found."],
  [/500|internal server/i, "Server error. Please try again later."],
  [/502|bad gateway/i, "Service temporarily unavailable. Please try again."],
  [/503|service unavailable/i, "Service temporarily unavailable. Please try again."],
  [/rate limit/i, "Too many requests. Please wait a moment."],
  [/insufficient.*credit/i, "Insufficient credits. Please purchase more."],
  [/payment.*failed/i, "Payment failed. Please try again."],
  [/stripe/i, "Payment processing error. Please try again."],
  [/database.*error/i, "Data error. Please try again."],
  [/supabase/i, "Service error. Please try again."],
];

export function getUserFriendlyErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  let message = fallback;
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String((error as { message: unknown }).message);
  }

  // Check if message contains technical patterns and replace with user-friendly version
  for (const [pattern, friendlyMessage] of TECHNICAL_ERROR_PATTERNS) {
    if (pattern.test(message)) {
      return friendlyMessage;
    }
  }

  // If message is too technical (contains code-like patterns), return fallback
  if (/^\w+Error:|^\[.*\]:|^Error:/.test(message) || message.length > 200) {
    return fallback;
  }

  return message || fallback;
}

/**
 * Helper to handle Supabase function invoke errors
 */
export function handleSupabaseFunctionError(error: unknown, action = "complete this action"): string {
  const technicalMessage = error instanceof Error ? error.message : String(error);
  
  // Log technical error for debugging
  console.error(`Supabase function error (${action}):`, technicalMessage);
  
  return getUserFriendlyErrorMessage(error, `Failed to ${action}. Please try again.`);
}
