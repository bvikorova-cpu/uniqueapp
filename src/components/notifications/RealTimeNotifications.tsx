import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Bell, Heart, MessageCircle, UserPlus, AtSign } from "lucide-react";
import { playNotificationChime } from "@/lib/notificationChime";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention" | "message";
  message: string;
  created_at: string;
  read: boolean;
}

export const useRealTimeNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time notifications
    const channel = supabase
      .channel(`user:${user.id}:notifications`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as any;
          
          // Show toast notification
          const icons: Record<string, React.ReactNode> = {
            like: <Heart className="h-4 w-4 text-red-500" />,
            comment: <MessageCircle className="h-4 w-4 text-blue-500" />,
            follow: <UserPlus className="h-4 w-4 text-green-500" />,
            mention: <AtSign className="h-4 w-4 text-purple-500" />,
            message: <Bell className="h-4 w-4 text-yellow-500" />,
          };

          // Play distinct notification chime (different from message chime)
          if (newNotification.type !== "message") {
            playNotificationChime();
          }

          toast(newNotification.message || "New notification", {
            icon: icons[newNotification.type] || <Bell className="h-4 w-4" />,
          });

          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        setNotifications(data as unknown as Notification[]);
        setUnreadCount(data.filter((n: any) => !n.read).length);
      }
    };

    fetchNotifications();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
};

export default useRealTimeNotifications;
