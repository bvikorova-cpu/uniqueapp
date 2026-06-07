import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logSecurityEvent } from "@/lib/securityAudit";

/**
 * P4: Idle session timeout — auto sign-out after `timeoutMs` of inactivity.
 * Default 30 min. Activity = mousemove, keydown, touchstart, scroll, click.
 * Only active when a session exists. Cross-tab via storage event.
 */
const ACTIVITY_KEY = "unique_last_activity_at";
const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000;
const WARN_MS = 60 * 1000;

export function useIdleLogout(timeoutMs: number = DEFAULT_TIMEOUT_MS) {
  const { user } = useAuth();
  const { toast } = useToast();
  const warnedRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    const bump = () => {
      const now = Date.now();
      try {
        localStorage.setItem(ACTIVITY_KEY, String(now));
      } catch {}
      warnedRef.current = false;
    };
    bump();

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));

    const interval = window.setInterval(async () => {
      const lastRaw = localStorage.getItem(ACTIVITY_KEY);
      const last = lastRaw ? parseInt(lastRaw, 10) : Date.now();
      const idle = Date.now() - last;

      if (idle >= timeoutMs) {
        try {
          // P5: log BEFORE signOut while session still valid
          await logSecurityEvent("idle_logout", {
            metadata: { idle_ms: idle, timeout_ms: timeoutMs },
          });
          await supabase.auth.signOut();
          toast({
            title: "Signed out",
            description: "You were signed out due to inactivity.",
            variant: "destructive",
          });
        } catch {}
      } else if (idle >= timeoutMs - WARN_MS && !warnedRef.current) {
        warnedRef.current = true;
        toast({
          title: "About to sign out",
          description: "You will be signed out in 1 minute due to inactivity.",
        });
      }
    }, 15_000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, bump));
      window.clearInterval(interval);
    };
  }, [user, timeoutMs, toast]);
}
