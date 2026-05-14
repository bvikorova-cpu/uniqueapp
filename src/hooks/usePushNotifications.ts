import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

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
    const check = async () => {
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
    check();
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
    setState((p) => ({ ...p, isSubscribed: true }));
    return true;
  }, []);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      setState((p) => ({ ...p, isSubscribed: false }));
      return true;
    } catch (e) {
      console.error("unsubscribe error:", e);
      return false;
    }
  }, []);

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

export default usePushNotifications;
