import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Global presence heartbeat. While the tab is visible and a user is signed in,
 * upserts `user_online_status` with is_online=true + last_seen=now every 60s
 * (and immediately on mount / visibility regain). On hide / unload / unmount
 * flags user offline while still updating last_seen.
 */
export const usePresenceHeartbeat = (userId: string | null | undefined) => {
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const write = async (isOnline: boolean) => {
      if (cancelled) return;
      try {
        await supabase
          .from("user_online_status")
          .upsert(
            {
              user_id: userId,
              is_online: isOnline,
              last_seen: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
      } catch {
        /* ignore transient errors */
      }
    };

    // initial ping
    write(true);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") write(true);
    }, 60_000);

    const onVisibility = () => {
      write(document.visibilityState === "visible");
    };
    const onUnload = () => {
      // best-effort synchronous-ish flag offline
      write(false);
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", onUnload);
    window.addEventListener("pagehide", onUnload);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onUnload);
      window.removeEventListener("pagehide", onUnload);
      write(false);
    };
  }, [userId]);
};
