/**
 * PWA install prompt orchestration.
 *
 * Captures the `beforeinstallprompt` event (Chromium / Edge / Samsung Internet)
 * and exposes a single `promptInstall()` we can wire to a button. iOS Safari
 * doesn't fire this event — we detect it separately and return `canInstall=true`
 * with `platform='ios'` so the UI can show "Tap Share → Add to Home Screen".
 *
 * Dismissal is sticky for 14 days via localStorage so we don't nag users.
 */

import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "pwa_install_dismissed_until";
const DISMISS_DAYS = 14;

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
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isDismissed(): boolean {
  try {
    const until = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return until > Date.now();
  } catch {
    return false;
  }
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(isStandalone());
  const [platform] = useState<Platform>(detectPlatform());
  const [dismissed, setDismissed] = useState<boolean>(isDismissed());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<"accepted" | "dismissed" | "unsupported"> => {
    if (!deferredPrompt) return "unsupported";
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (choice.outcome === "dismissed") {
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86_400_000));
      } catch {
        /* ignore */
      }
      setDismissed(true);
    }
    return choice.outcome;
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86_400_000));
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }, []);

  // Show install banner on every open regardless of prior dismissal or install state.
  const canInstall = platform !== "unknown";

  return { canInstall, installed, platform, promptInstall, dismiss };
}
