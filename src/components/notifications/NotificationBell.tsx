import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  type: string;
  created_at: string;
  is_read: boolean;
  post_id?: string | null;
  comment_id?: string | null;
  repost_id?: string | null;
  related_id?: string | null;
  action_url?: string | null;
  actor_id?: string;
  title?: string | null;
  message?: string | null;
  actor?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const NotificationBell = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Clean up any previous channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const currentUser = user;
    if (!currentUser) return;
    fetchNotifications(currentUser.id);

    const channelName = `notifications-${currentUser.id}-${Math.random().toString(36).slice(2, 10)}`;
    const ch = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUser.id}`,
        },
        async (payload) => {
          if (cancelled) return;
          if (payload.new.actor_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .eq("id", payload.new.actor_id)
              .single();

            const newNotification = {
              ...payload.new,
              actor: profile || {
                id: payload.new.actor_id,
                full_name: null,
                avatar_url: null,
              },
            };

            setNotifications(prev => [newNotification as Notification, ...prev].slice(0, 20));
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    channelRef.current = ch;

    return () => {
      cancelled = true;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id]);

  const fetchNotifications = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch actor profiles
      const actorIds = [...new Set(data?.map(n => n.actor_id).filter(Boolean) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", actorIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const notificationsWithActors = (data || []).map(notification => ({
        ...notification,
        actor: notification.actor_id ? (profilesMap.get(notification.actor_id) || {
          id: notification.actor_id,
          full_name: null,
          avatar_url: null,
        }) : undefined,
      }));

      setNotifications(notificationsWithActors as Notification[]);
      setUnreadCount(notificationsWithActors.filter(n => !n.is_read).length);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };


  const getNotificationText = (notification: Notification): string => {
    const actorName = notification.actor?.full_name || "Someone";
    
    switch (notification.type) {
      case "like":
        return `${actorName} liked your post`;
      case "comment":
        return `${actorName} commented on your post`;
      case "reaction":
        return `${actorName} reacted to your post`;
      case "repost":
        return `${actorName} shared your post`;
      case "follow":
        return `${actorName} started following you`;
      case "friend_request":
        return notification.message || `${actorName} sent you a friend request`;
      case "job_match":
        return "New job listing matches your preferences";
      case "job_application":
        return `${actorName} applied for your job position`;
      case "verification_request":
        return `${actorName} submitted a company verification request`;
      case "masterchef_payout":
        return "New KitchenStars payout pending";
      case "masterchef_withdrawal":
        return notification.message || "New KitchenStars withdrawal request";
      case "musician_withdrawal":
        return notification.message || "New Musician withdrawal request";
      case "instructor_withdrawal":
        return notification.message || "New Instructor withdrawal request";
      case "campaign_withdrawal":
        return notification.message || "New Campaign withdrawal request";
      case "weekly_xp_winner":
      case "weekly_xp_leaderboard":
        return notification.message || notification.title || "You won the Weekly XP Leaderboard!";
      default:
        return notification.message || notification.title || `${actorName} interacted with your content`;
    }
  };

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case "like":
        return "❤️";
      case "comment":
        return "💬";
      case "reaction":
        return "😊";
      case "repost":
        return "🔄";
      case "follow":
        return "👤";
      case "friend_request":
        return "🤝";
      case "job_match":
        return "💼";
      case "job_application":
        return "📝";
      case "verification_request":
        return "🏢";
      case "masterchef_payout":
        return "👨‍🍳";
      case "masterchef_withdrawal":
      case "musician_withdrawal":
      case "instructor_withdrawal":
      case "campaign_withdrawal":
        return "💰";
      case "weekly_xp_winner":
      case "weekly_xp_leaderboard":
        return "👑";
      default:
        return "🔔";
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      
      toast({
        title: "All notifications marked as read",
      });
    } catch (error: any) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);

    // Navigate based on notification type
    if (notification.type === "job_match" && notification.post_id) {
      navigate(`/jobs`);
    } else if (notification.type === "job_application") {
      navigate(`/employer-dashboard`);
    } else if (notification.type === "verification_request") {
      navigate(`/admin/verifications`);
    } else if (notification.type === "masterchef_payout") {
      navigate(`/admin/masterchef-payouts`);
    } else if (
      notification.type === "masterchef_withdrawal" ||
      notification.type === "musician_withdrawal" ||
      notification.type === "instructor_withdrawal" ||
      notification.type === "campaign_withdrawal"
    ) {
      navigate(notification.type === "campaign_withdrawal" ? `/admin/campaign-withdrawals` : `/admin/withdrawals`);
    } else if (notification.type === "weekly_xp_winner" || notification.type === "weekly_xp_leaderboard") {
      navigate(`/rewards`);
    } else if (notification.type === "follow" && notification.actor_id) {
      navigate(`/profile/${notification.actor_id}`);
    } else if (notification.type === "friend_request") {
      navigate(notification.action_url || `/friends?tab=requests`);
    } else if (notification.post_id) {
      navigate(`/post/${notification.post_id}`);
    } else if (notification.related_id) {
      // Generic fallback — try wall as a sensible default for content interactions
      navigate(`/wall`);
    } else {
      // Final fallback — open notifications center so click always does *something*
      navigate(`/wall`);
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-accent cursor-pointer transition-colors ${
                    !notification.is_read ? "bg-accent/50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={notification.actor?.avatar_url || undefined} />
                      <AvatarFallback>
                        {notification.actor?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-semibold">
                              {notification.actor?.full_name || "Someone"}
                            </span>{" "}
                            {getNotificationText(notification).replace(notification.actor?.full_name || "Someone", "").trim()}
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
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
