/**
 * Creates a logger function with a specific prefix
 * Useful for tracking which edge function is logging
 */
export function createLogger(prefix: string) {
  return (step: string, details?: Record<string, unknown>) => {
    const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
    console.log(`[${prefix.toUpperCase()}] ${step}${detailsStr}`);
  };
}

/**
 * Creates a logger with error and warn methods
 */
export function createAdvancedLogger(prefix: string) {
  const formattedPrefix = prefix.toUpperCase();
  
  return {
    info: (step: string, details?: Record<string, unknown>) => {
      const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
      console.log(`[${formattedPrefix}] ${step}${detailsStr}`);
    },
    warn: (step: string, details?: Record<string, unknown>) => {
      const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
      console.warn(`[${formattedPrefix}] WARN: ${step}${detailsStr}`);
    },
    error: (step: string, details?: Record<string, unknown>) => {
      const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
      console.error(`[${formattedPrefix}] ERROR: ${step}${detailsStr}`);
    },
    debug: (step: string, details?: Record<string, unknown>) => {
      const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
      console.log(`[${formattedPrefix}] DEBUG: ${step}${detailsStr}`);
    } };
}

/**
 * Performance timing helper
 */
export function createTimedLogger(prefix: string) {
  const startTime = Date.now();
  const log = createLogger(prefix);
  
  return {
    log: (step: string, details?: Record<string, unknown>) => {
      const elapsed = Date.now() - startTime;
      log(step, { ...details, elapsed_ms: elapsed });
    },
    elapsed: () => Date.now() - startTime };
}
