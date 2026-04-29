import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  Search,
  Shield,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  Gift,
  Flame,
  Star,
  Download,
  Filter,
  User as UserIcon,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const sourceConfig: Record<
  Source,
  { label: string; icon: typeof Star; color: string; bg: string }
> = {
  ad: { label: "Rewarded Ad", icon: PlayCircle, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
  daily: { label: "Daily Login", icon: Gift, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
  streak: { label: "Streak Bonus", icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
  activity: { label: "Activity", icon: Star, color: "text-primary", bg: "bg-primary/10 border-primary/30" },
};

interface SearchResult {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_points: number;
  level: number;
}

interface XPEvent {
  event_id: string;
  source: Source;
  event_type: string;
  description: string;
  xp: number;
  occurred_at: string;
}

interface Reconciliation {
  user_id: string;
  sources: {
    rewarded_ads_xp: number;
    daily_xp_claims_xp: number;
    daily_rewards_xp: number;
    activity_logs_xp: number;
  };
  total_recorded_xp: number;
  user_points_total: number;
  level: number;
  login_streak: number;
  mismatch: number;
  is_consistent: boolean;
  rewarded_ad_view_count: number;
}

export default function AdminXPAudit() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    searchParams.get("uid")
  );
  const [filter, setFilter] = useState<Source | "all">("all");

  // Redirect non-admins
  useEffect(() => {
    if (!adminLoading && !isAdmin) navigate("/", { replace: true });
  }, [adminLoading, isAdmin, navigate]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Sync selected user to URL
  useEffect(() => {
    if (selectedUserId) {
      setSearchParams({ uid: selectedUserId }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [selectedUserId, setSearchParams]);

  const searchQuery = useQuery({
    queryKey: ["admin-xp-search", debounced],
    enabled: !!isAdmin && debounced.length >= 2,
    queryFn: async (): Promise<SearchResult[]> => {
      const { data, error } = await supabase.rpc(
        "admin_search_users_for_xp_audit" as any,
        { _query: debounced }
      );
      if (error) throw error;
      return (data ?? []) as SearchResult[];
    },
  });

  const eventsQuery = useQuery({
    queryKey: ["admin-xp-events", selectedUserId],
    enabled: !!isAdmin && !!selectedUserId,
    queryFn: async (): Promise<XPEvent[]> => {
      const { data, error } = await supabase.rpc(
        "admin_get_xp_events" as any,
        { _target_user_id: selectedUserId }
      );
      if (error) throw error;
      return (data ?? []) as XPEvent[];
    },
  });

  const reconQuery = useQuery({
    queryKey: ["admin-xp-recon", selectedUserId],
    enabled: !!isAdmin && !!selectedUserId,
    queryFn: async (): Promise<Reconciliation> => {
      const { data, error } = await supabase.rpc(
        "admin_get_xp_reconciliation" as any,
        { _target_user_id: selectedUserId }
      );
      if (error) throw error;
      return data as Reconciliation;
    },
  });

  const events = eventsQuery.data ?? [];
  const filtered = useMemo(
    () => (filter === "all" ? events : events.filter((e) => e.source === filter)),
    [events, filter]
  );

  const counts = useMemo(() => {
    const c: Record<Source, number> = { ad: 0, daily: 0, streak: 0, activity: 0 };
    events.forEach((e) => (c[e.source] = (c[e.source] ?? 0) + 1));
    return c;
  }, [events]);

  const handleExport = () => {
    if (!filtered.length) return;
    exportToCsv(`xp-audit-${selectedUserId}`, filtered, [
      { key: "occurred_at", label: "Timestamp", format: (v) => format(new Date(v), "yyyy-MM-dd HH:mm:ss") },
      { key: "source", label: "Source" },
      { key: "event_type", label: "Type" },
      { key: "description", label: "Description" },
      { key: "xp", label: "XP" },
      { key: "event_id", label: "Event ID" },
    ]);
  };

  if (adminLoading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  if (!isAdmin) return null;

  const recon = reconQuery.data;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Admin
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              XP Audit (Admin)
            </h1>
            <p className="text-sm text-muted-foreground">
              Investigate XP attribution and mismatches by user.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Find user
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Search by name or paste user ID (UUID)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {debounced.length >= 2 && (
            <div className="border rounded-lg overflow-hidden">
              {searchQuery.isLoading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : searchQuery.error ? (
                <div className="p-4 text-sm text-destructive">
                  {(searchQuery.error as Error).message}
                </div>
              ) : (searchQuery.data ?? []).length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  No users match.
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y">
                  {(searchQuery.data ?? []).map((u) => (
                    <button
                      key={u.user_id}
                      onClick={() => setSelectedUserId(u.user_id)}
                      className={`w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-accent/40 transition ${
                        selectedUserId === u.user_id ? "bg-accent/60" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {u.avatar_url ? (
                          <img
                            src={u.avatar_url}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <UserIcon className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {u.full_name || "(no name)"}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">
                            {u.user_id}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        L{u.level} • {u.total_points} XP
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {!selectedUserId ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <UserIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
            Select a user above to inspect their XP events.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Reconciliation */}
          <Card
            className={`backdrop-blur-xl bg-card/80 border ${
              recon
                ? recon.is_consistent
                  ? "border-green-500/40"
                  : "border-destructive/50"
                : "border-primary/20"
            }`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {recon ? (
                  recon.is_consistent ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Reconciliation: consistent
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      Reconciliation: MISMATCH
                    </>
                  )
                ) : (
                  "Reconciliation"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reconQuery.isLoading || !recon ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-sm">
                  <Stat label="Rewarded Ads XP" value={recon.sources.rewarded_ads_xp} />
                  <Stat label="Daily XP Claims" value={recon.sources.daily_xp_claims_xp} />
                  <Stat label="Daily Rewards" value={recon.sources.daily_rewards_xp} />
                  <Stat label="Activity Logs" value={recon.sources.activity_logs_xp} />
                  <Stat label="Σ Recorded" value={recon.total_recorded_xp} highlight />
                  <Stat label="user_points.total" value={recon.user_points_total} highlight />
                  <Stat
                    label="Mismatch"
                    value={recon.mismatch}
                    danger={!recon.is_consistent}
                  />
                </div>
              )}
              {recon && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">User ID: {recon.user_id}</Badge>
                  <Badge variant="outline">Level {recon.level}</Badge>
                  <Badge variant="outline">Streak {recon.login_streak}</Badge>
                  <Badge variant="outline">{recon.rewarded_ad_view_count} ad views</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Source filter */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(Object.keys(sourceConfig) as Source[]).map((s) => {
                const cfg = sourceConfig[s];
                const Icon = cfg.icon;
                return (
                  <div
                    key={s}
                    className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 ${cfg.bg}`}
                  >
                    <Icon className={`h-3 w-3 ${cfg.color}`} />
                    <span className="font-medium">{cfg.label}:</span>
                    <span>{counts[s]}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                <SelectTrigger className="w-[160px]">
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
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                disabled={!filtered.length}
              >
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
            </div>
          </div>

          {/* Events table */}
          <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">
                {filtered.length} event{filtered.length === 1 ? "" : "s"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {eventsQuery.isLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : eventsQuery.error ? (
                <div className="p-6 text-sm text-destructive">
                  {(eventsQuery.error as Error).message}
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground">
                  No XP events for this filter.
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
                        <TableHead className="text-xs text-muted-foreground">Event ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((e) => {
                        const cfg = sourceConfig[e.source] ?? sourceConfig.activity;
                        const Icon = cfg.icon;
                        return (
                          <TableRow key={e.event_id}>
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                              {format(new Date(e.occurred_at), "yyyy-MM-dd HH:mm:ss")}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`${cfg.bg} ${cfg.color} border`}
                              >
                                <Icon className="h-3 w-3 mr-1" />
                                {cfg.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-sm">
                              {e.event_type}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {e.description}
                            </TableCell>
                            <TableCell className="text-right font-bold text-primary">
                              +{e.xp}
                            </TableCell>
                            <TableCell className="font-mono text-[10px] text-muted-foreground">
                              {e.event_id}
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
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
  danger,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        danger
          ? "border-destructive/50 bg-destructive/10"
          : highlight
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-muted/20"
      }`}
    >
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={`text-xl font-bold ${
          danger ? "text-destructive" : highlight ? "text-primary" : ""
        }`}
      >
        {value > 0 && highlight ? "+" : ""}
        {value}
      </p>
    </div>
  );
}
