/**
 * PWA install prompt orchestration.
 *
 * Hard signals only — we NEVER infer "installed" from the absence of
 * `beforeinstallprompt`, because many Android browsers / in-app webviews /
 * sites that don't meet installability criteria simply never fire that event.
 * Inferring installation in those cases shows users a misleading "Open app"
 * CTA when they have nothing installed.
 *
 * Sources of truth for `installed`:
 *   a) running in standalone display-mode (we're literally inside the app)
 *   b) `appinstalled` event fired this session
 *   c) navigator.getInstalledRelatedApps() returns a matching app
 *
 * No localStorage persistence — stale flags caused false "installed" state
 * after browser data resets / fresh devices.
 */

import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type Platform = "android" | "desktop" | "ios" | "unknown";

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.matchMedia?.("(display-mode: minimal-ui)").matches ||
    window.matchMedia?.("(display-mode: fullscreen)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform] = useState<Platform>(detectPlatform());
  const [runningStandalone, setRunningStandalone] = useState<boolean>(isStandalone());
  const [installed, setInstalled] = useState<boolean>(() => isStandalone());

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Clear any stale persisted flag from older builds — it caused false positives.
    try { localStorage.removeItem("pwa_installed"); } catch { /* ignore */ }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setInstalled(false);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    const mq = window.matchMedia?.("(display-mode: standalone)");
    const onDisplayChange = (e: MediaQueryListEvent) => {
      setRunningStandalone(e.matches || isStandalone());
      if (e.matches) setInstalled(true);
    };
    mq?.addEventListener?.("change", onDisplayChange);

    const nav = navigator as unknown as {
      getInstalledRelatedApps?: () => Promise<Array<{ platform: string; url?: string; id?: string }>>;
    };
    if (typeof nav.getInstalledRelatedApps === "function") {
      nav.getInstalledRelatedApps()
        .then((apps) => { if (apps && apps.length > 0) setInstalled(true); })
        .catch(() => { /* ignore */ });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      mq?.removeEventListener?.("change", onDisplayChange);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<"accepted" | "dismissed" | "unsupported"> => {
    if (!deferredPrompt) return "unsupported";
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (choice.outcome === "accepted") setInstalled(true);
    return choice.outcome;
  }, [deferredPrompt]);

  const openApp = useCallback(() => {
    try {
      window.location.href = `${window.location.origin}/?source=pwa`;
    } catch { /* ignore */ }
  }, []);

  // Show banner only when we actually CAN install:
  // - iOS: always show the Share-sheet hint (no programmatic API exists)
  // - Other platforms: only if we have a real deferredPrompt event
  const canInstall =
    !runningStandalone && !installed && (platform === "ios" || deferredPrompt !== null);

  return {
    canInstall,
    installed,
    runningStandalone,
    platform,
    promptInstall,
    openApp,
    /** @deprecated kept for API compatibility */
    dismiss: () => {},
  };
}
