import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
// Public VAPID key - if you have one stored, set it via env, else fallback prompts user
const VAPID_PUBLIC = (import.meta.env.VITE_VAPID_PUBLIC_KEY as string) || "";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export function JobsPushButton() {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setEnabled(!!sub);
    })();
  }, []);

  const enable = async () => {
    setBusy(true);
    try {
      if (!VAPID_PUBLIC) { toast.error("Push not configured (missing VAPID key)"); return; }
      const reg = await navigator.serviceWorker.ready;
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { toast.error("Permission denied"); return; }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });
      const json: any = sub.toJSON();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Sign in first"); return; }
      await supabase.from("push_subscriptions").upsert({
        user_id: user.id,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        user_agent: navigator.userAgent,
      }, { onConflict: "endpoint" });
      setEnabled(true);
      toast.success("Push notifications enabled");
    } catch (e: any) {
      toast.error(e.message);
    } finally { setBusy(false); }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        await sub.unsubscribe();
      }
      setEnabled(false);
      toast.success("Push disabled");
    } finally { setBusy(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How Jobs Push Button works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Button size="sm" variant="outline" className="text-xs" onClick={enabled ? disable : enable} disabled={busy}>
      {enabled ? <BellOff className="h-3.5 w-3.5 mr-1" /> : <Bell className="h-3.5 w-3.5 mr-1" />}
      {enabled ? "Push on" : "Enable push"}
    </Button>
    </>
    );
}
