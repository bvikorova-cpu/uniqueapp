import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2, Play, RefreshCw, Download, ExternalLink, MonitorPlay, Copy, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

type Run = {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  created_at: string;
  html_url: string;
  head_branch: string;
  run_number: number;
};

type Artifact = {
  id: number;
  name: string;
  size_in_bytes: number;
  expired: boolean;
  created_at: string;
};

export default function AdminCrawler() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [artifacts, setArtifacts] = useState<Record<number, Artifact[]>>({});
  const [loading, setLoading] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [routeLimit, setRouteLimit] = useState("0");
  const [suite, setSuite] = useState<"crawler" | "authed">("crawler");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [liveRunId, setLiveRunId] = useState<number | null>(null);
  const [liveRunStatus, setLiveRunStatus] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function call(action: string, extra: Record<string, unknown> = {}) {
    // Consolidated into admin-vitals (op: "crawler") to respect Supabase edge-function quota.
    const { data, error } = await supabase.functions.invoke("admin-vitals", {
      body: { op: "crawler", action, ...extra },
    });
    if (error) throw error;
    if (!data?.ok) throw new Error(data?.error || "Unknown error");
    return data;
  }

  async function loadRuns(silent = false) {
    if (!silent) setLoading(true);
    try {
      const d = await call("list", { suite });
      setRuns(d.runs);
      setLastUpdated(new Date());
      const active = d.runs.find((r: Run) =>
        r.status === "in_progress" || r.status === "queued" || r.status === "waiting" || r.status === "pending"
      );
      if (active) {
        setLiveRunId(active.id);
        setLiveRunStatus(active.status);
      } else {
        setLiveRunId(null);
        setLiveRunStatus(null);
      }
    } catch (e) {
      toast.error(`Načítanie zlyhalo: ${(e as Error).message}`);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function dispatch() {
    setDispatching(true);
    try {
      await call("dispatch", { route_limit: routeLimit });
      toast.success("Crawler spustený. Beh sa objaví o ~10s.");
      setTimeout(() => loadRuns(true), 8000);
    } catch (e) {
      toast.error(`Spustenie zlyhalo: ${(e as Error).message}`);
    } finally {
      setDispatching(false);
    }
  }

  async function loadArtifacts(runId: number) {
    try {
      const d = await call("artifacts", { run_id: runId });
      setArtifacts((s) => ({ ...s, [runId]: d.artifacts }));
      setExpanded(runId);
    } catch (e) {
      toast.error(`Artefakty: ${(e as Error).message}`);
    }
  }

  async function download(artifactId: number, name: string) {
    try {
      const d = await call("download", { artifact_id: artifactId });
      const a = document.createElement("a");
      a.href = d.url;
      a.download = `${name}.zip`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      toast.error(`Stiahnutie: ${(e as Error).message}`);
    }
  }

  useEffect(() => {
    loadRuns();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRefresh && liveRunId) {
      intervalRef.current = setInterval(() => loadRuns(true), 15000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, liveRunId]);

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold">Pre-launch Crawler</h1>
        <p className="text-muted-foreground">Spustí Playwright audit všetkých routes cez GitHub Actions a zobrazí report.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Spustiť nový beh</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <label className="text-sm">Route limit (0 = všetky)</label>
            <Input type="number" min={0} value={routeLimit} onChange={(e) => setRouteLimit(e.target.value)} className="w-40" />
          </div>
          <Button onClick={dispatch} disabled={dispatching}>
            {dispatching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Spustiť crawler
          </Button>
          <Button variant="outline" onClick={() => loadRuns()} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Obnoviť
          </Button>
        </CardContent>
      </Card>

      {liveRunId && (
        <Card className="border-blue-500/40 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
              Live beh #{runs.find((r) => r.id === liveRunId)?.run_number}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <StatusBadge status={liveRunStatus ?? "in_progress"} conclusion={null} />
              <span className="text-muted-foreground text-xs">
                {lastUpdated ? `Aktualizované: ${lastUpdated.toLocaleTimeString()}` : ""}
              </span>
            </div>
            <Progress value={100} className="h-2 animate-pulse" />
            <p className="text-xs text-muted-foreground">
              Beh sa automaticky obnovuje každých 15 s. Po dokončení tu pribudne tlačidlo na stiahnutie reportu.
            </p>
            <div className="flex items-center gap-2">
              <input
                id="auto-refresh"
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-muted"
              />
              <label htmlFor="auto-refresh" className="text-sm">Auto-obnovovanie</label>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/40">
        <CardHeader>
          <CardTitle>Lokálne (bez GitHub Actions)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Spusti in-browser crawler priamo v tomto prehliadači — beží cez iframe, nepotrebuje CI ani billing.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/button-tester" target="_blank" rel="noopener noreferrer">
              <Button>
                <MonitorPlay className="w-4 h-4 mr-2" />
                Spustiť v prehliadači
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                const cmd = "bunx playwright test e2e/crawler/all-buttons-crawler.spec.ts --project=crawler --reporter=list && node e2e/crawler/generate-report.mjs";
                navigator.clipboard.writeText(cmd);
                toast.success("Príkaz skopírovaný — spusti v termináli repa.");
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Kopírovať Playwright príkaz
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            In-browser variant obsiahne ~2800 routes a bezpečné kliky. Playwright variant beží headless Chromium a produkuje <code>e2e/crawler-report/</code> so screenshotmi.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Posledné behy</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {runs.length === 0 && !loading && <p className="text-sm text-muted-foreground">Žiadne behy zatiaľ.</p>}
          {runs.map((r) => (
            <div key={r.id} className="border rounded-lg p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium">#{r.run_number} · {r.head_branch}</div>
                  <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.status} conclusion={r.conclusion} />
                  <Button size="sm" variant="outline" onClick={() => loadArtifacts(r.id)}>
                    Report
                  </Button>
                  <a href={r.html_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="ghost"><ExternalLink className="w-4 h-4" /></Button>
                  </a>
                </div>
              </div>
              {expanded === r.id && (
                <div className="mt-3 border-t pt-3 space-y-2">
                  {(artifacts[r.id] ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      {r.status === "completed" ? "Bez artefaktov." : "Beh ešte prebieha — artefakty budú po dokončení."}
                    </p>
                  )}
                  {(artifacts[r.id] ?? []).map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-sm">
                      <span>{a.name} · {(a.size_in_bytes / 1024 / 1024).toFixed(1)} MB {a.expired && "(expired)"}</span>
                      <Button size="sm" onClick={() => download(a.id, a.name)} disabled={a.expired}>
                        <Download className="w-4 h-4 mr-1" /> Stiahnuť
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Report ZIP obsahuje <code>report.html</code> so screenshotmi. Rozbaľ a otvor lokálne v prehliadači.
      </p>
    </div>
  );
}

function StatusBadge({ status, conclusion }: { status: string; conclusion: string | null }) {
  const label = conclusion || status;
  const color =
    conclusion === "success" ? "bg-green-500/15 text-green-600"
    : conclusion === "failure" ? "bg-red-500/15 text-red-600"
    : status === "in_progress" || status === "queued" ? "bg-blue-500/15 text-blue-600"
    : "bg-muted text-muted-foreground";
  return <span className={`text-xs px-2 py-1 rounded ${color}`}>{label}</span>;
}
