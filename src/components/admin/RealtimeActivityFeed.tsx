import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, UserPlus, CreditCard, AlertCircle, Zap, MessageSquare } from "lucide-react";
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

  useEffect(() => {
    // Initial load
    const loadInitial = async () => {
      const [users, txs, msgs] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("transactions").select("id, amount, item_type, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("contact_messages").select("id, name, subject, created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      const items: Event[] = [];
      users.data?.forEach((u: any) => items.push({
        id: `u-${u.id}`, type: "user",
        title: "New user registered", description: u.full_name || u.email || "Unknown",
        created_at: u.created_at,
      }));
      txs.data?.forEach((t: any) => items.push({
        id: `t-${t.id}`, type: "transaction",
        title: `${t.item_type || "Transaction"} • €${parseFloat(t.amount || 0).toFixed(2)}`,
        description: "Payment processed",
        created_at: t.created_at,
      }));
      msgs.data?.forEach((m: any) => items.push({
        id: `m-${m.id}`, type: "message",
        title: "Contact message", description: `${m.name}: ${m.subject || ""}`.slice(0, 60),
        created_at: m.created_at,
      }));

      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setEvents(items.slice(0, 12));
    };

    loadInitial();

    // Realtime subscriptions
    const channel = supabase
      .channel("admin-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, (payload: any) => {
        setEvents((prev) => [{
          id: `u-${payload.new.id}`, type: "user" as const,
          title: "New user registered",
          description: payload.new.full_name || payload.new.email || "Unknown",
          created_at: payload.new.created_at,
        }, ...prev].slice(0, 12));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "transactions" }, (payload: any) => {
        setEvents((prev) => [{
          id: `t-${payload.new.id}`, type: "transaction" as const,
          title: `${payload.new.item_type || "Transaction"} • €${parseFloat(payload.new.amount || 0).toFixed(2)}`,
          description: "Payment processed",
          created_at: payload.new.created_at,
        }, ...prev].slice(0, 12));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "contact_messages" }, (payload: any) => {
        setEvents((prev) => [{
          id: `m-${payload.new.id}`, type: "message" as const,
          title: "Contact message",
          description: `${payload.new.name}: ${payload.new.subject || ""}`.slice(0, 60),
          created_at: payload.new.created_at,
        }, ...prev].slice(0, 12));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

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
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-cyan-500/40 text-cyan-300">
            Realtime
          </Badge>
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
