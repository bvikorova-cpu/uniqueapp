import { useEffect, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url: string | null;
  metadata: any;
  is_read: boolean;
  created_at: string;
  user_id: string;
  actor_id: string | null;
  comment_id: string | null;
  post_id: string | null;
  related_id: string | null;
  repost_id: string | null;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();

    // Subscribe to real-time notification updates
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "tipster_application")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Cast to our interface since tipster_application notifications have the right structure
      const typedNotifications = (data || []) as Notification[];
      setNotifications(typedNotifications);
      setUnreadCount(typedNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
      
      await loadNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleApprove = async (notification: Notification) => {
    if (!notification.metadata?.tipster_id) return;
    
    setActionLoading(notification.id);
    try {
      const { error } = await supabase
        .from("sports_tipsters")
        .update({ status: "active" })
        .eq("id", notification.metadata.tipster_id);

      if (error) throw error;

      toast({
        title: "Tipster approved",
        description: `${notification.metadata.tipster_name} has been approved`,
      });

      await markAsRead(notification.id);
    } catch (error) {
      console.error("Error approving tipster:", error);
      toast({
        title: "Error",
        description: "Failed to approve tipster",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (notification: Notification) => {
    if (!notification.metadata?.tipster_id) return;
    
    setActionLoading(notification.id);
    try {
      const { error } = await supabase
        .from("sports_tipsters")
        .update({ status: "rejected" })
        .eq("id", notification.metadata.tipster_id);

      if (error) throw error;

      toast({
        title: "Tipster rejected",
        description: `${notification.metadata.tipster_name} has been rejected`,
      });

      await markAsRead(notification.id);
    } catch (error) {
      console.error("Error rejecting tipster:", error);
      toast({
        title: "Error",
        description: "Failed to reject tipster",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} new</Badge>
            )}
          </div>
          
          <ScrollArea className="h-[400px]">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No notifications
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      !notification.is_read ? "bg-accent" : "bg-background"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h5 className="font-semibold text-sm">
                            {notification.title}
                          </h5>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.created_at).toLocaleString('en-US')}
                          </p>
                        </div>
                      </div>
                      
                      {notification.type === "tipster_application" && !notification.is_read && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(notification)}
                            disabled={actionLoading === notification.id}
                            className="flex-1"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(notification)}
                            disabled={actionLoading === notification.id}
                            className="flex-1"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {notification.is_read && (
                        <Badge variant="outline" className="mt-2">
                          Processed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
