import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/** Minimal Web Push subscription manager. Stores endpoint in push_subscriptions and on/off state in user_push_settings. */
export function usePushSubscription() {
  const { toast } = useToast();
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const ok = typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
    setSupported(ok);
    if (ok) setPermission(Notification.permission);

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_push_settings")
        .select("enabled")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.enabled) setEnabled(true);
    })();
  }, []);

  const persistState = async (userId: string, value: boolean) => {
    await supabase.from("user_push_settings").upsert(
      { user_id: userId, enabled: value, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
  };

  const enable = async () => {
    if (!supported) {
      toast({ title: "Push not supported on this device", variant: "destructive" });
      return;
    }
    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm !== "granted") {
      toast({ title: "Notifications blocked", description: "Allow notifications in your browser settings.", variant: "destructive" });
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription() ?? await reg.pushManager.subscribe({ userVisibleOnly: true });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const json = sub.toJSON();
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          endpoint: json.endpoint!,
          p256dh: json.keys?.p256dh ?? null,
          auth: json.keys?.auth ?? null,
          user_agent: navigator.userAgent,
          platform: navigator.platform,
          last_used_at: new Date().toISOString(),
        },
        { onConflict: "user_id,endpoint" },
      );
      if (error) throw error;
      await persistState(user.id, true);
      setEnabled(true);
      toast({ title: "Push notifications enabled" });
    } catch (e: any) {
      toast({ title: "Could not enable push", description: e.message, variant: "destructive" });
    }
  };

  const disable = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      const { data: { user } } = await supabase.auth.getUser();
      if (sub) {
        await sub.unsubscribe();
        if (user) {
          await supabase.from("push_subscriptions").delete()
            .eq("user_id", user.id).eq("endpoint", sub.endpoint);
        }
      }
      if (user) await persistState(user.id, false);
      setEnabled(false);
      toast({ title: "Push notifications disabled" });
    } catch (e: any) {
      toast({ title: "Could not disable push", description: e.message, variant: "destructive" });
    }
  };

  return { supported, permission, enabled, enable, disable };
}
