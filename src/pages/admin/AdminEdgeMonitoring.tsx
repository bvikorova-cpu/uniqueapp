import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCw, AlertTriangle, Activity, Zap } from "lucide-react";

interface Row {
  function_name: string;
  total_calls: number;
  error_count: number;
  error_rate: number;
  avg_ms: number;
  p50_ms: number;
  p95_ms: number;
  p99_ms: number;
  max_ms: number;
  last_call: string;
  last_error: string | null;
}

type SortKey = "error_rate" | "error_count" | "total_calls" | "p95_ms" | "avg_ms";

const Inner = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("error_rate");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc("get_edge_function_stats_7d");
    if (error) setError(error.message);
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const list = q
      ? rows.filter((r) => r.function_name.toLowerCase().includes(q.toLowerCase()))
      : rows;
    return [...list].sort((a, b) => (b[sortKey] as number) - (a[sortKey] as number));
  }, [rows, q, sortKey]);

  const totals = useMemo(() => {
    const total = rows.reduce((s, r) => s + Number(r.total_calls), 0);
    const errs = rows.reduce((s, r) => s + Number(r.error_count), 0);
    return {
      total,
      errs,
      rate: total ? ((errs / total) * 100).toFixed(2) : "0.00",
      fns: rows.length,
    };
  }, [rows]);

  const rateColor = (r: number) =>
    r >= 10 ? "destructive" : r >= 2 ? "secondary" : "outline";
  const latColor = (ms: number) =>
    ms >= 5000 ? "text-destructive" : ms >= 2000 ? "text-orange-500" : "text-muted-foreground";

  return (
    <div className="container max-w-7xl py-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" /> Edge Function Monitoring
          </h1>
          <p className="text-sm text-muted-foreground">
            Client-observed error rate & latency for the last 7 days. Successful calls sampled at 10%; errors always captured.
          </p>
        </div>
        <Button onClick={load} disabled={loading} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Functions seen</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{totals.fns}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Total calls (7d)</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{totals.total.toLocaleString()}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Errors (7d)</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-destructive">{totals.errs.toLocaleString()}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Global error rate</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{totals.rate}%</CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 gap-3 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4" /> Per-function stats</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              placeholder="Filter function…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-8 w-48"
            />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="h-8 rounded-md border bg-background px-2 text-sm"
            >
              <option value="error_rate">Sort: error rate</option>
              <option value="error_count">Sort: error count</option>
              <option value="total_calls">Sort: total calls</option>
              <option value="p95_ms">Sort: p95 latency</option>
              <option value="avg_ms">Sort: avg latency</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline mr-2" />Loading metrics…</div>
          ) : error ? (
            <div className="py-12 text-center text-destructive flex items-center justify-center gap-2"><AlertTriangle className="h-5 w-5" /> {error}</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No metrics recorded yet. Interact with the app to generate data.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Function</TableHead>
                    <TableHead className="text-right">Calls</TableHead>
                    <TableHead className="text-right">Errors</TableHead>
                    <TableHead className="text-right">Error %</TableHead>
                    <TableHead className="text-right">Avg</TableHead>
                    <TableHead className="text-right">p50</TableHead>
                    <TableHead className="text-right">p95</TableHead>
                    <TableHead className="text-right">p99</TableHead>
                    <TableHead className="text-right">Max</TableHead>
                    <TableHead>Last error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.function_name}>
                      <TableCell className="font-mono text-xs">{r.function_name}</TableCell>
                      <TableCell className="text-right">{Number(r.total_calls).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{Number(r.error_count).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={rateColor(Number(r.error_rate))}>{Number(r.error_rate).toFixed(2)}%</Badge>
                      </TableCell>
                      <TableCell className={`text-right ${latColor(Number(r.avg_ms))}`}>{Number(r.avg_ms)}ms</TableCell>
                      <TableCell className="text-right">{Number(r.p50_ms)}ms</TableCell>
                      <TableCell className={`text-right ${latColor(Number(r.p95_ms))}`}>{Number(r.p95_ms)}ms</TableCell>
                      <TableCell className={`text-right ${latColor(Number(r.p99_ms))}`}>{Number(r.p99_ms)}ms</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">{r.max_ms}ms</TableCell>
                      <TableCell className="max-w-xs truncate text-xs text-destructive" title={r.last_error ?? ""}>
                        {r.last_error ?? "—"}
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
};

const AdminEdgeMonitoring = () => (
  <AdminGuard>
    <Inner />
  </AdminGuard>
);

export default AdminEdgeMonitoring;
