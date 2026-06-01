import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Heart, MessageCircle, Smile, Repeat2, Check, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'reaction' | 'repost' | 'follow';
  post_id: string | null;
  actor_id: string;
  is_read: boolean;
  created_at: string;
  actor: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const NotificationsDropdown = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('notificationSoundEnabled') !== 'false';
  });

  const playNotificationSound = (type: string) => {
    if (!soundEnabled) return;
    
    let soundFile = '/sounds/notification.mp3'; // default
    
    switch (type) {
      case 'follow':
        soundFile = '/sounds/follow.mp3';
        break;
      case 'like':
        soundFile = '/sounds/like.mp3';
        break;
      case 'comment':
        soundFile = '/sounds/comment.mp3';
        break;
      case 'reaction':
      case 'repost':
        soundFile = '/sounds/notification.mp3';
        break;
    }
    
    const audio = new Audio(soundFile);
    audio.volume = 0.5;
    audio.play().catch(err => console.log('Could not play sound:', err));
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        async (payload) => {
          // Play sound based on notification type
          const notificationType = payload.new.type;
          if (['follow', 'like', 'comment', 'reaction', 'repost'].includes(notificationType)) {
            playNotificationSound(notificationType);
          }
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [soundEnabled]);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: notificationsData, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch actor profiles via security-definer RPC (RLS-safe public fields)
      const actorIds = [...new Set((notificationsData || []).map((n: any) => n.actor_id).filter(Boolean))] as string[];
      let profilesMap = new Map<string, any>();
      if (actorIds.length) {
        const { data: profiles } = await supabase.rpc("get_public_profiles", { ids: actorIds });
        profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      }

      const notificationsWithProfiles = (notificationsData || []).map((notification: any) => ({
        id: notification.id,
        type: notification.type,
        post_id: notification.post_id,
        actor_id: notification.actor_id,
        is_read: notification.is_read,
        created_at: notification.created_at,
        actor: profilesMap.get(notification.actor_id) || { id: notification.actor_id, full_name: null, avatar_url: null },
      } as Notification));

      setNotifications(notificationsWithProfiles);
      setUnreadCount(notificationsWithProfiles.filter(n => !n.is_read).length);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    if (notification.post_id) {
      navigate(`/wall`);
    } else if (notification.type === 'follow') {
      navigate(`/profile/${notification.actor_id}`);
    }
  };

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('notificationSoundEnabled', String(newValue));
    toast({
      title: newValue ? "Sounds enabled" : "Sounds disabled",
      description: newValue ? "You will hear sounds for new notifications" : "Notification sounds are disabled",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'reaction':
        return <Smile className="h-4 w-4 text-yellow-500" />;
      case 'repost':
        return <Repeat2 className="h-4 w-4 text-green-500" />;
      case 'follow':
        return <Bell className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getNotificationText = (notification: Notification) => {
    const name = notification.actor.full_name || "Someone";
    switch (notification.type) {
      case 'like':
        return `${name} liked your post`;
      case 'comment':
        return `${name} commented on your post`;
      case 'reaction':
        return `${name} reacted to your post`;
      case 'repost':
        return `${name} shared your post`;
      case 'follow':
        return `${name} started following you`;
      default:
        return "";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSound}
              className="text-lg px-2"
              title={soundEnabled ? "Disable sounds" : "Enable sounds"}
            >
              {soundEnabled ? "🔔" : "🔕"}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${
                  !notification.is_read ? "bg-accent/50" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3 w-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={notification.actor.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {notification.actor.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <p className="text-sm">
                          {getNotificationText(notification)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: enUS,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  {!notification.is_read && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
