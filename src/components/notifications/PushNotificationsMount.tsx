import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { enablePushForCurrentUser, isPushSupported, registerServiceWorker } from "@/lib/pushNotifications";

/**
 * Mounts the push notification lifecycle:
 *  - Registers /sw.js once
 *  - If the user previously granted permission, silently re-subscribes
 *    so the subscription stays fresh in the DB after each login/device.
 * User-facing opt-in lives in <PushOptInButton />.
 */
export const PushNotificationsMount = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!isPushSupported()) return;
    registerServiceWorker();
  }, []);

  useEffect(() => {
    if (!user || !isPushSupported()) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    enablePushForCurrentUser().catch(() => {});
  }, [user?.id]);

  return null;
};

export default PushNotificationsMount;
