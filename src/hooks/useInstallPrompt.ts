/**
 * PWA install prompt orchestration.
 *
 * - Captures `beforeinstallprompt` (Chromium / Edge / Samsung Internet).
 * - Detects iOS Safari separately (no programmatic API).
 * - Detects already-installed state via:
 *     a) display-mode: standalone / navigator.standalone (running as installed app)
 *     b) navigator.getInstalledRelatedApps() (Chromium, when related_applications set)
 *     c) `appinstalled` event
 *     d) absence of `beforeinstallprompt` after grace period on Chromium = likely installed
 *   When installed, the UI can hide the banner or show an "Open" CTA.
 */

import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const INSTALLED_KEY = "pwa_installed";
const INSTALL_CHECK_GRACE_MS = 3_000;

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

function readPersistedInstalled(): boolean {
  try {
    return localStorage.getItem(INSTALLED_KEY) === "1";
  } catch {
    return false;
  }
}

function persistInstalled(value: boolean) {
  try {
    if (value) localStorage.setItem(INSTALLED_KEY, "1");
    else localStorage.removeItem(INSTALLED_KEY);
  } catch {
    /* ignore */
  }
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform] = useState<Platform>(detectPlatform());
  const [runningStandalone, setRunningStandalone] = useState<boolean>(isStandalone());
  const [installed, setInstalled] = useState<boolean>(() => isStandalone() || readPersistedInstalled());
  const [promptChecked, setPromptChecked] = useState<boolean>(false);

  // Listen to install lifecycle + display-mode changes.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // If we get this event, the app is definitely NOT installed.
      setInstalled(false);
      persistInstalled(false);
      setPromptChecked(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      persistInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    const mq = window.matchMedia?.("(display-mode: standalone)");
    const onDisplayChange = (e: MediaQueryListEvent) => {
      setRunningStandalone(e.matches || isStandalone());
      if (e.matches) {
        setInstalled(true);
        persistInstalled(true);
      }
    };
    mq?.addEventListener?.("change", onDisplayChange);

    // Try the Chromium-only API for related installed apps.
    const nav = navigator as unknown as {
      getInstalledRelatedApps?: () => Promise<Array<{ platform: string; url?: string; id?: string }>>;
    };
    if (typeof nav.getInstalledRelatedApps === "function") {
      nav
        .getInstalledRelatedApps()
        .then((apps) => {
          if (apps && apps.length > 0) {
            setInstalled(true);
            persistInstalled(true);
          }
        })
        .catch(() => {
          /* ignore */
        });
    }

    // Grace period: on Chromium (android/desktop) `beforeinstallprompt` fires
    // quickly when install is possible. If it never fires AND we're not in
    // standalone, the app is most likely already installed.
    const t = window.setTimeout(() => setPromptChecked(true), INSTALL_CHECK_GRACE_MS);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      mq?.removeEventListener?.("change", onDisplayChange);
      window.clearTimeout(t);
    };
  }, []);

  // Infer installed for Chromium when no prompt arrives within the grace window.
  useEffect(() => {
    if (!promptChecked) return;
    if (installed || runningStandalone) return;
    if (platform === "ios" || platform === "unknown") return;
    if (deferredPrompt) return;
    setInstalled(true);
    persistInstalled(true);
  }, [promptChecked, deferredPrompt, installed, runningStandalone, platform]);

  const promptInstall = useCallback(async (): Promise<"accepted" | "dismissed" | "unsupported"> => {
    if (!deferredPrompt) return "unsupported";
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (choice.outcome === "accepted") {
      setInstalled(true);
      persistInstalled(true);
    }
    return choice.outcome;
  }, [deferredPrompt]);

  const openApp = useCallback(() => {
    // Best-effort: navigate to start_url; on Android Chrome with a matching
    // installed PWA scope this can hand off to the installed app.
    try {
      const startUrl = `${window.location.origin}/?source=pwa`;
      window.location.href = startUrl;
    } catch {
      /* ignore */
    }
  }, []);

  // Banner visibility rules:
  // - Hide entirely when running inside the installed app (standalone).
  // - Hide when we know the app is installed (no point nagging).
  // - Otherwise show for known platforms.
  const canInstall = platform !== "unknown" && !runningStandalone && !installed;

  return {
    canInstall,
    installed,
    runningStandalone,
    platform,
    promptInstall,
    openApp,
    /** @deprecated kept for API compatibility — dismissal is no longer sticky */
    dismiss: () => {},
  };
}
