import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCw,
  Search,
  ExternalLink,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

interface ReconRow {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  rewarded_ads_xp: number;
  daily_xp_claims_xp: number;
  daily_rewards_xp: number;
  activity_logs_xp: number;
  total_recorded_xp: number;
  user_points_total: number;
  level: number;
  mismatch: number;
  is_consistent: boolean;
  last_event_at: string | null;
}

export default function AdminXPReconciliation() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  const [onlyMismatches, setOnlyMismatches] = useState(true);
  const [minMismatch, setMinMismatch] = useState(1);
  const [limit, setLimit] = useState(200);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!adminLoading && !isAdmin) navigate("/", { replace: true });
  }, [adminLoading, isAdmin, navigate]);

  const reportQuery = useQuery({
    queryKey: ["admin-xp-recon-report", onlyMismatches, minMismatch, limit],
    enabled: !!isAdmin,
    queryFn: async (): Promise<ReconRow[]> => {
      const { data, error } = await supabase.rpc(
        "admin_get_xp_reconciliation_report" as any,
        {
          _only_mismatches: onlyMismatches,
          _min_abs_mismatch: minMismatch,
          _limit: limit,
        }
      );
      if (error) throw error;
      return (data ?? []) as ReconRow[];
    },
  });

  const rows = reportQuery.data ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        (r.full_name ?? "").toLowerCase().includes(q) ||
        r.user_id.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const summary = useMemo(() => {
    const total = rows.length;
    const consistent = rows.filter((r) => r.is_consistent).length;
    const inconsistent = total - consistent;
    const positive = rows.filter((r) => r.mismatch > 0).length; // user_points > recorded
    const negative = rows.filter((r) => r.mismatch < 0).length; // user_points < recorded
    const totalAbsDelta = rows.reduce((s, r) => s + Math.abs(r.mismatch), 0);
    const netDelta = rows.reduce((s, r) => s + r.mismatch, 0);
    return { total, consistent, inconsistent, positive, negative, totalAbsDelta, netDelta };
  }, [rows]);

  const handleExport = () => {
    if (!filtered.length) return;
    exportToCsv(`xp-reconciliation`, filtered, [
      { key: "user_id", label: "User ID" },
      { key: "full_name", label: "Name" },
      { key: "level", label: "Level" },
      { key: "user_points_total", label: "user_points.total" },
      { key: "total_recorded_xp", label: "Σ Recorded" },
      { key: "mismatch", label: "Mismatch" },
      { key: "rewarded_ads_xp", label: "Ads XP" },
      { key: "daily_xp_claims_xp", label: "Daily XP" },
      { key: "daily_rewards_xp", label: "Daily Rewards" },
      { key: "activity_logs_xp", label: "Activity XP" },
      {
        key: "last_event_at",
        label: "Last Event",
        format: (v) => (v ? format(new Date(v), "yyyy-MM-dd HH:mm") : ""),
      },
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

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/xp-audit">
              <ArrowLeft className="h-4 w-4 mr-1" />
              XP Audit
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              XP Reconciliation Report
            </h1>
            <p className="text-sm text-muted-foreground">
              Compares Σ source XP (ads + daily + streak + activity) vs{" "}
              <code className="text-xs">user_points.total_points</code>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => reportQuery.refetch()}
            variant="outline"
            size="sm"
            disabled={reportQuery.isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${reportQuery.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm" disabled={!filtered.length}>
            <Download className="h-4 w-4 mr-1" />
            CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div>
              <Label className="text-xs">Only show mismatches</Label>
              <p className="text-[10px] text-muted-foreground">Hide consistent users</p>
            </div>
            <Switch checked={onlyMismatches} onCheckedChange={setOnlyMismatches} />
          </div>
          <div>
            <Label className="text-xs">Min |mismatch|</Label>
            <Input
              type="number"
              min={0}
              value={minMismatch}
              onChange={(e) => setMinMismatch(Math.max(0, Number(e.target.value) || 0))}
            />
          </div>
          <div>
            <Label className="text-xs">Result limit (max 1000)</Label>
            <Input
              type="number"
              min={1}
              max={1000}
              value={limit}
              onChange={(e) =>
                setLimit(Math.min(1000, Math.max(1, Number(e.target.value) || 1)))
              }
            />
          </div>
          <div>
            <Label className="text-xs">Filter results</Label>
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-7"
                placeholder="Name or UUID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="Users scanned" value={summary.total} />
        <SummaryCard
          label="Consistent"
          value={summary.consistent}
          tone="good"
          icon={CheckCircle2}
        />
        <SummaryCard
          label="Inconsistent"
          value={summary.inconsistent}
          tone={summary.inconsistent > 0 ? "bad" : undefined}
          icon={AlertTriangle}
        />
        <SummaryCard
          label="Over-credited"
          value={summary.positive}
          tone={summary.positive > 0 ? "warn" : undefined}
          icon={TrendingUp}
          hint="user_points > Σ recorded"
        />
        <SummaryCard
          label="Under-credited"
          value={summary.negative}
          tone={summary.negative > 0 ? "warn" : undefined}
          icon={TrendingDown}
          hint="user_points < Σ recorded"
        />
        <SummaryCard
          label="Σ |Δ| XP"
          value={summary.totalAbsDelta}
          hint={`Net Δ: ${summary.netDelta >= 0 ? "+" : ""}${summary.netDelta}`}
        />
      </div>

      {/* Table */}
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
        <CardHeader>
          <CardTitle className="text-base">
            {filtered.length} row{filtered.length === 1 ? "" : "s"}
            {reportQuery.isFetching && (
              <span className="text-xs text-muted-foreground ml-2">refreshing…</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {reportQuery.isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : reportQuery.error ? (
            <div className="p-6 text-sm text-destructive">
              {(reportQuery.error as Error).message}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              {onlyMismatches ? (
                <>
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-green-500" />
                  <p className="font-medium">All clean — no mismatches above threshold.</p>
                </>
              ) : (
                <p>No users match.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Lv</TableHead>
                    <TableHead className="text-right">Ads</TableHead>
                    <TableHead className="text-right">Daily XP</TableHead>
                    <TableHead className="text-right">Daily Rewards</TableHead>
                    <TableHead className="text-right">Activity</TableHead>
                    <TableHead className="text-right">Σ Recorded</TableHead>
                    <TableHead className="text-right">user_points</TableHead>
                    <TableHead className="text-right">Δ</TableHead>
                    <TableHead>Last event</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow
                      key={r.user_id}
                      className={!r.is_consistent ? "bg-destructive/5" : ""}
                    >
                      <TableCell className="min-w-[200px]">
                        <div className="flex items-center gap-2">
                          {r.avatar_url ? (
                            <img
                              src={r.avatar_url}
                              alt=""
                              className="h-7 w-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-7 w-7 rounded-full bg-muted" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {r.full_name || "(no name)"}
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground truncate">
                              {r.user_id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs">{r.level}</TableCell>
                      <TableCell className="text-right text-xs">{r.rewarded_ads_xp}</TableCell>
                      <TableCell className="text-right text-xs">{r.daily_xp_claims_xp}</TableCell>
                      <TableCell className="text-right text-xs">{r.daily_rewards_xp}</TableCell>
                      <TableCell className="text-right text-xs">{r.activity_logs_xp}</TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {r.total_recorded_xp}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {r.user_points_total}
                      </TableCell>
                      <TableCell className="text-right">
                        {r.is_consistent ? (
                          <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-500 border-green-500/30"
                          >
                            ✓ 0
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className={`${
                              r.mismatch > 0
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                                : "bg-destructive/10 text-destructive border-destructive/30"
                            } font-bold`}
                          >
                            {r.mismatch > 0 ? "+" : ""}
                            {r.mismatch}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {r.last_event_at
                          ? formatDistanceToNow(new Date(r.last_event_at), {
                              addSuffix: true,
                            })
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/admin/xp-audit?uid=${r.user_id}`}>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  hint?: string;
  tone?: "good" | "bad" | "warn";
  icon?: typeof CheckCircle2;
}) {
  const toneClass =
    tone === "good"
      ? "border-green-500/40 text-green-500"
      : tone === "bad"
      ? "border-destructive/50 text-destructive"
      : tone === "warn"
      ? "border-amber-500/40 text-amber-500"
      : "border-border";
  return (
    <Card className={`backdrop-blur-xl bg-card/80 border ${toneClass}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {label}
        </div>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
      </CardContent>
    </Card>
  );
}
