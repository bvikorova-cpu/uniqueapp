// Client-side helpers for scale-readiness primitives created in DB + edge fns.
// - rateLimit(bucket, max, windowSec): server-authoritative limiter.
// - moderateText(text), moderateImage(url): AI moderation.
// - searchPosts(q), searchProfiles(q): FTS RPCs.
// - getCachedFeed(): denormalized feed cache reader.

import { supabase } from "@/integrations/supabase/client";

export async function rateLimit(
  bucket: string,
  max: number,
  windowSeconds: number
): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    _bucket: bucket,
    _max: max,
    _window_seconds: windowSeconds,
  });
  if (error) {
    console.warn("[rateLimit] rpc failed, fail-open:", error.message);
    return true;
  }
  return Boolean(data);
}

export interface TextModResult {
  allowed: boolean;
  severity: "none" | "low" | "medium" | "high";
  categories: string[];
  reason?: string;
}

export async function moderateText(text: string): Promise<TextModResult> {
  const { data, error } = await supabase.functions.invoke("moderate-text", { body: { text } });
  if (error || !data) return { allowed: true, severity: "none", categories: [], reason: "invoke_failed" };
  return data as TextModResult;
}

export interface ImageModResult {
  allowed: boolean;
  nsfw: boolean;
  csam_suspected: boolean;
  severity: "none" | "low" | "medium" | "high";
  categories: string[];
  reason?: string;
}

export async function moderateImage(imageUrl: string): Promise<ImageModResult> {
  const { data, error } = await supabase.functions.invoke("moderate-image", { body: { image_url: imageUrl } });
  if (error || !data) {
    return { allowed: true, nsfw: false, csam_suspected: false, severity: "none", categories: [], reason: "invoke_failed" };
  }
  return data as ImageModResult;
}

export async function searchPosts(q: string, limit = 20) {
  const { data, error } = await supabase.rpc("search_posts", { _q: q, _limit: limit });
  if (error) throw error;
  return data ?? [];
}

export async function searchProfilesFts(q: string, limit = 20) {
  const { data, error } = await supabase.rpc("search_profiles_fts", { _q: q, _limit: limit });
  if (error) throw error;
  return data ?? [];
}

export async function getCachedFeed(limit = 50) {
  const { data, error } = await supabase
    .from("user_feed_cache")
    .select("post_id, author_id, inserted_at, score")
    .order("inserted_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
