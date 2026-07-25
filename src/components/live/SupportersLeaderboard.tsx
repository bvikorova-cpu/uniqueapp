import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Crown, Medal, Sparkles } from "lucide-react";

interface Row {
  sender_id: string;
  total_cents: number;
  count: number;
  display_name?: string | null;
  avatar_url?: string | null;
}

interface Props {
  streamId: string;
}

const rankIcon = (i: number) => {
  if (i === 0) return <Crown className="h-4 w-4 text-yellow-500" />;
  if (i === 1) return <Trophy className="h-4 w-4 text-slate-400" />;
  if (i === 2) return <Medal className="h-4 w-4 text-amber-600" />;
  return <Sparkles className="h-4 w-4 text-muted-foreground" />;
};

export const SupportersLeaderboard = ({ streamId }: Props) => {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!streamId) return;
    let cancelled = false;

    const load = async () => {
      const { data } = await supabase
        .from("live_super_chats" as any)
        .select("sender_id, amount_cents")
        .eq("stream_id", streamId);
      const agg = new Map<string, { total: number; count: number }>();
      (data ?? []).forEach((r: any) => {
        const cur = agg.get(r.sender_id) ?? { total: 0, count: 0 };
        cur.total += r.amount_cents;
        cur.count += 1;
        agg.set(r.sender_id, cur);
      });
      const list = Array.from(agg.entries())
        .map(([sender_id, v]) => ({ sender_id, total_cents: v.total, count: v.count }))
        .sort((a, b) => b.total_cents - a.total_cents)
        .slice(0, 10);

      if (list.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", list.map((r) => r.sender_id));
        list.forEach((r) => {
          const p = profiles?.find((x: any) => x.id === r.sender_id);
          r.display_name = p?.full_name;
          r.avatar_url = p?.avatar_url;
        });
      }
      if (!cancelled) setRows(list);
    };

    load();
    const channel = supabase
      .channel(`sup-lb-${streamId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_super_chats", filter: `stream_id=eq.${streamId}` },
        () => load(),
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [streamId]);

  return (
    <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-pink-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" /> Top Supporters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">Be the first to tip this stream ✨</p>
        ) : (
          rows.map((r, i) => (
            <div key={r.sender_id} className="flex items-center gap-3">
              <div className="w-6 flex justify-center">{rankIcon(i)}</div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={r.avatar_url ?? undefined} />
                <AvatarFallback>{(r.display_name ?? "?").slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.display_name ?? "Anonymous fan"}</p>
                <p className="text-xs text-muted-foreground">{r.count} tip{r.count > 1 ? "s" : ""}</p>
              </div>
              <span className="text-sm font-bold text-amber-600">
                €{(r.total_cents / 100).toFixed(2)}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
