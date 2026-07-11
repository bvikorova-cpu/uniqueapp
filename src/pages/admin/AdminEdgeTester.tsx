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

type Status = "idle" | "running" | "ok" | "warn" | "error";
interface Result {
  status: Status;
  code?: number;
  ms?: number;
  message?: string;
}

// Codes that mean "function is alive, just refused this probe" — NOT bugs.
const BENIGN_CODES = new Set([400, 401, 403, 404, 405, 409, 422]);
const BENIGN_MSG = /unauthor|forbidden|missing|required|invalid|not.?found|method|validation|bad request|zod|schema/i;

async function probe(fn: string): Promise<Result> {
  const t0 = performance.now();
  try {
    const { data, error } = await supabase.functions.invoke(fn, { body: { __probe: true } });
    const ms = Math.round(performance.now() - t0);
    if (error) {
      const ctx: any = (error as any).context;
      let code: number | undefined = typeof ctx?.status === "number" ? ctx.status : undefined;
      let message = (error as any)?.message || "error";
      try {
        if (ctx && typeof ctx.json === "function") {
          const body = await ctx.json();
          if (body?.error) message = String(body.error);
        }
      } catch {}
      const benign = (code && BENIGN_CODES.has(code)) || BENIGN_MSG.test(message);
      return { status: benign ? "warn" : "error", code, ms, message };
    }
    if (data && typeof data === "object" && (data as any).error) {
      return { status: "warn", ms, code: 200, message: String((data as any).error) };
    }
    return { status: "ok", ms, code: 200, message: "ok" };
  } catch (e: any) {
    return { status: "error", ms: Math.round(performance.now() - t0), message: e?.message ?? "threw" };
  }
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
        subtitle="Probe every deployed edge function. Green = OK, Amber = alive but rejected probe (auth/validation), Red = real failure."
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
            <strong>Probe body:</strong> <code>{`{ __probe: true }`}</code> — most functions will reject this
            (missing action / unauthorized / validation) with a 4xx. That means the function is deployed and
            running — shown as <strong>amber "warn"</strong>, not red.
          </p>
          <p>
            <strong>Red "error"</strong> = 5xx crash, dead worker, or thrown JS exception. Those are real bugs to
            fix. Hover a row to see the error message.
          </p>
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
