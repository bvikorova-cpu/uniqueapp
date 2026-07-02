import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Coffee,
  Heart,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Undo2,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface TipHistoryProps {
  userId: string;
  isOwnProfile: boolean;
}

interface TipRow {
  id: string;
  amount_cents: number;
  recipient_amount_cents: number | null;
  message: string | null;
  created_at: string;
  status: string;
  sender_id: string;
  refunded_at?: string | null;
  sender?: { full_name: string | null; username: string | null } | null;
}

interface Stats {
  total_count: number;
  total_amount_cents: number;
  total_recipient_cents: number;
}

const STATUS_META: Record<
  string,
  { label: string; icon: any; cls: string }
> = {
  completed: {
    label: "Received",
    icon: CheckCircle2,
    cls: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  },
  pending: {
    label: "Processing",
    icon: Clock,
    cls: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    cls: "bg-rose-500/15 text-rose-300 border-rose-400/30",
  },
  refunded: {
    label: "Refunded",
    icon: Undo2,
    cls: "bg-slate-500/20 text-slate-300 border-slate-400/30",
  },
};

export const TipHistory = ({ userId, isOwnProfile }: TipHistoryProps) => {
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [tips, setTips] = useState<TipRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: statsRows }, { data: tipsRows }] = await Promise.all([
      supabase.rpc("get_profile_tip_stats", { _recipient: userId }),
      supabase
        .from("profile_tips")
        .select(
          "id, amount_cents, recipient_amount_cents, message, created_at, status, sender_id, refunded_at",
        )
        .eq("recipient_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const s = Array.isArray(statsRows) ? statsRows[0] : statsRows;
    setStats(s ?? { total_count: 0, total_amount_cents: 0, total_recipient_cents: 0 });

    let list: TipRow[] = (tipsRows ?? []) as TipRow[];
    if (list.length && isOwnProfile) {
      const ids = Array.from(new Set(list.map((t) => t.sender_id)));
      const { data: senders } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .in("id", ids);
      const map = new Map((senders ?? []).map((p: any) => [p.id, p]));
      list = list.map((t) => ({ ...t, sender: map.get(t.sender_id) ?? null }));
    }
    setTips(list);
    setLoading(false);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      await load();
      if (!alive) return;
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isOwnProfile]);

  const handleRefund = async (tipId: string) => {
    setRefundingId(tipId);
    try {
      const { data, error } = await supabase.functions.invoke("refund-profile-tip", {
        body: { tipId, reason: "requested_by_recipient" },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast({ title: "Tip refunded", description: "The transfer was cancelled via Stripe." });
      setConfirmId(null);
      await load();
    } catch (e: any) {
      toast({
        title: "Refund zlyhal",
        description: e?.message || "Try again later",
        variant: "destructive",
      });
      setConfirmId(null);
    } finally {
      setRefundingId(null);
    }
  };

  const totalEur = (stats?.total_amount_cents ?? 0) / 100;
  const netEur = (stats?.total_recipient_cents ?? 0) / 100;

  return (
    <Card className="p-4 bg-card/60 backdrop-blur border-violet-400/20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold flex items-center gap-2">
          <Coffee className="h-4 w-4 text-violet-400" />
          Received tips
        </h3>
        <TrendingUp className="h-4 w-4 text-violet-400" />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-lg bg-violet-500/10 border border-violet-400/20 p-2 text-center">
          <div className="text-[10px] text-muted-foreground uppercase">Count</div>
          <div className="font-black text-lg">{stats?.total_count ?? 0}</div>
        </div>
        <div className="rounded-lg bg-violet-500/10 border border-violet-400/20 p-2 text-center">
          <div className="text-[10px] text-muted-foreground uppercase">Amount</div>
          <div className="font-black text-lg">€{totalEur.toFixed(2)}</div>
        </div>
        <div className="rounded-lg bg-violet-500/10 border border-violet-400/20 p-2 text-center">
          <div className="text-[10px] text-muted-foreground uppercase">Net</div>
          <div className="font-black text-lg text-violet-300">€{netEur.toFixed(2)}</div>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground text-center py-4">Loading…</p>
      ) : tips.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          No tips yet. Be the first to send support!
        </p>
      ) : (
        <ul className="space-y-2 max-h-[28rem] overflow-y-auto">
          {tips.map((t) => {
            const meta = STATUS_META[t.status] ?? STATUS_META.pending;
            const Icon = meta.icon;
            const canRefund = isOwnProfile && t.status === "completed";
            return (
              <li
                key={t.id}
                className="flex items-start gap-2 rounded-md border border-violet-400/10 bg-background/40 p-2"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                  <Heart className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold truncate">
                      {isOwnProfile
                        ? t.sender?.full_name || t.sender?.username || "Anonymous donor"
                        : "Tipper"}
                    </span>
                    <span
                      className={`text-sm font-black shrink-0 ${
                        t.status === "refunded" ? "line-through text-muted-foreground" : "text-violet-300"
                      }`}
                    >
                      €{(t.amount_cents / 100).toFixed(2)}
                    </span>
                  </div>
                  {t.message && (
                    <p className="text-xs italic text-muted-foreground line-clamp-2">"{t.message}"</p>
                  )}
                  <div className="flex items-center justify-between gap-2 mt-1 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`gap-1 text-[10px] py-0 px-1.5 ${meta.cls}`}>
                        <Icon className="h-3 w-3" />
                        {meta.label}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {canRefund && (
                      <AlertDialog open={confirmId === t.id} onOpenChange={(open) => { if (!open) setConfirmId(null); }}>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-[10px] gap-1 text-rose-300 hover:text-rose-200 hover:bg-rose-500/10"
                            disabled={!!refundingId}
                            onClick={() => setConfirmId(t.id)}
                          >
                            {refundingId === t.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Undo2 className="h-3 w-3" />
                            )}
                            Refund
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Refund tip €{(t.amount_cents / 100).toFixed(2)}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              The amount will be refunded to the donor via Stripe. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={refundingId === t.id}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRefund(t.id)}
                              disabled={refundingId === t.id}
                            >
                              {refundingId === t.id ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : null}
                              Refund
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};
