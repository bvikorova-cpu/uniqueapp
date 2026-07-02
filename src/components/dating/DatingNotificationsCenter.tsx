import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Heart, MessageCircle, Sparkles, CheckCheck, Trash2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { PushNotificationToggle } from "@/components/PushNotificationToggle";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type Filter = "all" | "likes" | "matches" | "messages" | "system";

interface Notif {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url: string | null;
}

const DATING_TYPES = [
  "dating_like", "dating_super_like", "dating_match", "dating_message",
  "dating_photo_like", "dating_event", "dating_poll", "dating_date_plan",
  "dating_gift", "dating_boost", "like", "match", "message",
];

export function DatingNotificationsCenter() {
  const { toast } = useToast();
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data, error } = await supabase
      .from("notifications")
      .select("id,type,title,message,is_read,created_at,action_url")
      .eq("user_id", user.id)
      .in("type", DATING_TYPES)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setItems((data as Notif[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    let channel: any;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      channel = supabase
        .channel(`dating-notif-${user.id}`)
        .on("postgres_changes",
          { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          () => load())
        .subscribe();
    })();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    const map: Record<Filter, string[]> = {
      all: [],
      likes: ["dating_like", "dating_super_like", "dating_photo_like", "like"],
      matches: ["dating_match", "match"],
      messages: ["dating_message", "message"],
      system: ["dating_event", "dating_poll", "dating_date_plan", "dating_gift", "dating_boost"],
    };
    return items.filter((n) => map[filter].includes(n.type));
  }, [items, filter]);

  const unread = items.filter((i) => !i.is_read).length;

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setItems((p) => p.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true })
      .eq("user_id", user.id).in("type", DATING_TYPES).eq("is_read", false);
    setItems((p) => p.map((n) => ({ ...n, is_read: true })));
    toast({ title: "Marked all as read" });
  };

  const remove = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setItems((p) => p.filter((n) => n.id !== id));
  };

  const icon = (t: string) => {
    if (t.includes("like")) return <Heart className="h-4 w-4 text-pink-500" />;
    if (t.includes("match")) return <Sparkles className="h-4 w-4 text-primary" />;
    if (t.includes("message")) return <MessageCircle className="h-4 w-4 text-blue-500" />;
    return <Bell className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Card className="max-w-3xl mx-auto bg-card/70 backdrop-blur border-border/50">
      <FloatingHowItWorks
        title={"Dating Notifications Center"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" /> Notification Center
          {unread > 0 && <Badge variant="default">{unread}</Badge>}
        </CardTitle>
        <div className="flex items-center gap-2">
          <PushNotificationToggle showLabel={false} />
          <Button size="sm" variant="outline" onClick={markAllRead} disabled={unread === 0}>
            <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="likes">Likes</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
        </Tabs>

        <ScrollArea className="h-[480px] pr-2">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p>No notifications</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((n) => (
                <li
                  key={n.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 transition ${
                    n.is_read ? "bg-muted/20 border-border/40" : "bg-primary/5 border-primary/30"
                  }`}
                >
                  <div className="mt-0.5">{icon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{n.title}</p>
                      {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {!n.is_read && (
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => markRead(n.id)} title="Mark read">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(n.id)} title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default DatingNotificationsCenter;
