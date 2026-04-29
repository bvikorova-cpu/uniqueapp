import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Zap,
  Gift,
  PlayCircle,
  Flame,
  Star,
  Download,
  Filter,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { exportToCsv } from "@/lib/exportCsv";

type Source = "ad" | "daily" | "streak" | "activity";

interface XPEvent {
  id: string;
  source: Source;
  type: string;
  description: string;
  xp: number;
  timestamp: string;
  meta?: string;
}

const sourceConfig: Record<
  Source,
  { label: string; icon: typeof Zap; color: string; bg: string }
> = {
  ad: {
    label: "Rewarded Ad",
    icon: PlayCircle,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
  },
  daily: {
    label: "Daily Login",
    icon: Gift,
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
  },
  streak: {
    label: "Streak Bonus",
    icon: Flame,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/30",
  },
  activity: {
    label: "Activity",
    icon: Star,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/30",
  },
};

export default function XPAuditLog() {
  const { user } = useAuth();
  const userId = user?.id;
  const [filter, setFilter] = useState<Source | "all">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["xp-audit-log", userId],
    enabled: !!userId,
    queryFn: async (): Promise<XPEvent[]> => {
      const [adsRes, dailyRes, dailyRewardsRes, activityRes] = await Promise.all([
        supabase
          .from("rewarded_ad_views")
          .select("id, section_key, xp_awarded, created_at, view_date")
          .eq("user_id", userId!)
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("daily_xp_claims")
          .select("id, xp_earned, claimed_at, claim_date, ad_watched")
          .eq("user_id", userId!)
          .order("claimed_at", { ascending: false })
          .limit(500),
        supabase
          .from("daily_rewards")
          .select("id, points_earned, day_streak, claimed_at")
          .eq("user_id", userId!)
          .order("claimed_at", { ascending: false })
          .limit(500),
        supabase
          .from("activity_logs")
          .select("id, activity_type, points_earned, created_at")
          .eq("user_id", userId!)
          .gt("points_earned", 0)
          .order("created_at", { ascending: false })
          .limit(500),
      ]);

      const events: XPEvent[] = [];

      (adsRes.data ?? []).forEach((r: any) => {
        events.push({
          id: `ad-${r.id}`,
          source: "ad",
          type: "Rewarded ad view",
          description: `Watched ad in ${r.section_key ?? "unknown section"}`,
          xp: r.xp_awarded ?? 0,
          timestamp: r.created_at,
          meta: r.section_key,
        });
      });

      (dailyRes.data ?? []).forEach((r: any) => {
        events.push({
          id: `dxp-${r.id}`,
          source: "daily",
          type: "Daily XP claim",
          description: r.ad_watched
            ? "Daily claim (ad-boosted)"
            : "Daily claim",
          xp: r.xp_earned ?? 0,
          timestamp: r.claimed_at,
        });
      });

      (dailyRewardsRes.data ?? []).forEach((r: any) => {
        const isStreak = (r.day_streak ?? 0) > 1;
        events.push({
          id: `dr-${r.id}`,
          source: isStreak ? "streak" : "daily",
          type: isStreak ? "Login streak bonus" : "Daily login reward",
          description: `Day ${r.day_streak ?? 1} of streak`,
          xp: r.points_earned ?? 0,
          timestamp: r.claimed_at,
        });
      });

      (activityRes.data ?? []).forEach((r: any) => {
        events.push({
          id: `act-${r.id}`,
          source: "activity",
          type: r.activity_type,
          description: r.activity_type.replace(/_/g, " "),
          xp: r.points_earned ?? 0,
          timestamp: r.created_at,
        });
      });

      events.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return events;
    },
    staleTime: 30_000,
  });

  const events = data ?? [];
  const filtered = useMemo(
    () => (filter === "all" ? events : events.filter((e) => e.source === filter)),
    [events, filter]
  );

  const totalXP = filtered.reduce((s, e) => s + (e.xp ?? 0), 0);
  const counts = useMemo(() => {
    const c: Record<Source, number> = { ad: 0, daily: 0, streak: 0, activity: 0 };
    events.forEach((e) => (c[e.source] += 1));
    return c;
  }, [events]);

  const handleExport = () => {
    exportToCsv("xp-audit-log", filtered, [
      { key: "timestamp", label: "Timestamp", format: (v) => format(new Date(v), "yyyy-MM-dd HH:mm:ss") },
      { key: "source", label: "Source", format: (v) => sourceConfig[v as Source].label },
      { key: "type", label: "Type" },
      { key: "description", label: "Description" },
      { key: "xp", label: "XP" },
    ]);
  };

  if (!userId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Please sign in to view your XP audit log.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/rewards">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Rewards
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              XP Audit Log
            </h1>
            <p className="text-sm text-muted-foreground">
              Every XP event with timestamp and source — fully traceable.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="ad">Rewarded Ads</SelectItem>
              <SelectItem value="daily">Daily Login</SelectItem>
              <SelectItem value="streak">Streak Bonus</SelectItem>
              <SelectItem value="activity">Activity</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline" size="sm" disabled={!filtered.length}>
            <Download className="h-4 w-4 mr-1" />
            CSV
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="backdrop-blur-xl bg-card/80 border-primary/30">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total XP (filtered)</p>
            <p className="text-2xl font-bold text-primary">+{totalXP}</p>
          </CardContent>
        </Card>
        {(Object.keys(sourceConfig) as Source[]).map((s) => {
          const cfg = sourceConfig[s];
          const Icon = cfg.icon;
          return (
            <Card key={s} className={`backdrop-blur-xl bg-card/80 border ${cfg.bg}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                  {cfg.label}
                </div>
                <p className="text-2xl font-bold">{counts[s]}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
        <CardHeader>
          <CardTitle className="text-base">
            {filtered.length} event{filtered.length === 1 ? "" : "s"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <Zap className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No XP events match this filter yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">XP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((e) => {
                    const cfg = sourceConfig[e.source];
                    const Icon = cfg.icon;
                    return (
                      <TableRow key={e.id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {format(new Date(e.timestamp), "yyyy-MM-dd HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${cfg.bg} ${cfg.color} border`}>
                            <Icon className="h-3 w-3 mr-1" />
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-sm">{e.type}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {e.description}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          +{e.xp}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
