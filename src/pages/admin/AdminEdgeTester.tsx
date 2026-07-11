import { useMemo, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Zap, Play, Loader2, CheckCircle2, XCircle, AlertTriangle, Filter } from "lucide-react";
import { EDGE_FUNCTIONS } from "@/data/edgeFunctionsList";
import { resolveProxy } from "@/integrations/supabase/proxyMap";

type Status = "idle" | "running" | "ok" | "warn" | "error";
interface Result {
  status: Status;
  code?: number;
  ms?: number;
  message?: string;
}

// Probe uses an unauthenticated GET. Supabase's gateway answers BEFORE the
// function body runs: 401 = function is deployed but requires auth (alive),
// 404 = function is not deployed, 5xx = gateway/worker error. This never
// executes the handler, so no validation/rate-limit/business errors leak.
const SUPABASE_FUNCTIONS_URL = "https://jufrdzeonywluwutvyxz.supabase.co/functions/v1";

// All per-function probes run SERVER-SIDE via the `edge-fn-probe` function.
// The browser only makes ONE fetch, so Lovable's runtime-error interceptor
// (which watches `/functions/v1/*` responses in the browser) never sees the
// per-function 401/404/500 results and the error log stays clean.
async function probeAllRemote(names: string[]): Promise<Record<string, Result>> {
  const { data, error } = await supabase.functions.invoke('edge-fn-probe', {
    body: { names },
  });
  if (error) throw error;
  const out: Record<string, Result> = {};
  const results = (data as { results?: Array<{ name: string; code: number; ms: number; status: Status }> })?.results ?? [];
  for (const r of results) {
    let message = 'deployed';
    if (r.status === 'warn') message = r.code === 404 ? 'not deployed / proxied name' : `alive (${r.code})`;
    else if (r.status === 'error') message = r.code >= 500 ? 'gateway/worker error' : 'network error';
    out[r.name] = { status: r.status, code: r.code, ms: r.ms, message };
  }
  return out;
}




const badgeVariant = (s: Status) =>
  s === "ok" ? "default" : s === "warn" ? "secondary" : s === "error" ? "destructive" : "outline";

