/**
 * Lightweight analytics for the PWA install banner.
 *
 * Fires for both anonymous and authenticated users so we can measure
 * banner_shown → install_click/open_click conversion per platform.
 *
 * - Best-effort: failures are swallowed, never throw to the UI.
 * - Each (event_type, platform) tuple is fired at most once per session
 *   to prevent inflated "banner_shown" counts on re-renders.
 */

import { supabase } from "@/integrations/supabase/client";

export type PwaInstallEventType =
  | "banner_shown"
  | "install_click"
  | "open_click"
  | "install_accepted"
  | "install_dismissed"
  | "banner_dismissed";

export type PwaPlatform = "ios" | "android" | "desktop" | "unknown";

interface TrackArgs {
  eventType: PwaInstallEventType;
  platform: PwaPlatform;
  runningStandalone?: boolean;
  installed?: boolean;
  metadata?: Record<string, unknown>;
  /** When true, allow the same (eventType, platform) to fire again this session. */
  allowRepeat?: boolean;
}

const sessionFired = new Set<string>();

export async function trackPwaInstallEvent({
  eventType,
  platform,
  runningStandalone = false,
  installed = false,
  metadata = {},
  allowRepeat = false,
}: TrackArgs): Promise<void> {
  if (typeof window === "undefined") return;

  const key = `${eventType}:${platform}`;
  if (!allowRepeat) {
    if (sessionFired.has(key)) return;
    sessionFired.add(key);
  }

  try {
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id ?? null;

    await supabase.from("pwa_install_events").insert({
      user_id: userId,
      event_type: eventType,
      platform,
      running_standalone: runningStandalone,
      installed,
      user_agent: navigator.userAgent.slice(0, 500),
      metadata: metadata as never,
    });
  } catch {
    // Analytics must never break the UI.
  }
}
