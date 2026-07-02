import { useEffect, useState } from "react";
import { Bell, MessageCircle, Award, Trophy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface MTNotif {
  id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
}

const MEGATALENT_TYPES = [
  "megatalent_comment",
  "megatalent_endorsement",
  "megatalent_prediction_win",
];

const iconFor = (type: string) => {
  switch (type) {
    case "megatalent_comment": return <MessageCircle className="h-4 w-4 text-primary" />;
    case "megatalent_endorsement": return <Award className="h-4 w-4 text-accent" />;
    case "megatalent_prediction_win": return <Trophy className="h-4 w-4 text-yellow-400" />;
    default: return <Bell className="h-4 w-4" />;
  }
};

export const MegatalentNotificationBell = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<MTNotif[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("id,type,title,message,is_read,created_at")
      .eq("user_id", user.id)
      .in("type", MEGATALENT_TYPES)
      .order("created_at", { ascending: false })
      .limit(30);
    if (data) setItems(data as MTNotif[]);
  };

  useEffect(() => {
    if (!user) return;
    load();
    const channel = supabase
      .channel(`mt-notif:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as MTNotif;
          if (MEGATALENT_TYPES.includes(n.type)) {
            setItems((prev) => [n, ...prev].slice(0, 30));
          }
        }
      )
      .subscribe();
    return (
    <>
      <FloatingHowItWorks title={"Megatalent Notification Bell - How it works"} steps={[{ title: 'Open', desc: 'Access the Megatalent Notification Bell section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Megatalent Notification Bell.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const unread = items.filter((i) => !i.is_read).length;

  const markAllRead = async () => {
    if (!user || unread === 0) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .in("type", MEGATALENT_TYPES)
      .eq("is_read", false);
    setItems((prev) => prev.map((i) => ({ ...i, is_read: true })));
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative backdrop-blur-xl bg-card/40 border-primary/30">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] bg-primary">
              {unread > 9 ? "9+" : unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 backdrop-blur-xl bg-card/95 border-primary/20">
        <div className="flex items-center justify-between p-3 border-b border-border/40">
          <div className="font-semibold text-sm flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Megatalent alerts
          </div>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
              <Check className="h-3 w-3 mr-1" /> Mark read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications yet. Comments, endorsements and prediction wins will appear here.
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {items.map((n) => (
                <li key={n.id} className={`p-3 flex gap-3 ${!n.is_read ? "bg-primary/5" : ""}`}>
                  <div className="mt-0.5">{iconFor(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{n.title}</div>
                    {n.message && (
                      <div className="text-xs text-muted-foreground line-clamp-2">{n.message}</div>
                    )}
                    <div className="text-[10px] text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default MegatalentNotificationBell;
