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
    const checkSupport = async () => {
      const isSupported = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
      
      if (!isSupported) {
        setState(prev => ({ ...prev, isSupported: false, isLoading: false }));
        return;
      }

      const permission = Notification.permission;
      let isSubscribed = false;

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await (registration as any).pushManager.getSubscription();
        isSubscribed = subscription !== null;
      } catch (error) {
        console.error("Error checking push subscription:", error);
      }

      setState({
        isSupported: true,
        isSubscribed,
        permission,
        isLoading: false,
      });
    };

    checkSupport();
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      toast({
        title: "Unsupported",
        description: "Your browser does not support push notifications."
        variant: "destructive",
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));

      if (permission === "granted") {
        toast({
          title: "Enabled",
          description: "Push notifications have been enabled."
        });
        return true;
      } else if (permission === "denied") {
        toast({
          title: "Denied",
          description: "Push notifications have been denied."
          variant: "destructive",
        });
        return false;
      }
      
      return false;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast({
        title: "Chyba",
        description: "Failed to request notification permission."
        variant: "destructive",
      });
      return false;
    }
  }, [state.isSupported, toast]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Generate VAPID public key (in production, this should come from your server)
      const vapidPublicKey = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";
      
      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // In production, send subscription to your server
      console.log("Push subscription:", JSON.stringify(subscription));

      setState(prev => ({ ...prev, isSubscribed: true }));
      toast({
        title: "Subscribed",
        description: "You will now receive push notifications."
      });
      
      return true;
    } catch (error) {
      console.error("Error subscribing to push:", error);
      toast({
        title: "Chyba",
        description: "Failed to subscribe to push notifications."
        variant: "destructive",
      });
      return false;
    }
  }, [state.isSupported, toast]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        setState(prev => ({ ...prev, isSubscribed: false }));
        toast({
          title: "Unsubscribed",
          description: "Push notifications have been turned off."
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
      toast({
        title: "Chyba",
        description: "Failed to unsubscribe from push notifications."
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (state.permission !== "granted") {
      console.warn("Notification permission not granted");
      return;
    }

    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        ...options,
      });
    });
  }, [state.permission]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}

export default usePushNotifications;
