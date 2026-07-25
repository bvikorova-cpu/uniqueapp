import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tracks a viewer's live-stream session: creates a row on mount,
 * heartbeats watch_seconds every 30s, and stamps left_at on unmount.
 * No-op if the current user is the stream owner or not signed in.
 */
export function useStreamViewerSession(params: {
  streamId: string | null | undefined;
  currentUserId: string | null | undefined;
  isOwner: boolean;
  isLive: boolean;
}) {
  const { streamId, currentUserId, isOwner, isLive } = params;
  const sessionIdRef = useRef<string | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!streamId || !currentUserId || isOwner || !isLive) return;
    let cancelled = false;

    (async () => {
      const { data, error } = await (supabase as any)
        .from("stream_viewer_sessions")
        .insert({ stream_id: streamId, user_id: currentUserId, joined_at: new Date().toISOString() })
        .select("id")
        .single();
      if (error || cancelled) return;
      sessionIdRef.current = data.id;
      startedAtRef.current = Date.now();
    })();

    const beat = setInterval(async () => {
      if (!sessionIdRef.current) return;
      const secs = Math.floor((Date.now() - startedAtRef.current) / 1000);
      await (supabase as any)
        .from("stream_viewer_sessions")
        .update({ watch_seconds: secs })
        .eq("id", sessionIdRef.current);
    }, 30000);

    const close = async () => {
      if (!sessionIdRef.current) return;
      const secs = Math.floor((Date.now() - startedAtRef.current) / 1000);
      await (supabase as any)
        .from("stream_viewer_sessions")
        .update({ watch_seconds: secs, left_at: new Date().toISOString() })
        .eq("id", sessionIdRef.current);
      sessionIdRef.current = null;
    };

    window.addEventListener("beforeunload", close);

    return () => {
      cancelled = true;
      clearInterval(beat);
      window.removeEventListener("beforeunload", close);
      void close();
    };
  }, [streamId, currentUserId, isOwner, isLive]);
}
