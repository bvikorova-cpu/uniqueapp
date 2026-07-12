import { useMemo, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Zap, Play, Loader2, CheckCircle2, XCircle, Filter, Download } from "lucide-react";
import { EDGE_FUNCTIONS } from "@/data/edgeFunctionsList";

type Status = "idle" | "running" | "ok" | "error";
interface Result {
  status: Status;
  code?: number;
  ms?: number;
  message?: string;
}

// Server-side probe calls each function with POST { __probe: true } using
// service-role credentials and returns a real "works / doesn't work" verdict.
async function probeAllRemote(names: string[]): Promise<Record<string, Result>> {
  const { data, error } = await supabase.functions.invoke('health-check', {
    body: { names },
  });
  if (error) throw error;
  const out: Record<string, Result> = {};
  const results = (data as {
    results?: Array<{ name: string; code: number; ms: number; status: "ok" | "error"; detail: string }>;
  })?.results ?? [];
  for (const r of results) {
    out[r.name] = { status: r.status, code: r.code, ms: r.ms, message: r.detail };
  }
  return out;
}




const badgeVariant = (s: Status) =>
  s === "ok" ? "default" : s === "error" ? "destructive" : "outline";

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
    const map = await probeAllRemote([fn]).catch(() => ({} as Record<string, Result>));
    const res = map[fn] ?? { status: "error" as Status, message: "probe failed" };
    setResults((r) => ({ ...r, [fn]: res }));
  };

  const runAll = async () => {
    setRunning(true);
    cancelRef.current = false;
    try {
      // Chunk to keep server response sizes sane
      const CHUNK = 100;
      const list = [...filtered];
      const pending: Record<string, Result> = {};
      for (const fn of list) pending[fn] = { status: "running" };
      setResults((r) => ({ ...r, ...pending }));
      for (let i = 0; i < list.length; i += CHUNK) {
        if (cancelRef.current) break;
        const chunk = list.slice(i, i + CHUNK);
        const map = await probeAllRemote(chunk).catch(() => ({} as Record<string, Result>));
        setResults((r) => ({ ...r, ...map }));
      }
    } finally {
      setRunning(false);
    }
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
            {(["all", "ok", "error", "idle"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
              >
                <Filter className="w-3 h-3 mr-1" />
                {f === "ok" ? "Funguje" : f === "error" ? "Nefunguje" : f === "idle" ? "Netestované" : "Všetko"}
              </Button>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <Badge variant="default">Funguje {counts.ok}</Badge>
            <Badge variant="destructive">Nefunguje {counts.error}</Badge>
            <Badge variant="outline">Netestované {counts.idle}</Badge>
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
          <Button
            variant="outline"
            onClick={() => {
              const rows = EDGE_FUNCTIONS.map((fn) => {
                const r = results[fn];
                return {
                  name: fn,
                  status: r?.status ?? "idle",
                  code: r?.code ?? "",
                  ms: r?.ms ?? "",
                  message: r?.message ?? "",
                };
              });
              const okList = rows.filter((r) => r.status === "ok").map((r) => r.name);
              const errList = rows.filter((r) => r.status === "error");
              const idleList = rows.filter((r) => r.status === "idle").map((r) => r.name);

              const txt = [
                `Edge Function Tester Report`,
                `Generated: ${new Date().toISOString()}`,
                `Total: ${EDGE_FUNCTIONS.length} | Funguje: ${okList.length} | Nefunguje: ${errList.length} | Netestované: ${idleList.length}`,
                ``,
                `=== NEFUNGUJE (${errList.length}) ===`,
                ...errList.map((r) => `${r.name}  [${r.code}]  ${r.message}`),
                ``,
                `=== FUNGUJE (${okList.length}) ===`,
                ...okList,
                ``,
                `=== NETESTOVANÉ (${idleList.length}) ===`,
                ...idleList,
              ].join("\n");

              const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `edge-tester-report-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.txt`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            disabled={running}
          >
            <Download className="w-4 h-4 mr-2" />
            Stiahnuť report
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
                {s === "error" && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                {s === "running" && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                {s === "idle" && <div className="w-4 h-4 shrink-0" />}

                <code className="font-mono text-xs truncate flex-1" title={fn}>
                  {fn}
                </code>

                {r?.message && (
                  <span className="text-[10px] text-muted-foreground truncate max-w-[140px]" title={r.message}>
                    {r.message}
                  </span>
                )}
                {r?.code !== undefined && r.code > 0 && (
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

        <div className="rounded-md border bg-muted/30 p-4 space-y-3 text-sm">
          <h3 className="font-semibold">Ako to funguje</h3>
          <p className="text-xs text-muted-foreground">
            Server-side probe zavolá každú funkciu autentifikovaným <code>POST</code> s telom{" "}
            <code>{`{ __probe: true }`}</code>. Klasifikuje sa reálna odpoveď workera:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Funguje</p>
                <p className="text-xs text-muted-foreground">
                  Handler sa spustil a odpovedal. Zahŕňa 2xx (OK), 400/422 (validácia zamietla probe),
                  401/403 (auth guard funguje), 405 (metóda zamietnutá), 429 (rate-limit funguje).
                  Vo všetkých prípadoch kód funkcie reálne beží.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Nefunguje</p>
                <p className="text-xs text-muted-foreground">
                  <strong>404</strong> = funkcia nie je nasadená pod týmto názvom. <strong>5xx</strong>{" "}
                  = worker spadol (boot error, chýbajúci import, unhandled exception).{" "}
                  <strong>Network</strong> = gateway nedostupný. Toto sú reálne bugy na opravu.
                </p>
              </div>
            </div>
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
