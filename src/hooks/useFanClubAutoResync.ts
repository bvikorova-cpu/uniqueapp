import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Global auto-resync for fan-club memberships.
 *
 * If any of the current user's memberships is in a transient/failed state
 * (past_due / pending / expired), silently re-invoke `fanclub-verify` every
 * `intervalMs` (default 7 minutes). When a previously broken membership
 * transitions to `active`, surface a success toast so the user knows the
 * state was auto-repaired without needing to hit "Re-verify" manually.
 *
 * Mounts once at the app root; no UI. Safe to call anywhere within AuthProvider.
 */
const INTERVAL_MS = 7 * 60 * 1000; // 7 minutes
const BROKEN = new Set(["past_due", "pending", "expired", "incomplete"]);

type Row = {
  fan_club_id: string;
  status: string;
  fan_club?: { name: string | null } | null;
};

export const useFanClubAutoResync = () => {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runningRef = useRef(false);
  const knownBrokenRef = useRef<Map<string, { status: string; name: string }>>(new Map());

  useEffect(() => {
    let cancelled = false;

    const readMemberships = async (): Promise<Row[]> => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return [];
      const { data } = await supabase
        .from("influencer_fan_club_members")
        .select("fan_club_id, status, fan_club:influencer_fan_clubs(name)")
        .eq("user_id", uid);
      return ((data as unknown as Row[]) ?? []);
    };

    const tick = async () => {
      if (runningRef.current) return;
      runningRef.current = true;
      try {
        const before = await readMemberships();
        if (cancelled) return;

        // Seed / refresh the known-broken map from live DB state.
        const currentBroken = new Map<string, { status: string; name: string }>();
        for (const r of before) { if (BROKEN.has(r.status)) {
            currentBroken.set(r.fan_club_id, {
              status: r.status,
              name: r.fan_club?.name || "Fan Club" });
          }
        }

        // Merge with anything previously tracked but no longer in DB read
        // (avoids losing signal if a row is momentarily missing).
        for (const [id, info] of knownBrokenRef.current) {
          if (!currentBroken.has(id) && !before.find((r) => r.fan_club_id === id)) {
            currentBroken.set(id, info);
          }
        }

        // Nothing to fix → keep the map clean and exit.
        if (currentBroken.size === 0) {
          knownBrokenRef.current = new Map();
          return;
        }

        knownBrokenRef.current = currentBroken;

        // Silent Stripe reconciliation.
        const { error } = await supabase.functions.invoke("fanclub-verify", { body: {} });
        if (error) return; // fail silently; try again next tick

        const after = await readMemberships();
        if (cancelled) return;

        const fixed: string[] = [];
        for (const [id, info] of knownBrokenRef.current) {
          const now = after.find((r) => r.fan_club_id === id);
          if (now && now.status === "active") {
            fixed.push(info.name);
            knownBrokenRef.current.delete(id);
          } else if (now && !BROKEN.has(now.status)) {
            // e.g. canceled — remove from tracking without a toast
            knownBrokenRef.current.delete(id);
          } else if (now) { knownBrokenRef.current.set(id, {
              status: now.status,
              name: now.fan_club?.name || info.name });
          }
        }

        if (fixed.length === 1) {
          toast.success(`Fan Club status repaired: ${fixed[0]} is now verified.`);
        } else if (fixed.length > 1) {
          toast.success(`${fixed.length} fan-club memberships auto-repaired.`, { description: fixed.slice(0, 3).join(", ") + (fixed.length > 3 ? "…" : "") });
        }
      } catch {
        /* swallow — background job must never break the app */
      } finally {
        runningRef.current = false;
      }
    };

    // Run once shortly after mount so we don't wait a full interval on cold start.
    const kickoff = setTimeout(tick, 30_000);
    timerRef.current = setInterval(tick, INTERVAL_MS);

    return () => {
      cancelled = true;
      clearTimeout(kickoff);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
};

export default useFanClubAutoResync;
