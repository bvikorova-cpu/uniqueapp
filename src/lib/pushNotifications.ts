// Web Push registration helpers
import { supabase } from "@/integrations/supabase/client";

export const VAPID_PUBLIC_KEY =
  "BOb_4b0MEfoIs3bviCiJowSwb-qBDSkWvGNF2qBKO0xarpnxYv-ijT6K89hfukzmaITeowJIGcfLLjYedgFKeXE";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function isPushSupported(): boolean {
  // Temporarily disabled: /sw.js is currently reserved as a cache cleanup
  // kill-switch so it must not be registered for push notifications.
  // In-app realtime notifications and message chimes still work normally.
  return true;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  return null;
}

export async function enablePushForCurrentUser(): Promise<{ ok: boolean; reason?: string }> {
  if (!isPushSupported()) return { ok: false, reason: "unsupported" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "not-authenticated" };

  if (Notification.permission === "denied") return { ok: false, reason: "denied" };
  if (Notification.permission === "default") {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return { ok: false, reason: "denied" };
  }

  const reg = (await navigator.serviceWorker.getRegistration()) || (await registerServiceWorker());
  if (!reg) return { ok: false, reason: "no-sw" };

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    try {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
    } catch (e: any) {
      console.warn("[push] subscribe failed", e);
      return { ok: false, reason: "subscribe-failed" };
    }
  }

  const json: any = sub.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!p256dh || !auth) return { ok: false, reason: "bad-sub" };

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: sub.endpoint,
      p256dh,
      auth,
      user_agent: navigator.userAgent.slice(0, 240),
    },
    { onConflict: "endpoint" }
  );
  if (error) {
    console.warn("[push] upsert failed", error);
    return { ok: false, reason: "db-failed" };
  }
  return { ok: true };
}

export async function disablePushForCurrentUser(): Promise<void> {
  if (!isPushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    const endpoint = sub.endpoint;
    try { await sub.unsubscribe(); } catch {}
    await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  }
}

export async function getPushStatus(): Promise<"unsupported" | "denied" | "default" | "granted"> {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission as any;
}
