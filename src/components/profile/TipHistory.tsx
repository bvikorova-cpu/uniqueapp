import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Coffee, Heart, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
  sender_id: string;
  sender?: { full_name: string | null; username: string | null; avatar_url: string | null } | null;
}

interface Stats {
  total_count: number;
  total_amount_cents: number;
  total_recipient_cents: number;
}

export const TipHistory = ({ userId, isOwnProfile }: TipHistoryProps) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [tips, setTips] = useState<TipRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const [{ data: statsRows }, { data: tipsRows }] = await Promise.all([
        supabase.rpc("get_profile_tip_stats", { _recipient: userId }),
        supabase
          .from("profile_tips")
          .select("id, amount_cents, recipient_amount_cents, message, created_at, sender_id")
          .eq("recipient_id", userId)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      if (!alive) return;

      const s = Array.isArray(statsRows) ? statsRows[0] : statsRows;
      setStats(s ?? { total_count: 0, total_amount_cents: 0, total_recipient_cents: 0 });

      // Fetch senders (only visible to recipient — RLS hides for others, list may be empty)
      let list: TipRow[] = (tipsRows ?? []) as TipRow[];
      if (list.length && isOwnProfile) {
        const ids = Array.from(new Set(list.map((t) => t.sender_id)));
        const { data: senders } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", ids);
        const map = new Map((senders ?? []).map((p: any) => [p.id, p]));
        list = list.map((t) => ({ ...t, sender: map.get(t.sender_id) ?? null }));
      }
      setTips(list);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [userId, isOwnProfile]);

  const totalEur = (stats?.total_amount_cents ?? 0) / 100;
  const netEur = (stats?.total_recipient_cents ?? 0) / 100;

  return (
    <Card className="p-4 bg-card/60 backdrop-blur border-violet-400/20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold flex items-center gap-2">
          <Coffee className="h-4 w-4 text-violet-400" />
          Prijaté tipy
        </h3>
        <TrendingUp className="h-4 w-4 text-violet-400" />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-lg bg-violet-500/10 border border-violet-400/20 p-2 text-center">
          <div className="text-[10px] text-muted-foreground uppercase">Počet</div>
          <div className="font-black text-lg">{stats?.total_count ?? 0}</div>
        </div>
        <div className="rounded-lg bg-violet-500/10 border border-violet-400/20 p-2 text-center">
          <div className="text-[10px] text-muted-foreground uppercase">Suma</div>
          <div className="font-black text-lg">€{totalEur.toFixed(2)}</div>
        </div>
        <div className="rounded-lg bg-violet-500/10 border border-violet-400/20 p-2 text-center">
          <div className="text-[10px] text-muted-foreground uppercase">Netto</div>
          <div className="font-black text-lg text-violet-300">€{netEur.toFixed(2)}</div>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground text-center py-4">Načítavam…</p>
      ) : tips.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          Zatiaľ žiadne tipy. Buď prvý kto pošle podporu!
        </p>
      ) : (
        <ul className="space-y-2 max-h-72 overflow-y-auto">
          {tips.map((t) => (
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
                      ? t.sender?.full_name || t.sender?.username || "Anonymný darca"
                      : "Tipper"}
                  </span>
                  <span className="text-sm font-black text-violet-300 shrink-0">
                    €{(t.amount_cents / 100).toFixed(2)}
                  </span>
                </div>
                {t.message && (
                  <p className="text-xs italic text-muted-foreground line-clamp-2">"{t.message}"</p>
                )}
                <p className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
