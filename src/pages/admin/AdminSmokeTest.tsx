import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import routesJson from "@/utils/smokeTestRoutes.json";

type RouteStatus = "pending" | "running" | "pass" | "fail" | "blank" | "timeout";
interface RouteResult {
  route: string;
  status: RouteStatus;
  errors: string[];
  durationMs?: number;
  textLength?: number;
}

// Detect mobile to lower memory pressure (mobile browsers kill tab after ~100 iframes)
const IS_MOBILE = typeof window !== "undefined" && window.innerWidth < 768;
const PARALLEL = IS_MOBILE ? 1 : 3;
const TIMEOUT_MS = 8000;
const BATCH_PAUSE_MS = IS_MOBILE ? 250 : 50; // give GC time
const IFRAME_W = IS_MOBILE ? 360 : 800;
const IFRAME_H = IS_MOBILE ? 500 : 600;

const ALL_ROUTES: string[] = (routesJson as string[]).filter((r) => r && r.startsWith("/"));
const LS_RUN_KEY = "smoke_test_active_run";

export default function AdminSmokeTest() {
  const [results, setResults] = useState<Record<string, RouteResult>>({});
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [runId, setRunId] = useState<string | null>(null);
  const [scope, setScope] = useState<"all" | "public">("public");
  const [resumeAvailable, setResumeAvailable] = useState<{ id: string; scope: "all" | "public" } | null>(null);
  const cancelRef = useRef(false);

  const routes = useMemo(
    () =>
      scope === "all"
        ? ALL_ROUTES
        : ALL_ROUTES.filter((r) => !r.startsWith("/admin") && !r.startsWith("/__e2e")),
    [scope],
  );

  // On mount: check for unfinished run in localStorage (resume after browser reload)
  useEffect(() => {
    const raw = localStorage.getItem(LS_RUN_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { id: string; scope: "all" | "public" };
      setResumeAvailable(parsed);
      setScope(parsed.scope);
    } catch {
      localStorage.removeItem(LS_RUN_KEY);
    }
  }, []);

  const summary = useMemo(() => {
    const list = Object.values(results);
    return {
      pass: list.filter((r) => r.status === "pass").length,
      fail: list.filter((r) => r.status === "fail").length,
      blank: list.filter((r) => r.status === "blank").length,
      timeout: list.filter((r) => r.status === "timeout").length,
    };
  }, [results]);

  const update = (route: string, patch: Partial<RouteResult>) =>
    setResults((prev) => ({ ...prev, [route]: { ...(prev[route] ?? { route, status: "pending", errors: [] }), ...patch } }));

  const testRoute = (route: string): Promise<RouteResult> =>
    new Promise((resolve) => {
      const start = performance.now();
      const errors: string[] = [];
      const iframe = document.createElement("iframe");
      iframe.style.cssText = `position:absolute;left:-9999px;top:-9999px;width:${IFRAME_W}px;height:${IFRAME_H}px;border:0;`;
      iframe.src = route + (route.includes("?") ? "&" : "?") + "smoke=1";

      let settled = false;
      const finalize = (status: RouteStatus, textLength?: number) => {
        if (settled) return;
        settled = true;
        window.removeEventListener("message", onMsg);
        clearTimeout(timer);
        // Free memory aggressively
        try {
          iframe.src = "about:blank";
        } catch {}
        setTimeout(() => iframe.remove(), 10);
        const dur = Math.round(performance.now() - start);
        const result: RouteResult = { route, status, errors, durationMs: dur, textLength };
        update(route, result);
        resolve(result);
      };

      const onMsg = (ev: MessageEvent) => {
        const d = ev.data;
        if (!d || !d.__smoke || d.route !== route.split("?")[0]) return;
        if (d.type === "error" || d.type === "console_error") {
          if (errors.length < 10) errors.push(d.payload?.message ?? "unknown");
        } else if (d.type === "ready") {
          if (d.payload?.hasCrash) finalize("fail", d.payload.textLength);
          else if ((d.payload?.textLength ?? 0) < 20) finalize("blank", d.payload?.textLength);
          else if (errors.length > 0) finalize("fail", d.payload?.textLength);
          else finalize("pass", d.payload?.textLength);
        }
      };

      const timer = window.setTimeout(() => finalize("timeout"), TIMEOUT_MS);
      window.addEventListener("message", onMsg);
      document.body.appendChild(iframe);
    });

  const executeRun = async (runRowId: string, routesToTest: string[], startCompleted: number) => {
    setRunId(runRowId);
    localStorage.setItem(LS_RUN_KEY, JSON.stringify({ id: runRowId, scope }));

    const queue = [...routesToTest];
    let completed = startCompleted;
    setDone(completed);

    const worker = async () => {
      while (queue.length && !cancelRef.current) {
        const route = queue.shift()!;
        update(route, { route, status: "running", errors: [] });
        const res = await testRoute(route);
        completed++;
        setDone(completed);
        try {
          await supabase.from("smoke_test_route_results").insert({
            run_id: runRowId,
            route,
            status: res.status,
            console_errors: res.errors,
            duration_ms: res.durationMs,
          });
        } catch (e) {
          console.warn("[smoke] insert failed", e);
        }
        if (BATCH_PAUSE_MS) await new Promise((r) => setTimeout(r, BATCH_PAUSE_MS));
      }
    };

    await Promise.all(Array.from({ length: PARALLEL }, worker));

    if (!cancelRef.current) {
      // Load all results to compute summary (state may be partial after resume)
      const { data: allRes } = await supabase
        .from("smoke_test_route_results")
        .select("status")
        .eq("run_id", runRowId);
      const pass = (allRes ?? []).filter((r) => r.status === "pass").length;
      const fail = (allRes ?? []).filter((r) => r.status === "fail").length;
      const blank = (allRes ?? []).filter((r) => r.status === "blank").length;
      await supabase
        .from("smoke_test_runs")
        .update({ finished_at: new Date().toISOString(), passed: pass, failed: fail, blank })
        .eq("id", runRowId);
      localStorage.removeItem(LS_RUN_KEY);
    }
    setRunning(false);
  };

  const run = async () => {
    cancelRef.current = false;
    setRunning(true);
    setResults({});
    setDone(0);
    setResumeAvailable(null);

    const { data: runRow, error: runErr } = await supabase
      .from("smoke_test_runs")
      .insert({ run_type: "manual", total_routes: routes.length })
      .select()
      .single();
    if (runErr) {
      alert("Cannot create run: " + runErr.message);
      setRunning(false);
      return;
    }
    await executeRun(runRow.id, routes, 0);
  };

  const resume = async () => {
    if (!resumeAvailable) return;
    cancelRef.current = false;
    setRunning(true);

    // Fetch what's already been tested
    const { data: existing } = await supabase
      .from("smoke_test_route_results")
      .select("route, status, duration_ms, console_errors")
      .eq("run_id", resumeAvailable.id);

    const done = new Set((existing ?? []).map((r) => r.route));
    const map: Record<string, RouteResult> = {};
    for (const r of existing ?? []) {
      map[r.route] = {
        route: r.route,
        status: r.status as RouteStatus,
        errors: (r.console_errors as string[]) ?? [],
        durationMs: r.duration_ms ?? undefined,
      };
    }
    setResults(map);
    setResumeAvailable(null);
    const remaining = routes.filter((r) => !done.has(r));
    await executeRun(resumeAvailable.id, remaining, done.size);
  };

  const discardResume = () => {
    localStorage.removeItem(LS_RUN_KEY);
    setResumeAvailable(null);
  };

  const stop = () => {
    cancelRef.current = true;
    setRunning(false);
  };

  const exportCSV = () => {
    const rows = [["route", "status", "errors", "duration_ms"]];
    for (const r of Object.values(results)) {
      rows.push([r.route, r.status, r.errors.join(" | "), String(r.durationMs ?? "")]);
    }
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smoke-test-${runId ?? Date.now()}.csv`;
    a.click();
  };

  const failedRoutes = Object.values(results).filter((r) => r.status === "fail" || r.status === "blank" || r.status === "timeout");
  const progress = routes.length ? Math.round((done / routes.length) * 100) : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🤖 Smoke Test – všetky routes</h1>
        <p className="text-muted-foreground mt-1">
          Automaticky otestuje {routes.length} routes a označí tie, ktoré padajú (crash, biela obrazovka, JS chyby).
        </p>
        {IS_MOBILE && (
          <p className="text-xs text-amber-500 mt-2">
            ⚠️ Si na mobile – test beží pomalšie (1 route naraz) aby nevyčerpal pamäť. Pre rýchlejší beh otvor v desktope.
          </p>
        )}
      </div>

      {resumeAvailable && !running && (
        <Card className="p-4 border-amber-500/50 bg-amber-500/5">
          <h2 className="font-semibold mb-2">🔄 Nedokončený test nájdený</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Predchádzajúci beh sa prerušil. Môžeš pokračovať tam, kde si skončil.
          </p>
          <div className="flex gap-2">
            <Button onClick={resume} size="sm">▶ Pokračovať</Button>
            <Button onClick={discardResume} variant="outline" size="sm">Zahodiť</Button>
          </div>
        </Card>
      )}

      <Card className="p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <Button variant={scope === "public" ? "default" : "outline"} size="sm" onClick={() => setScope("public")} disabled={running}>
            Verejné routes ({ALL_ROUTES.filter((r) => !r.startsWith("/admin") && !r.startsWith("/__e2e")).length})
          </Button>
          <Button variant={scope === "all" ? "default" : "outline"} size="sm" onClick={() => setScope("all")} disabled={running}>
            Všetky vrátane /admin ({ALL_ROUTES.length})
          </Button>
        </div>

        <div className="flex gap-2">
          {!running ? (
            <Button onClick={run} size="lg">▶ Spustiť smoke test</Button>
          ) : (
            <Button onClick={stop} variant="destructive" size="lg">⏹ Zastaviť</Button>
          )}
          {Object.keys(results).length > 0 && (
            <Button onClick={exportCSV} variant="outline">Exportovať CSV</Button>
          )}
        </div>

        {running || done > 0 ? (
          <div className="space-y-2">
            <Progress value={progress} />
            <div className="flex gap-4 text-sm flex-wrap">
              <span>Hotovo: <strong>{done}/{routes.length}</strong></span>
              <Badge variant="default">✓ Pass: {summary.pass}</Badge>
              <Badge variant="destructive">✗ Fail: {summary.fail}</Badge>
              <Badge variant="secondary">⬜ Blank: {summary.blank}</Badge>
              <Badge variant="outline">⏱ Timeout: {summary.timeout}</Badge>
            </div>
          </div>
        ) : null}
      </Card>

      {failedRoutes.length > 0 && (
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-3">🔴 Routes s problémom ({failedRoutes.length})</h2>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {failedRoutes.map((r) => (
                <div key={r.route} className="border-l-4 border-destructive pl-3 py-1">
                  <div className="flex gap-2 items-center">
                    <Badge variant="destructive">{r.status}</Badge>
                    <code className="text-sm">{r.route}</code>
                    <span className="text-xs text-muted-foreground ml-auto">{r.durationMs}ms</span>
                  </div>
                  {r.errors.length > 0 && (
                    <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
                      {r.errors.slice(0, 3).map((e, i) => <li key={i} className="truncate">{e}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}
