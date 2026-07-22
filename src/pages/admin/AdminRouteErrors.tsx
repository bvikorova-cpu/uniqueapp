import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, RefreshCw, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type WindowKey = "7d" | "30d";

interface RouteEvent {
  id: string;
  path: string;
  referrer: string | null;
  redirected_to: string | null;
  user_id: string | null;
  user_agent: string | null;
  occurred_at: string;
}

interface Aggregate {
  path: string;
  hits: number;
  uniqueUsers: number;
  lastSeen: string;
  topReferrer: string | null;
  redirected: number;
  hardMisses: number;
}

const windowToDays: Record<WindowKey, number> = { "7d": 7, "30d": 30 };

function aggregate(rows: RouteEvent[]): Aggregate[] {
  const byPath = new Map<string, RouteEvent[]>();
  for (const r of rows) {
    const arr = byPath.get(r.path) ?? [];
    arr.push(r);
    byPath.set(r.path, arr);
  }
  const out: Aggregate[] = [];
  for (const [path, events] of byPath) {
    const users = new Set<string>();
    const refs = new Map<string, number>();
    let redirected = 0;
    let hard = 0;
    let last = events[0].occurred_at;
    for (const e of events) {
      if (e.user_id) users.add(e.user_id);
      if (e.referrer) refs.set(e.referrer, (refs.get(e.referrer) ?? 0) + 1);
      if (e.redirected_to) redirected++; else hard++;
      if (e.occurred_at > last) last = e.occurred_at;
    }
    const topReferrer =
      [...refs.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    out.push({
      path,
      hits: events.length,
      uniqueUsers: users.size,
      lastSeen: last,
      topReferrer,
      redirected,
      hardMisses: hard,
    });
  }
  return out.sort((a, b) => b.hits - a.hits).slice(0, 50);
}

function toCsv(rows: Aggregate[]): string {
  const header = ["path", "hits", "unique_users", "hard_misses", "redirected", "top_referrer", "last_seen"];
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push([
      r.path,
      r.hits,
      r.uniqueUsers,
      r.hardMisses,
      r.redirected,
      r.topReferrer ?? "",
      r.lastSeen,
    ].map(escape).join(","));
  }
  return lines.join("\n");
}

export default function AdminRouteErrors() {
  const [win, setWin] = useState<WindowKey>("7d");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["route-404-events", win],
    queryFn: async (): Promise<RouteEvent[]> => {
      const since = new Date();
      since.setDate(since.getDate() - windowToDays[win]);
      const { data, error } = await supabase
        .from("route_404_events")
        .select("id, path, referrer, redirected_to, user_id, user_agent, occurred_at")
        .gte("occurred_at", since.toISOString())
        .order("occurred_at", { ascending: false })
        .limit(5000);
      if (error) throw error;
      return (data ?? []) as RouteEvent[];
    },
  });

  const rows = useMemo(() => aggregate(data ?? []), [data]);
  const totalHits = data?.length ?? 0;
  const hardMisses = useMemo(
    () => (data ?? []).filter((r) => !r.redirected_to).length,
    [data],
  );

  const downloadCsv = () => {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `route-404-${win}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
            Route errors (404)
          </h1>
          <p className="text-muted-foreground mt-1">
            Where visitors are landing on missing pages. Use this to add redirects
            or fix internal links.
          </p>
        </div>
        <div className="flex gap-2">
          <Tabs value={win} onValueChange={(v) => setWin(v as WindowKey)}>
            <TabsList>
              <TabsTrigger value="7d">7 days</TabsTrigger>
              <TabsTrigger value="30d">30 days</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCsv} disabled={rows.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total 404 hits</CardDescription>
            <CardTitle className="text-3xl">{totalHits}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Hard misses (no redirect)</CardDescription>
            <CardTitle className="text-3xl text-destructive">{hardMisses}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Distinct paths</CardDescription>
            <CardTitle className="text-3xl">{rows.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top missing paths</CardTitle>
          <CardDescription>
            Hard misses are pages we don&apos;t know about — consider adding a
            redirect in <code className="text-xs">src/pages/NotFound.tsx</code>{" "}
            (<code className="text-xs">PREMIUM_ALIASES</code>) or a real route.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="text-muted-foreground">
              No 404 events in this window. Nice.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Path</TableHead>
                    <TableHead className="text-right">Hits</TableHead>
                    <TableHead className="text-right">Users</TableHead>
                    <TableHead className="text-right">Hard</TableHead>
                    <TableHead>Top referrer</TableHead>
                    <TableHead>Last seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.path}>
                      <TableCell className="font-mono text-xs break-all">
                        {r.path}
                      </TableCell>
                      <TableCell className="text-right font-medium">{r.hits}</TableCell>
                      <TableCell className="text-right">{r.uniqueUsers}</TableCell>
                      <TableCell className={`text-right ${r.hardMisses > 0 ? "text-destructive font-medium" : ""}`}>
                        {r.hardMisses}
                      </TableCell>
                      <TableCell className="max-w-[240px] truncate text-xs text-muted-foreground">
                        {r.topReferrer ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(r.lastSeen), { addSuffix: true })}
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
