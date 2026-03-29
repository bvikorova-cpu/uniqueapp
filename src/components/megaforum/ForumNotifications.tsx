import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ForumNotificationsProps {
  userId: string;
  onViewPost?: (postId: string) => void;
}

export const ForumNotifications = ({ userId, onViewPost }: ForumNotificationsProps) => {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["forum-notifications", userId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("forum_notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 15000,
  });

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  const markAllRead = useMutation({
    mutationFn: async () => {
      await (supabase as any)
        .from("forum_notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum-notifications"] }),
  });

  const getTimeSince = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (diff < 60) return "now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[8px] bg-destructive">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b border-border/50">
          <h4 className="font-bold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-[10px] h-6" onClick={() => markAllRead.mutate()}>
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-64">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground text-xs py-8">No notifications yet</p>
          ) : (
            notifications.map((n: any) => (
              <button
                key={n.id}
                onClick={() => n.post_id && onViewPost?.(n.post_id)}
                className="w-full text-left p-3 border-b border-border/20 hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.is_read ? "bg-primary" : "bg-transparent"}`} />
                  <div>
                    <p className="text-xs">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{getTimeSince(n.created_at)}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
