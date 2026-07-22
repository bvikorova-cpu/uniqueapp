import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Gift, Loader2, Trophy, Crown, Medal } from "lucide-react";
import { SendGiftDialog } from "./SendGiftDialog";

interface GiftTx {
  id: string;
  amount: number;
  message: string | null;
  created_at: string;
  sender_id: string;
  gift: { name: string; icon: string | null } | null;
  sender: { display_name: string | null; avatar_url: string | null } | null;
}

interface Props {
  creatorId: string;
  creatorName?: string;
  limit?: number;
}

type Period = "7d" | "30d" | "all";

const periodSince = (p: Period): Date | null => {
  if (p === "all") return null;
  const d = new Date();
  d.setDate(d.getDate() - (p === "7d" ? 7 : 30));
  return d;
};

export function GiftWall({ creatorId, creatorName = "creator", limit = 30 }: Props) {
  const [rows, setRows] = useState<GiftTx[]>([]);
  const [boardRows, setBoardRows] = useState<GiftTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [openSend, setOpenSend] = useState(false);
  const [period, setPeriod] = useState<Period>("30d");

  const load = async () => {
    const { data } = await supabase
      .from("creator_gift_transactions")
      .select(
        "id, amount, message, created_at, sender_id, gift:creator_gifts(name, icon), sender:profiles!creator_gift_transactions_sender_id_fkey(display_name, avatar_url)",
      )
      .eq("creator_id", creatorId)
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(limit);
    const list = (data as any as GiftTx[]) || [];
    setRows(list);
    setTotal(list.reduce((sum, r) => sum + Number(r.amount || 0), 0));
    setLoading(false);
  };

  const loadBoard = async () => {
    const since = periodSince(period);
    let q = supabase
      .from("creator_gift_transactions")
      .select(
        "id, amount, message, created_at, sender_id, gift:creator_gifts(name, icon), sender:profiles!creator_gift_transactions_sender_id_fkey(display_name, avatar_url)",
      )
      .eq("creator_id", creatorId)
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(500);
    if (since) q = q.gte("created_at", since.toISOString());
    const { data } = await q;
    setBoardRows((data as any as GiftTx[]) || []);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`gift-wall-${creatorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "creator_gift_transactions",
          filter: `creator_id=eq.${creatorId}` },
        () => {
          load();
          loadBoard();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorId]);

  useEffect(() => {
    loadBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorId, period]);

  const leaderboard = useMemo(() => {
    const map = new Map<
      string,
      { sender_id: string; name: string; avatar: string | null; total: number; count: number }
    >();
    for (const r of boardRows) { const key = r.sender_id;
      const prev = map.get(key) ?? {
        sender_id: key,
        name: r.sender?.display_name || "Anonymous",
        avatar: r.sender?.avatar_url ?? null,
        total: 0,
        count: 0 };
      prev.total += Number(r.amount || 0);
      prev.count += 1;
      map.set(key, prev);
    }
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);
  }, [boardRows]);

  const boardTotal = useMemo(
    () => boardRows.reduce((s, r) => s + Number(r.amount || 0), 0),
    [boardRows],
  );

  const rankIcon = (i: number) => {
    if (i === 0) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (i === 1) return <Medal className="h-4 w-4 text-slate-400" />;
    if (i === 2) return <Medal className="h-4 w-4 text-amber-700" />;
    return <span className="text-xs font-semibold text-muted-foreground w-4 text-center">{i + 1}</span>;
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="h-5 w-5 text-primary" />
          Gift Wall
          {total > 0 && (
            <Badge variant="secondary" className="ml-2">
              €{total.toFixed(2)} received
            </Badge>
          )}
        </CardTitle>
        <Button size="sm" onClick={() => setOpenSend(true)}>
          <Gift className="h-4 w-4 mr-2" />
          Send gift
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recent">
          <TabsList className="mb-3">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Trophy className="h-3.5 w-3.5 mr-1" />
              Top donors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              </div>
            ) : rows.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Be the first to send a gift to {creatorName}! 🎁
              </div>
            ) : (
              <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {rows.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors animate-in fade-in slide-in-from-bottom-1"
                  >
                    <div className="text-2xl" aria-hidden>
                      {r.gift?.icon ?? "🎁"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">
                          {r.sender?.display_name || "Anonymous"}
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          €{Number(r.amount).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        sent {r.gift?.name ?? "a gift"}
                        {r.message ? ` — "${r.message}"` : ""}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(r.created_at).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="leaderboard">
            <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
              <div className="flex gap-1 rounded-md bg-secondary/40 p-1">
                {(["7d", "30d", "all"] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      period === p
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p === "7d" ? "Last 7 days" : p === "30d" ? "Last 30 days" : "All time"}
                  </button>
                ))}
              </div>
              <Badge variant="secondary">Total €{boardTotal.toFixed(2)}</Badge>
            </div>

            {leaderboard.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No gifts in this period yet.
              </div>
            ) : (
              <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {leaderboard.map((d, i) => (
                  <li
                    key={d.sender_id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-5 flex justify-center">{rankIcon(i)}</div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={d.avatar ?? undefined} />
                      <AvatarFallback>{d.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{d.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {d.count} {d.count === 1 ? "gift" : "gifts"}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-primary">
                      €{d.total.toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <SendGiftDialog
        open={openSend}
        onOpenChange={setOpenSend}
        creatorId={creatorId}
        creatorName={creatorName}
      />
    </Card>
  );
}
