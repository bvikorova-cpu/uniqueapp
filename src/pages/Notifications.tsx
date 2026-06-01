import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, X, Trash2, MailOpen, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { getNotificationRoute } from "@/utils/notificationRoutes";

interface Notification {
  id: string;
  type: string;
  created_at: string;
  is_read: boolean;
  actor_id?: string | null;
  post_id?: string | null;
  related_id?: string | null;
  action_url?: string | null;
  title?: string | null;
  message?: string | null;
  actor?: { id: string; full_name: string | null; username: string | null; avatar_url: string | null } | null;
}

const displayNameOf = (actor?: Notification["actor"]) =>
  actor?.full_name?.trim() || actor?.username?.trim() || "Unknown user";

const notificationBody = (n: Notification) => {
  if (!n.actor) return n.message || n.title || `Notification (${n.type})`;
  const name = displayNameOf(n.actor);
  const text = n.message || n.title || `interacted with you (${n.type})`;
  return text.replace(name, "").trim() || text;
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "friend_request", label: "Friend requests" },
  { key: "like", label: "Likes" },
  { key: "comment", label: "Comments" },
  { key: "follow", label: "Follows" },
];

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!user) return;
    load();
    const ch = supabase
      .channel(`notifs-page-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);

    const actorIds = [...new Set((data || []).map((n: any) => n.actor_id).filter(Boolean))];
    const { data: profiles } = actorIds.length
      ? await (supabase as any).rpc("get_public_profiles", { ids: actorIds })
      : { data: [] as any[] };
    const map = new Map((profiles || []).map((p: any) => [p.id, p]));
    setItems(
      (data || []).map((n: any) => ({ ...n, actor: n.actor_id ? map.get(n.actor_id) || null : null }))
    );
    setLoading(false);
  };

  const filtered = items.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.is_read;
    return n.type === filter;
  });

  const unreadCount = items.filter((n) => !n.is_read).length;
  const requestsCount = items.filter((n) => n.type === "friend_request" && !n.is_read).length;

  const toggleRead = async (n: Notification) => {
    await supabase.from("notifications").update({ is_read: !n.is_read }).eq("id", n.id);
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: !n.is_read } : x)));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
    toast({ title: "All marked as read" });
  };

  const removeOne = async (n: Notification) => {
    await supabase.from("notifications").delete().eq("id", n.id);
    setItems((prev) => prev.filter((x) => x.id !== n.id));
  };

  const handleFriendRequest = async (n: Notification, action: "accept" | "decline") => {
    if (!user || !n.actor_id) return;
    try {
      if (action === "accept") {
        await supabase
          .from("friendships")
          .update({ status: "accepted" })
          .or(
            `and(user_id.eq.${n.actor_id},friend_id.eq.${user.id}),and(user_id.eq.${user.id},friend_id.eq.${n.actor_id})`
          )
          .eq("status", "pending");
        toast({ title: "Friend request accepted" });
      } else {
        await supabase
          .from("friendships")
          .delete()
          .or(
            `and(user_id.eq.${n.actor_id},friend_id.eq.${user.id}),and(user_id.eq.${user.id},friend_id.eq.${n.actor_id})`
          )
          .eq("status", "pending");
        toast({ title: "Friend request declined" });
      }
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
      setItems((prev) => prev.filter((x) => x.id !== n.id));
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message, variant: "destructive" });
    }
  };

  const navigateFromNotif = async (n: Notification) => {
    if (!n.is_read) await toggleRead({ ...n, is_read: false });
    navigate(getNotificationRoute(n));
  };

  if (!user) {
    return (
      <div className="container max-w-2xl py-10 text-center">
        <p className="text-muted-foreground">Please sign in to view your notifications.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-6 px-3 sm:px-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && <Badge variant="destructive">{unreadCount} unread</Badge>}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <MailOpen className="h-4 w-4 mr-2" /> Mark all read
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="w-max">
            {FILTERS.map((f) => (
              <TabsTrigger key={f.key} value={f.key} className="relative">
                {f.label}
                {f.key === "friend_request" && requestsCount > 0 && (
                  <Badge variant="destructive" className="ml-2 h-4 px-1.5 text-[10px]">
                    {requestsCount}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        <TabsContent value={filter} className="mt-4">
          {loading ? (
            <p className="text-center text-muted-foreground py-12">Loading…</p>
          ) : filtered.length === 0 ? (
            <Card className="p-10 text-center">
              <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nothing here yet.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {filtered.map((n) => (
                <Card
                  key={n.id}
                  className={`p-3 sm:p-4 transition-colors ${!n.is_read ? "bg-accent/40 border-primary/30" : ""}`}
                >
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={n.actor?.avatar_url || undefined} />
                      <AvatarFallback>
                        {n.actor ? displayNameOf(n.actor).charAt(0).toUpperCase() : <Bell className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => navigateFromNotif(n)}
                    >
                      <p className="text-sm break-words">
                        {n.actor && <span className="font-semibold">{displayNameOf(n.actor)} </span>}
                        {notificationBody(n)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                      {n.type === "friend_request" && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Button
                            size="sm"
                            className="h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFriendRequest(n, "accept");
                            }}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFriendRequest(n, "decline");
                            }}
                          >
                            <X className="h-3.5 w-3.5 mr-1" /> Decline
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        title={n.is_read ? "Mark unread" : "Mark read"}
                        onClick={() => toggleRead(n)}
                      >
                        {n.is_read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        title="Delete"
                        onClick={() => removeOne(n)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
