// M3: Nightly cleanup of expired Megatalent stories.
// Deletes mt_stories rows where expires_at < now() - 7 days and purges storage objects.
// Storage path convention: {user_id}/stories/{ts}.{ext} in buckets "media" (image) and "videos" (video).
// Gated by x-cron-secret header.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

function parseStoragePath(url: string): { bucket: string; path: string } | null {
  // Expect ...storage/v1/object/public/{bucket}/{path}
  const m = url.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+?)(?:\?|$)/);
  if (!m) return null;
  return { bucket: m[1], path: decodeURIComponent(m[2]) };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    if (cronSecret && req.headers.get("x-cron-secret") !== cronSecret) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: cors });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const cutoff = new Date(Date.now() - 7 * 86400_000).toISOString();
    const { data: rows, error } = await admin
      .from("mt_stories")
      .select("id, media_url")
      .lt("expires_at", cutoff)
      .limit(500);
    if (error) throw error;

    // Group paths per bucket for batch remove
    const perBucket = new Map<string, string[]>();
    const ids: string[] = [];
    for (const r of rows ?? []) {
      ids.push(r.id);
      const p = parseStoragePath(String(r.media_url || ""));
      if (!p) continue;
      const arr = perBucket.get(p.bucket) ?? [];
      arr.push(p.path);
      perBucket.set(p.bucket, arr);
    }

    const storageErrors: string[] = [];
    for (const [bucket, paths] of perBucket) {
      // remove in chunks of 100
      for (let i = 0; i < paths.length; i += 100) {
        const chunk = paths.slice(i, i + 100);
        const { error: rmErr } = await admin.storage.from(bucket).remove(chunk);
        if (rmErr) storageErrors.push(`${bucket}: ${rmErr.message}`);
      }
    }

    let deleted = 0;
    if (ids.length) {
      const { error: delErr, count } = await admin.from("mt_stories").delete({ count: "exact" }).in("id", ids);
      if (delErr) throw delErr;
      deleted = count ?? ids.length;
    }

    return new Response(
      JSON.stringify({ success: true, deleted, storage_buckets: Array.from(perBucket.keys()), storage_errors: storageErrors }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[mt-stories-cleanup]", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
