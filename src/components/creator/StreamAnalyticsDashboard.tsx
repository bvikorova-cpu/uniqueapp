import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Eye, TrendingUp, Sparkles, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  influencerId: string;
}

interface StreamRow {
  id: string;
  title: string;
  started_at: string | null;
  ended_at: string | null;
  viewer_count: number;
  total_tips_cents: number;
  is_live: boolean;
}

export function StreamAnalyticsDashboard({ influencerId }: Props) {
  const { data: streams = [], isLoading } = useQuery({
    queryKey: ["creator-streams", influencerId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("live_streams")
        .select("id,title,started_at,ended_at,viewer_count,total_tips_cents,is_live")
        .eq("influencer_id", influencerId)
        .order("started_at", { ascending: false, nullsFirst: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as StreamRow[];
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading analytics...</p>;
  if (!streams.length)
    return <p className="text-sm text-muted-foreground py-8 text-center">No streams yet</p>;

  return (
    <div className="space-y-4">
      {streams.map((s) => (
        <StreamAnalyticsCard key={s.id} stream={s} />
      ))}
    </div>
  );
}

function StreamAnalyticsCard({ stream }: { stream: StreamRow }) {
  const { data } = useQuery({
    queryKey: ["stream-analytics", stream.id],
    queryFn: async () => {
      const [sessions, topFans] = await Promise.all([
        (supabase as any)
          .from("stream_viewer_sessions")
          .select("user_id,watch_seconds,joined_at,left_at")
          .eq("stream_id", stream.id),
        (supabase as any)
          .from("live_super_chats")
          .select("sender_id,amount_cents")
          .eq("stream_id", stream.id),
      ]);

      const rows = (sessions.data ?? []) as any[];
      const uniqueViewers = new Set(rows.map((r) => r.user_id).filter(Boolean)).size;
      const avgWatch =
        rows.length > 0
          ? Math.round(rows.reduce((s, r) => s + (r.watch_seconds || 0), 0) / rows.length)
          : 0;

      // Concurrent-viewer peak via sweep over join/leave events
      const events: { t: number; delta: number }[] = [];
      rows.forEach((r) => {
        if (r.joined_at) events.push({ t: new Date(r.joined_at).getTime(), delta: 1 });
        if (r.left_at) events.push({ t: new Date(r.left_at).getTime(), delta: -1 });
      });
      events.sort((a, b) => a.t - b.t);
      let peak = 0;
      let cur = 0;
      for (const e of events) {
        cur += e.delta;
        if (cur > peak) peak = cur;
      }

      const tipsByUser = new Map<string, number>();
      (topFans.data ?? []).forEach((r: any) => {
        if (!r.sender_id) return;
        tipsByUser.set(r.sender_id, (tipsByUser.get(r.sender_id) || 0) + r.amount_cents);
      });
      const top = Array.from(tipsByUser.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      let names: Record<string, string> = {};
      if (top.length) {
        const { data: profs } = await (supabase as any)
          .from("profiles")
          .select("id,full_name,username")
          .in("id", top.map((t) => t[0]));
        (profs ?? []).forEach((p: any) => {
          names[p.id] = p.full_name || p.username || "Fan";
        });
      }

      const totalTips = (topFans.data ?? []).reduce(
        (s: number, r: any) => s + (r.amount_cents || 0),
        0
      );

      return {
        uniqueViewers,
        avgWatch,
        peak,
        totalTips,
        topFans: top.map(([id, cents]) => ({ id, cents, name: names[id] ?? "Fan" })),
      };
    },
  });

  const fmtSec = (s: number) => {
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {stream.is_live && (
            <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
          )}
          <span className="truncate">{stream.title}</span>
          {stream.started_at && (
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {formatDistanceToNow(new Date(stream.started_at), { addSuffix: true })}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Stat icon={<Users className="h-4 w-4" />} label="Unique viewers" value={data?.uniqueViewers ?? 0} />
          <Stat icon={<TrendingUp className="h-4 w-4" />} label="Peak concurrent" value={data?.peak ?? 0} />
          <Stat icon={<Clock className="h-4 w-4" />} label="Avg watch" value={fmtSec(data?.avgWatch ?? 0)} />
          <Stat icon={<Sparkles className="h-4 w-4" />} label="Tips" value={`€${((data?.totalTips ?? 0) / 100).toFixed(2)}`} />
        </div>

        {data?.topFans && data.topFans.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
              Top supporters
            </p>
            <div className="space-y-1">
              {data.topFans.map((f, i) => (
                <div key={f.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground">#{i + 1}</span>
                    {f.name}
                  </span>
                  <span className="font-bold">€{(f.cents / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-lg font-bold mt-1">{value}</div>
    </div>
  );
}
