import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface T {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  category: string;
  priority: string;
  created_at: string;
}

const STATUS_META: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  open: { icon: Clock, color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30", label: "Open" },
  in_progress: { icon: Loader2, color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30", label: "In progress" },
  resolved: { icon: CheckCircle2, color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30", label: "Resolved" },
  closed: { icon: CheckCircle2, color: "bg-muted text-muted-foreground border-border", label: "Closed" },
  waiting: { icon: AlertCircle, color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30", label: "Waiting on you" },
};

export const MyTickets = ({ userId }: { userId: string }) => {
  const [tickets, setTickets] = useState<T[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("support_tickets")
        .select("id, ticket_number, subject, status, category, priority, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      setTickets((data as T[]) ?? []);
    };
    load();

    const channel = supabase
      .channel(`my-tickets-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_tickets", filter: `user_id=eq.${userId}` },
        load,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (tickets.length === 0) return null;

  return (
    <Card className="p-5 mb-6 border-2">
      <div className="flex items-center gap-2 mb-4">
        <Ticket className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-base">My Tickets</h3>
        <Badge variant="secondary" className="text-[10px]">{tickets.length}</Badge>
      </div>
      <div className="space-y-2">
        {tickets.map((t) => {
          const meta = STATUS_META[t.status] ?? STATUS_META.open;
          const Icon = meta.icon;
          return (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className={`shrink-0 px-2 py-1 rounded-md border text-[10px] font-bold uppercase flex items-center gap-1 ${meta.color}`}>
                <Icon className={`h-3 w-3 ${t.status === "in_progress" ? "animate-spin" : ""}`} />
                {meta.label}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{t.subject}</p>
                <p className="text-[11px] text-muted-foreground">
                  {t.ticket_number} · {t.category} · {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
