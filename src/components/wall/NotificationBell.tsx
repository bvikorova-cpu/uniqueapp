import { Bell, BellOff, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  useNotifications,
  isNotificationSoundEnabled,
  setNotificationSoundEnabled,
} from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

export const NotificationBell = () => {
  const { notifications, unreadCount, isRinging, markAsRead, markAllAsRead } =
    useNotifications();
  const [soundOn, setSoundOn] = useState<boolean>(true);

  useEffect(() => {
    setSoundOn(isNotificationSoundEnabled());
    const sync = () => setSoundOn(isNotificationSoundEnabled());
    window.addEventListener("unique:notification-sound-changed", sync);
    return () =>
      window.removeEventListener("unique:notification-sound-changed", sync);
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${isRinging ? "animate-bell-ring text-primary" : ""}`}
          aria-label="Notifications"
        >
          {soundOn ? (
            <Bell className={`h-5 w-5 ${isRinging ? "drop-shadow-[0_0_8px_hsl(var(--primary))]" : ""}`} />
          ) : (
            <BellOff className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge
              className={`absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs ${isRinging ? "animate-pulse" : ""}`}
              variant="destructive"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="flex justify-between items-center mb-4 gap-2">
          <h3 className="font-semibold text-lg">Notifications</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationSoundEnabled(!soundOn)}
              aria-label={soundOn ? "Mute notification sound" : "Unmute notification sound"}
              title={soundOn ? "Sound on" : "Sound off"}
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => markAllAsRead()}>
                Mark all read
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No notifications yet
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    notification.is_read ? "bg-accent/30" : "bg-accent"
                  }`}
                  onClick={() => {
                    if (!notification.is_read) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm">{notification.title}</h4>
                    {!notification.is_read && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <span className="text-xs text-muted-foreground mt-2 block">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
