import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  if (PRIVATE_BUCKETS.has(bucket)) {
    const url = await signedUrl(bucket, path, expiresInSec);
    if (!url) throw new Error(`Failed to sign URL for ${bucket}/${path}`);
    return url;
  }
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

const SIGNED_TTL_SEC = 3600; // 1h
const cache = new Map<string, { url: string; exp: number }>();

/** Sign a path on a private bucket. Cached for ~TTL minus 1min. */
export async function signedUrl(
  bucket: string,
  path: string,
  expiresInSec = SIGNED_TTL_SEC,
): Promise<string | null> {
  const key = `${bucket}::${path}`;
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now() + 60_000) return hit.url;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSec);
  if (error || !data?.signedUrl) return null;
  cache.set(key, { url: data.signedUrl, exp: Date.now() + expiresInSec * 1000 });
  return data.signedUrl;
}

/**
 * Accepts ANY value stored in DB (legacy public URL, raw path, or already-signed URL)
 * and returns a usable URL. For known-private buckets it re-signs; otherwise pass-through.
 */
export async function resolveStorageUrl(input: string | null | undefined): Promise<string | null> {
  if (!input) return null;
  // Signed URL pattern. Re-sign it because stored signed URLs can expire.
  const signed = input.match(/\/storage\/v1\/object\/sign\/([^/]+)\/(.+?)(?:\?.*)?$/);
  if (signed) {
    const bucket = signed[1];
    const path = decodeURIComponent(signed[2]);
    if (PRIVATE_BUCKETS.has(bucket)) return signedUrl(bucket, path);
    return input;
  }
  // Public URL pattern.
  const m = input.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+?)(?:\?.*)?$/);
  if (m) {
    const bucket = m[1];
    const path = decodeURIComponent(m[2]);
    if (PRIVATE_BUCKETS.has(bucket)) return signedUrl(bucket, path);
    return input;
  }
  // Bucket-prefixed raw path, e.g. messenger-attachments/<user>/<file>.
  const [bucket, ...pathParts] = input.split("/");
  if (bucket && pathParts.length > 0 && PRIVATE_BUCKETS.has(bucket)) {
    return signedUrl(bucket, pathParts.join("/"));
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
