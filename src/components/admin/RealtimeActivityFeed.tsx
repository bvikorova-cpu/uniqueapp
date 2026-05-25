import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, UserPlus, CreditCard, AlertCircle, Zap, MessageSquare, Volume2, VolumeX, Bell, BellOff, Pause, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface Event {
  id: string;
  type: "user" | "transaction" | "subscription" | "message" | "audit";
  title: string;
  description: string;
  created_at: string;
}

const iconMap = {
  user: UserPlus,
  transaction: CreditCard,
  subscription: Zap,
  message: MessageSquare,
  audit: AlertCircle,
};

const colorMap = {
  user: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  transaction: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  subscription: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  message: "text-pink-400 bg-pink-500/10 border-pink-500/30",
  audit: "text-purple-400 bg-purple-500/10 border-purple-500/30",
};

export const RealtimeActivityFeed = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem("admin-feed-sound") === "1");
  const [notifOn, setNotifOn] = useState(() => localStorage.getItem("admin-feed-notif") === "1");
  const [paused, setPaused] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBleep = (type: Event["type"]) => {
    if (!soundOn) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const freq = type === "transaction" ? 880 : type === "user" ? 660 : 440;
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  const showNotif = (title: string, body: string) => {
    if (!notifOn) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    try {
      new Notification(title, { body, icon: "/favicon.ico", tag: "admin-feed" });
    } catch {}
  };

  const toggleSound = () => {
    const v = !soundOn;
    setSoundOn(v);
    localStorage.setItem("admin-feed-sound", v ? "1" : "0");
  };

  const toggleNotif = async () => {
    if (!notifOn && typeof Notification !== "undefined" && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    const v = !notifOn && (typeof Notification === "undefined" ? false : Notification.permission === "granted");
    setNotifOn(v);
    localStorage.setItem("admin-feed-notif", v ? "1" : "0");
  };

  useEffect(() => {
    // Initial load
    const loadInitial = async () => {
      const [users, txs, msgs, tickets] = await Promise.all([
        supabase.from("profiles_public" as any).select("id, full_name, email, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("transactions").select("id, amount, item_type, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("contact_messages").select("id, name, subject, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("support_tickets").select("id, name, subject, ticket_number, created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      const items: Event[] = [];
      users.data?.forEach((u: any) => items.push({
        id: `u-${u.id}`, type: "user" as const,
        title: "New user registered", description: u.full_name || u.email || "Unknown",
        created_at: u.created_at,
      }));
      txs.data?.forEach((t: any) => items.push({
        id: `t-${t.id}`, type: "transaction" as const,
        title: `${t.item_type || "Transaction"} • €${parseFloat(t.amount || 0).toFixed(2)}`,
        description: "Payment processed",
        created_at: t.created_at,
      }));
      msgs.data?.forEach((m: any) => items.push({
        id: `m-${m.id}`, type: "message" as const,
        title: "Contact message", description: `${m.name}: ${m.subject || ""}`.slice(0, 60),
        created_at: m.created_at,
      }));
      tickets.data?.forEach((t: any) => items.push({
        id: `st-${t.id}`, type: "message" as const,
        title: `Support ticket #${t.ticket_number || ""}`, description: `${t.name}: ${t.subject || ""}`.slice(0, 60),
        created_at: t.created_at,
      }));

      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setEvents(items.slice(0, 12));
    };

    loadInitial();

    // Realtime subscriptions
    const channel = supabase
      .channel("admin-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, (payload: any) => {
        if (paused) return;
        const desc = payload.new.full_name || payload.new.email || "Unknown";
        setEvents((prev) => [{
          id: `u-${payload.new.id}`, type: "user" as const,
          title: "New user registered", description: desc,
          created_at: payload.new.created_at,
        }, ...prev].slice(0, 12));
        playBleep("user");
        showNotif("👤 New user registered", desc);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "transactions" }, (payload: any) => {
        if (paused) return;
        const t = `${payload.new.item_type || "Transaction"} • €${parseFloat(payload.new.amount || 0).toFixed(2)}`;
        setEvents((prev) => [{
          id: `t-${payload.new.id}`, type: "transaction" as const,
          title: t, description: "Payment processed",
          created_at: payload.new.created_at,
        }, ...prev].slice(0, 12));
        playBleep("transaction");
        showNotif("💰 New transaction", t);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "contact_messages" }, (payload: any) => {
        if (paused) return;
        const desc = `${payload.new.name}: ${payload.new.subject || ""}`.slice(0, 60);
        setEvents((prev) => [{
          id: `m-${payload.new.id}`, type: "message" as const,
          title: "Contact message", description: desc,
          created_at: payload.new.created_at,
        }, ...prev].slice(0, 12));
        playBleep("message");
        showNotif("✉️ Contact message", desc);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_tickets" }, (payload: any) => {
        if (paused) return;
        const desc = `${payload.new.name}: ${payload.new.subject || ""}`.slice(0, 60);
        setEvents((prev) => [{
          id: `st-${payload.new.id}`, type: "message" as const,
          title: `Support ticket #${payload.new.ticket_number || ""}`, description: desc,
          created_at: payload.new.created_at,
        }, ...prev].slice(0, 12));
        playBleep("message");
        showNotif("🎫 Support ticket", desc);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, soundOn, notifOn]);

  return (
    <Card className="bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-xl border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <div className="relative">
              <Activity className="h-5 w-5 text-cyan-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400" />
            </div>
            Live Activity Stream
          </span>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setPaused((p) => !p)}
              title={paused ? "Resume" : "Pause"}
              className="h-7 w-7"
            >
              {paused ? <Play className="h-3.5 w-3.5 text-amber-400" /> : <Pause className="h-3.5 w-3.5 text-cyan-300" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleSound}
              title={soundOn ? "Mute sounds" : "Enable sounds"}
              className="h-7 w-7"
            >
              {soundOn ? <Volume2 className="h-3.5 w-3.5 text-emerald-400" /> : <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleNotif}
              title={notifOn ? "Disable notifications" : "Enable desktop notifications"}
              className="h-7 w-7"
            >
              {notifOn ? <Bell className="h-3.5 w-3.5 text-emerald-400" /> : <BellOff className="h-3.5 w-3.5 text-muted-foreground" />}
            </Button>
            <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${paused ? "border-amber-500/40 text-amber-300" : "border-cyan-500/40 text-cyan-300"}`}>
              {paused ? "Paused" : "Live"}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto scrollbar-hide space-y-2">
        <AnimatePresence initial={false}>
          {events.map((event) => {
            const Icon = iconMap[event.type];
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-3 p-3 rounded-lg border ${colorMap[event.type]}`}
              >
                <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{event.description}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                    {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                  </p>
                </div>
              </motion.div>
            );
          })}
          {events.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Waiting for activity…</p>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
