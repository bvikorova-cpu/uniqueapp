import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "eco-media";

/** Extracts the storage object path from a stored public/signed URL (or returns it as-is). */
export function toStoragePath(url: string): string {
  if (!url) return url;
  const marker = `/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return url.replace(/^\/+/, "");
  return decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
}

/** Resolves a signed URL for a challenge media item (bucket is private). */
export function useChallengeMediaUrl(url: string | null | undefined) {
  const [signed, setSigned] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!url) { setSigned(null); return; }
    supabase.storage
      .from(BUCKET)
      .createSignedUrl(toStoragePath(url), 60 * 60)
      .then(({ data }) => {
        if (!cancelled) setSigned(data?.signedUrl ?? url);
      })
      .catch(() => { if (!cancelled) setSigned(url); });
    return () => { cancelled = true; };
  }, [url]);

  return signed;
}

export function ChallengeImage({ url, className }: { url: string; className?: string }) {
  const src = useChallengeMediaUrl(url);
  if (!src) return <div className={`animate-pulse bg-muted rounded-lg ${className || "h-48 w-full"}`} />;
  return <img src={src} alt="Challenge proof" loading="lazy" className={className} />;
}

export function ChallengeVideo({ url, className }: { url: string; className?: string }) {
  const src = useChallengeMediaUrl(url);
  if (!src) return <div className={`animate-pulse bg-muted rounded-lg ${className || "h-56 w-full"}`} />;
  return <video src={src} controls playsInline className={className} />;
}