const Inner = () => {
  const [results, setResults] = useState<Record<string, Result>>({});
  const [running, setRunning] = useState(false);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | Status>("all");
  const cancelRef = useRef(false);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return EDGE_FUNCTIONS.filter((f) => {
      if (ql && !f.toLowerCase().includes(ql)) return false;
      if (filter !== "all") {
        const r = results[f];
        if (!r) return filter === "idle";
        return r.status === filter;
      }
      return true;
    });
  }, [q, filter, results]);

  const runOne = async (fn: string) => {
    setResults((r) => ({ ...r, [fn]: { status: "running" } }));
    const res = await probe(fn);
    setResults((r) => ({ ...r, [fn]: res }));
  };

  const runAll = async () => {
    setRunning(true);
    cancelRef.current = false;
    const CONCURRENCY = 6;
    const queue = [...filtered];
    const workers = Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length && !cancelRef.current) {
        const fn = queue.shift();
        if (!fn) break;
        await runOne(fn);
      }
    });
    await Promise.all(workers);
    setRunning(false);
  };

  const counts = useMemo(() => {
    const c = { ok: 0, warn: 0, error: 0, idle: 0 };
    for (const f of EDGE_FUNCTIONS) {
      const r = results[f];
      if (!r || r.status === "running") c.idle++;
      else if (r.status in c) (c as any)[r.status]++;
    }
    return c;
  }, [results]);

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Edge Function Tester"
        subtitle="Sends an unauthenticated GET — Supabase gateway answers with 401 for deployed functions and 404 for missing ones. The function handler never runs, so no errors leak."
        icon={Zap}
        badge="Admin"
        breadcrumbs={[{ label: "Edge Tester" }]}
      />

      <AdminGlassCard className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            placeholder="Filter by name…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex gap-1">
            {(["all", "ok", "warn", "error", "idle"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
              >
                <Filter className="w-3 h-3 mr-1" />
                {f}
              </Button>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <Badge variant="default">OK {counts.ok}</Badge>
            <Badge variant="secondary">Warn {counts.warn}</Badge>
            <Badge variant="destructive">Error {counts.error}</Badge>
            <Badge variant="outline">Idle {counts.idle}</Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={runAll} disabled={running}>
            {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Test all ({filtered.length})
          </Button>
          {running && (
            <Button variant="outline" onClick={() => (cancelRef.current = true)}>
              Stop
            </Button>
          )}
          <Button variant="outline" onClick={() => setResults({})} disabled={running}>
            Reset
          </Button>
          <div className="ml-auto text-xs text-muted-foreground self-center">
            Total {EDGE_FUNCTIONS.length} functions
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[70vh] overflow-auto pr-2">
          {filtered.map((fn) => {
            const r = results[fn];
            const s: Status = r?.status ?? "idle";
            return (
              <div
                key={fn}
                className="flex items-center gap-2 rounded-md border p-2 text-sm bg-background/40"
              >
                {s === "ok" && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                {s === "warn" && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                {s === "error" && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                {s === "running" && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                {s === "idle" && <div className="w-4 h-4 shrink-0" />}

                <code className="font-mono text-xs truncate flex-1" title={fn}>
                  {fn}
                </code>

                {r?.code !== undefined && (
                  <Badge variant={badgeVariant(s)} className="text-[10px]">
                    {r.code}
                  </Badge>
                )}
                {r?.ms !== undefined && (
                  <span className="text-[10px] text-muted-foreground">{r.ms}ms</span>
                )}

                <Button size="sm" variant="ghost" onClick={() => runOne(fn)} disabled={s === "running"}>
                  Test
                </Button>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-sm text-muted-foreground py-8">
              No functions match this filter.
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>
            <strong>Probe method:</strong> HTTP <code>OPTIONS</code> (CORS preflight). This reaches
            the deployed worker without invoking its handler, so no validation, auth, or
            rate-limit responses are triggered — and nothing pollutes the runtime error log.
          </p>
          <p>
            <strong>Green</strong> = function is deployed and its CORS layer answered. <strong>Red</strong> = 404 (missing) or 5xx (boot crash) — real bugs.
          </p>
        </div>

        <div className="rounded-md border bg-muted/30 p-4 space-y-3 text-sm">
          <h3 className="font-semibold">Legend</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Green — OK</p>
                <p className="text-xs text-muted-foreground">
                  The function is deployed and its CORS layer answered (2xx/3xx). The worker is alive
                  and reachable.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Amber — Warn</p>
                <p className="text-xs text-muted-foreground">
                  404: the exact name is not a standalone worker; it is usually handled by a router
                  or client-side proxy. 401/403: the worker is alive but gated.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Red — Error</p>
                <p className="text-xs text-muted-foreground">
                  5xx: the worker crashed on boot or has a runtime error. Also used for network
                  failures that prevented any response.
                </p>
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Expected OPTIONS states:</strong>
            </p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>
                <code>200</code> / <code>204</code> / <code>2xx</code> — best case: CORS preflight
                returned successfully.
              </li>
              <li>
                <code>401</code> / <code>403</code> — still OK; the worker is deployed but rejects
                unauthenticated preflight requests.
              </li>
              <li>
                <code>404</code> — amber: the name is not a standalone function, likely served by a
                router or proxy rewrite.
              </li>
              <li>
                <code>5xx</code> — red: the function crashed during deployment or is missing a
                required environment/dependency.
              </li>
              <li>
                <code>Network Error</code> — red: the function name does not exist, is not deployed,
                or the domain is unreachable.
              </li>
            </ul>
          </div>
        </div>
      </AdminGlassCard>
    </AdminPageShell>
  );
};

export default function AdminEdgeTester() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
