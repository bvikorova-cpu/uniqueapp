import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isR2Url, lookupR2Url } from "@/lib/r2Registry";

/**
 * Buckets that have been flipped to private (Phase 1+ of GDPR storage lockdown).
 * Any URL pointing at /storage/v1/object/public/<bucket>/... for these buckets
 * is re-signed at render time. Add new private buckets here as they are flipped.
 */
const PRIVATE_BUCKETS = new Set<string>([
  "video-resumes",
  "voice-memories",
  "voice-intros",
  "anonymous-date-voice",
  "messenger-attachments",
  "handwriting-capsule",
  "handwriting-gallery",
  "old-photos",
  "future-face-photos",
  "ancestor-twin-photos",
  "promotions",
]);

/** True if a bucket has been flipped to private. */
export const isPrivateBucket = (bucket: string) => PRIVATE_BUCKETS.has(bucket);

/**
 * Returns a readable URL for an uploaded object:
 * - private bucket → signed URL (TTL configurable, default 2h)
 * - public bucket → permanent public URL
 * Use this immediately after `supabase.storage.from(b).upload(path, file)`.
 */
export async function getReadableUrl(
  bucket: string,
  path: string,
  expiresInSec = 7200,
): Promise<string> {
  const r2 = lookupR2Url(bucket, path);
  if (r2) return r2;
  if (PRIVATE_BUCKETS.has(bucket)) {
    const url = await signedUrl(bucket, path, expiresInSec);
    if (url) return url;
    // Last resort: the object is uploaded, only signing failed (expired/refreshing
    // token, transient storage error). Fall back to the object URL so the flow
    // can continue instead of losing the upload.
    if (lastSignError) console.warn("[storage] sign failed:", bucket, path, lastSignError);
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

const SIGNED_TTL_SEC = 3600; // 1h
const cache = new Map<string, { url: string; exp: number }>();
let lastSignError: string | null = null;

/** Sign a path on a private bucket. Cached for ~TTL minus 1min. Retries transient failures. */
export async function signedUrl(
  bucket: string,
  path: string,
  expiresInSec = SIGNED_TTL_SEC,
): Promise<string | null> {
  const key = `${bucket}::${path}`;
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now() + 60_000) return hit.url;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      // Make sure we have a fresh access token before retrying.
      await supabase.auth.getSession();
      await new Promise((r) => setTimeout(r, 300 * attempt));
    }
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSec);
    if (!error && data?.signedUrl) {
      lastSignError = null;
      cache.set(key, { url: data.signedUrl, exp: Date.now() + expiresInSec * 1000 });
      return data.signedUrl;
    }
    lastSignError = error?.message ?? "unknown error";
  }
  return null;
}

/**
 * Accepts ANY value stored in DB (legacy public URL, raw path, or already-signed URL)
 * and returns a usable URL. For known-private buckets it re-signs; otherwise pass-through.
 */
export async function resolveStorageUrl(input: string | null | undefined): Promise<string | null> {
  if (!input) return null;
  // Already an R2 public URL — serve as-is.
  if (isR2Url(input)) return input;
  // Signed URL pattern. Re-sign it because stored signed URLs can expire.
  const signed = input.match(/\/storage\/v1\/object\/sign\/([^/]+)\/(.+?)(?:\?.*)?$/);
  if (signed) {
    const bucket = signed[1];
    const path = decodeURIComponent(signed[2]);
    const hit = lookupR2Url(bucket, path);
    if (hit) return hit;
    if (PRIVATE_BUCKETS.has(bucket)) return signedUrl(bucket, path);
    return input;
  }
  // Public URL pattern.
  const m = input.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+?)(?:\?.*)?$/);
  if (m) {
    const bucket = m[1];
    const path = decodeURIComponent(m[2]);
    const hit = lookupR2Url(bucket, path);
    if (hit) return hit;
    if (PRIVATE_BUCKETS.has(bucket)) return signedUrl(bucket, path);
    return input;
  }
  // Bucket-prefixed raw path, e.g. messenger-attachments/<user>/<file>.
  const [bucket, ...pathParts] = input.split("/");
  if (bucket && pathParts.length > 0) {
    const hit = lookupR2Url(bucket, pathParts.join("/"));
    if (hit) return hit;
    if (PRIVATE_BUCKETS.has(bucket)) return signedUrl(bucket, pathParts.join("/"));
  }
  return input;
}

/** React hook: resolves a possibly-private storage URL to a signed one. */
export function useResolvedStorageUrl(url: string | null | undefined): string | null {
  const [resolved, setResolved] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    resolveStorageUrl(url).then((r) => {
      if (!cancelled) setResolved(r);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);
  return resolved;
}

/** Resolve a list — keeps order, returns nulls for failed signs. */
export function useResolvedStorageUrls(urls: Array<string | null | undefined>): Array<string | null> {
  const [resolved, setResolved] = useState<Array<string | null>>(() => urls.map(() => null));
  useEffect(() => {
    let cancelled = false;
    Promise.all(urls.map(resolveStorageUrl)).then((arr) => {
      if (!cancelled) setResolved(arr);
    });
    return () => {
      cancelled = true;
    };
  }, [urls.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
  return resolved;
}
