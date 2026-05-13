import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VAPID_PUBLIC_KEY } from "@/lib/vapid";

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | "default";
  isLoading: boolean;
}

export function usePushNotifications() {
  const { toast } = useToast();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    permission: "default",
    isLoading: true,
  });

  useEffect(() => {
    const checkSupport = async () => {
      const isSupported =
        "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
      if (!isSupported) {
        setState((p) => ({ ...p, isSupported: false, isLoading: false }));
        return;
      }
      const permission = Notification.permission;
      let isSubscribed = false;
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        isSubscribed = sub !== null;
      } catch (e) {
        console.error("push check error:", e);
      }
      setState({ isSupported: true, isSubscribed, permission, isLoading: false });
    };
    checkSupport();
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      toast({ title: "Unsupported", description: "Push notifications not supported.", variant: "destructive" });
      return false;
    }
    const permission = await Notification.requestPermission();
    setState((p) => ({ ...p, permission }));
    if (permission === "granted") {
      toast({ title: "Enabled", description: "Notifications enabled." });
      return true;
    }
    if (permission === "denied") {
      toast({ title: "Denied", description: "Notifications denied.", variant: "destructive" });
    }
    return false;
  }, [state.isSupported, toast]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) return false;
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const json: any = subscription.toJSON();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("push_subscriptions" as any).upsert(
          {
            user_id: user.id,
            endpoint: json.endpoint,
            p256dh: json.keys.p256dh,
            auth: json.keys.auth,
            user_agent: navigator.userAgent,
            last_used_at: new Date().toISOString(),
          },
          { onConflict: "endpoint" },
        );
      }
      setState((p) => ({ ...p, isSubscribed: true }));
      toast({ title: "Subscribed", description: "You'll receive push notifications." });
      return true;
    } catch (e) {
      console.error("subscribe error:", e);
      toast({ title: "Error", description: "Failed to subscribe.", variant: "destructive" });
      return false;
    }
  }, [state.isSupported, toast]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await supabase.from("push_subscriptions" as any).delete().eq("endpoint", endpoint);
        setState((p) => ({ ...p, isSubscribed: false }));
        toast({ title: "Unsubscribed", description: "Notifications turned off." });
        return true;
      }
      return false;
    } catch (e) {
      console.error("unsubscribe error:", e);
      return false;
    }
  }, [toast]);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (state.permission !== "granted") return;
      navigator.serviceWorker.ready.then((reg) =>
        reg.showNotification(title, { icon: "/pwa-192x192.png", badge: "/pwa-192x192.png", ...options }),
      );
    },
    [state.permission],
  );

  return { ...state, requestPermission, subscribe, unsubscribe, showNotification };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

export default usePushNotifications;
