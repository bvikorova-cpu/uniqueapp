// Frontend safety layer for chat content: length cap, control-char strip,
// and per-user sliding-window rate limit. Server RLS still enforces auth/scope —
// this is just to keep the UX & traffic clean.

export const MAX_MESSAGE_LEN = 2000;

export const sanitizeMessageContent = (raw: string): string => {
  if (!raw) return "";
  // Strip zero-width and most control chars (keep \n, \r, \t), normalize whitespace runs.
  // eslint-disable-next-line no-control-regex
  const cleaned = raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\uFEFF]/g, "");
  // Collapse 3+ blank lines.
  const collapsed = cleaned.replace(/\n{3,}/g, "\n\n");
  // Hard cap length.
  return collapsed.slice(0, MAX_MESSAGE_LEN).trim();
};

// Sliding-window rate limiter: max N actions per windowMs.
const buckets = new Map<string, number[]>();

export const checkRateLimit = (
  key: string,
  maxActions = 10,
  windowMs = 10_000
): { ok: boolean; retryAfterMs: number } => {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= maxActions) {
    const retryAfterMs = windowMs - (now - arr[0]);
    buckets.set(key, arr);
    return { ok: false, retryAfterMs };
  }
  arr.push(now);
  buckets.set(key, arr);
  return { ok: true, retryAfterMs: 0 };
};
