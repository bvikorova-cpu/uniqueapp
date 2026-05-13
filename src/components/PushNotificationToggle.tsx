import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { cn } from "@/lib/utils";

interface PushNotificationToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function PushNotificationToggle({ className, showLabel = true }: PushNotificationToggleProps) {
  const { isSupported, isSubscribed, permission, isLoading, requestPermission, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  const handleToggle = async () => {
    if (permission !== "granted") {
      const granted = await requestPermission();
      if (granted) {
        await subscribe();
      }
    } else if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <Button
      variant={isSubscribed ? "default" : "outline"}
      size={showLabel ? "default" : "icon"}
      onClick={handleToggle}
      disabled={isLoading || permission === "denied"}
      className={cn("gap-2", className)}
      aria-label={isSubscribed ? "Turn off notifications" : "Turn on notifications"}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSubscribed ? (
        <Bell className="h-4 w-4" />
      ) : (
        <BellOff className="h-4 w-4" />
      )}
      {showLabel && (
        <span>
          {permission === "denied" 
            ? "Notifications disabled" 
            : isSubscribed 
              ? "Notifications enabled" 
              : "Turn on notifications"
          }
        </span>
      )}
    </Button>
  );
}

export default PushNotificationToggle;
