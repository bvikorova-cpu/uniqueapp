import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Play, Square, RotateCcw, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import ROUTES from "@/utils/smokeTestRoutes.json";

type BtnResult = {
  route: string;
  total: number;
  clickable: number;
  skipped: number;
  crashed: number;
  errors: string[];
  navigated: number;
  ok: boolean;
  reason?: string;
  labels?: string[];
};

const SKIP_PATTERNS = [
  /delete|zmaz|remove|odstr[aá]n/i,
  /logout|odhl[aá]s|sign\s*out/i,
  /pay|zaplat|buy|k[uú]pi|checkout|withdraw|v[yý]ber|refund/i,
  /report|nahl[aá]s|block|zabloko/i,
  /confirm|potvr/i,
  /publish|deploy|nasad/i,
];

const IFRAME_TIMEOUT = 8000;
const MAX_CLICKS_PER_ROUTE = 40;

function classify(r: BtnResult) {
  if (!r.ok) return "fail";
  if (r.crashed > 0 || r.errors.length > 0) return "fail";
  if (r.total === 0) return "warn";
  return "pass";
}

export default function AdminButtonTester() {
  const [routes, setRoutes] = useState<string[]>(ROUTES as string[]);
  const [filter, setFilter] = useState("");
  const [results, setResults] = useState<Record<string, BtnResult>>({});
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState<string>("");
  const [clickButtons, setClickButtons] = useState(true);
  const abortRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const filtered = useMemo(
    () => routes.filter((r) => r.toLowerCase().includes(filter.toLowerCase())),
    [routes, filter]
  );

  const stats = useMemo(() => {
    const list = Object.values(results);
    return {
      total: list.length,
      pass: list.filter((r) => classify(r) === "pass").length,
      warn: list.filter((r) => classify(r) === "warn").length,
      fail: list.filter((r) => classify(r) === "fail").length,
      buttons: list.reduce((a, r) => a + r.total, 0),
      clicks: list.reduce((a, r) => a + r.clickable, 0),
    };
  }, [results]);

  async function probeRoute(route: string): Promise<BtnResult> {
    const iframe = iframeRef.current;
    if (!iframe) {
      return { route, total: 0, clickable: 0, skipped: 0, crashed: 0, errors: ["no iframe"], navigated: 0, ok: false, reason: "no iframe" };
    }

    const errors: string[] = [];
    const errHandler = (e: ErrorEvent) => {
      if (!/ResizeObserver/.test(e.message)) errors.push(e.message);
    };
    window.addEventListener("error", errHandler);

    try {
      // Load the route inside the iframe
      const loaded = await new Promise<boolean>((resolve) => {
        const t = setTimeout(() => resolve(false), IFRAME_TIMEOUT);
        iframe.onload = () => {
          clearTimeout(t);
          resolve(true);
        };
        try {
          iframe.src = route;
        } catch {
          resolve(false);
        }
      });

      if (!loaded) {
        return { route, total: 0, clickable: 0, skipped: 0, crashed: 0, errors: [], navigated: 0, ok: false, reason: "iframe load timeout" };
      }

      // Give React a moment to render
      await new Promise((r) => setTimeout(r, 900));

      const doc = iframe.contentDocument;
      const win = iframe.contentWindow;
      if (!doc || !win) {
        return { route, total: 0, clickable: 0, skipped: 0, crashed: 0, errors: [], navigated: 0, ok: false, reason: "no document" };
      }

      // Not found detection
      const bodyText = (doc.body.innerText || "").slice(0, 4000);
      if (/404|not found|nen[aá]jden/i.test(bodyText.slice(0, 400))) {
        return { route, total: 0, clickable: 0, skipped: 0, crashed: 0, errors: [], navigated: 0, ok: false, reason: "404 page" };
      }

      // Crash overlay?
      if (doc.querySelector("[data-unique-crash-overlay]")) {
        return { route, total: 0, clickable: 0, skipped: 0, crashed: 1, errors: ["crash overlay"], navigated: 0, ok: false, reason: "crash on load" };
      }

      // Attach error listener in iframe
      const iframeErrs: string[] = [];
      win.addEventListener("error", (e: any) => {
        if (!/ResizeObserver/.test(e.message || "")) iframeErrs.push(String(e.message || e));
      });
      win.addEventListener("unhandledrejection", (e: any) => {
        iframeErrs.push(String(e.reason?.message || e.reason || "unhandledrejection"));
      });

      const nodeList = doc.querySelectorAll<HTMLElement>(
        'button, a[role="button"], [role="button"], input[type="button"], input[type="submit"]'
      );
      const nodes = Array.from(nodeList);

      const labels: string[] = [];
      let clickable = 0;
      let skipped = 0;
      let crashed = 0;
      let navigated = 0;
      const startUrl = win.location.pathname;

      const nodesToClick = clickButtons ? nodes.slice(0, MAX_CLICKS_PER_ROUTE) : [];

      for (const el of nodes) {
        const t = (el.innerText || el.getAttribute("aria-label") || el.getAttribute("title") || "").trim().replace(/\s+/g, " ").slice(0, 60);
        if (t) labels.push(t);
      }

      for (const el of nodesToClick) {
        if (abortRef.current) break;
        const label = (el.innerText || el.getAttribute("aria-label") || "").trim();
        if (!label) {
          skipped++;
          continue;
        }
        if (SKIP_PATTERNS.some((p) => p.test(label))) {
          skipped++;
          continue;
        }
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          skipped++;
          continue;
        }
        try {
          el.click();
          clickable++;
          await new Promise((r) => setTimeout(r, 120));
          if (doc.querySelector("[data-unique-crash-overlay]")) {
            crashed++;
            iframeErrs.push(`crash after "${label}"`);
            break;
          }
          if (win.location.pathname !== startUrl) {
            navigated++;
            // return to route
            iframe.src = route;
            await new Promise<void>((r) => {
              const t = setTimeout(() => r(), 3000);
              iframe.onload = () => {
                clearTimeout(t);
                r();
              };
            });
            await new Promise((r) => setTimeout(r, 400));
            break;
          }
          // Close modals
          try {
            const ev = new (win as any).KeyboardEvent("keydown", { key: "Escape", bubbles: true });
            doc.dispatchEvent(ev);
          } catch {}
        } catch (err: any) {
          iframeErrs.push(`click "${label}": ${err?.message || err}`);
        }
      }

      const ok = crashed === 0 && iframeErrs.length === 0;
      return {
        route,
        total: nodes.length,
        clickable,
        skipped,
        crashed,
        errors: iframeErrs,
        navigated,
        ok,
        reason: ok ? undefined : (iframeErrs[0] || "crashed"),
        labels: labels.slice(0, 20),
      };
    } catch (e: any) {
      return { route, total: 0, clickable: 0, skipped: 0, crashed: 0, errors: [String(e?.message || e)], navigated: 0, ok: false, reason: e?.message };
    } finally {
      window.removeEventListener("error", errHandler);
    }
  }

  async function runAll(list: string[]) {
    setRunning(true);
    abortRef.current = false;
    setProgress(0);
    setResults({});
    for (let i = 0; i < list.length; i++) {
      if (abortRef.current) break;
      const r = list[i];
      setCurrent(r);
      const res = await probeRoute(r);
      setResults((prev) => ({ ...prev, [r]: res }));
      setProgress(Math.round(((i + 1) / list.length) * 100));
    }
    setRunning(false);
    setCurrent("");
  }

  async function runOne(route: string) {
    setRunning(true);
    setCurrent(route);
    const res = await probeRoute(route);
    setResults((prev) => ({ ...prev, [route]: res }));
    setRunning(false);
    setCurrent("");
  }

  function downloadReport() {
    const list = Object.values(results);
    const fails = list.filter((r) => classify(r) === "fail");
    const warns = list.filter((r) => classify(r) === "warn");
    const passes = list.filter((r) => classify(r) === "pass");

    const lines: string[] = [];
    lines.push(`# Button Tester Report — ${new Date().toISOString()}`);
    lines.push(`Routes: ${list.length}  |  Pass: ${passes.length}  |  Warn: ${warns.length}  |  Fail: ${fails.length}`);
    lines.push(`Total buttons found: ${stats.buttons}  |  Clicked: ${stats.clicks}`);
    lines.push("");

    const dump = (title: string, arr: BtnResult[]) => {
      lines.push(`\n===== ${title} (${arr.length}) =====`);
      for (const r of arr) {
        lines.push(`\n[${r.route}]`);
        lines.push(`  total=${r.total} clicked=${r.clickable} skipped=${r.skipped} crashed=${r.crashed} navigated=${r.navigated}`);
        if (r.reason) lines.push(`  reason: ${r.reason}`);
        if (r.errors.length) {
          for (const e of r.errors.slice(0, 5)) lines.push(`  ! ${e}`);
        }
        if (r.labels?.length) {
          lines.push(`  labels: ${r.labels.slice(0, 10).join(" | ")}`);
        }
      }
    };
    dump("FAIL", fails);
    dump("WARN (no buttons found)", warns);
    dump("PASS", passes);

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `button-tester-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="container mx-auto py-6 space-y-4 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Admin — Button Tester</h1>
          <p className="text-sm text-muted-foreground">
            Načíta každú route v skrytom iframe, nájde všetky tlačidlá a bezpečne ich odklikne. Preskočí platby, delete, logout, report a podobné deštruktívne akcie.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => runAll(filtered)} disabled={running} size="sm">
            <Play className="h-4 w-4 mr-1" /> Test all ({filtered.length})
          </Button>
          <Button
            onClick={() => {
              abortRef.current = true;
            }}
            disabled={!running}
            size="sm"
            variant="destructive"
          >
            <Square className="h-4 w-4 mr-1" /> Stop
          </Button>
          <Button onClick={() => setResults({})} disabled={running} size="sm" variant="outline">
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </Button>
          <Button onClick={downloadReport} disabled={Object.keys(results).length === 0} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-1" /> Stiahnuť report
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Filter routes…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={clickButtons}
              onChange={(e) => setClickButtons(e.target.checked)}
              disabled={running}
            />
            Klikať tlačidlá (nie len počítať)
          </label>
          <div className="flex gap-2 text-xs ml-auto">
            <Badge variant="outline" className="bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" /> Pass {stats.pass}
            </Badge>
            <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950">
              <AlertTriangle className="h-3 w-3 mr-1 text-amber-600" /> Warn {stats.warn}
            </Badge>
            <Badge variant="outline" className="bg-red-50 dark:bg-red-950">
              <XCircle className="h-3 w-3 mr-1 text-red-600" /> Fail {stats.fail}
            </Badge>
            <Badge variant="secondary">Buttons {stats.buttons}</Badge>
            <Badge variant="secondary">Clicked {stats.clicks}</Badge>
          </div>
        </div>
        {running && (
          <div className="space-y-1">
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground">
              {progress}% — testujem <code>{current}</code>
            </p>
          </div>
        )}
        <details className="text-xs">
          <summary className="cursor-pointer">Legenda</summary>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>✅ <b>Pass</b> — route sa načíta, nájdené tlačidlá, žiadny crash ani runtime error po kliknutiach.</li>
            <li>⚠️ <b>Warn</b> — route sa načíta, ale nenašli sa žiadne tlačidlá (skontroluj či nie je gated / prázdna).</li>
            <li>❌ <b>Fail</b> — 404 stránka, iframe timeout, crash overlay, alebo runtime error po kliknutí.</li>
          </ul>
        </details>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_600px] gap-4">
        <Card className="p-2 max-h-[75vh] overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-background">
              <tr className="text-left border-b">
                <th className="p-2">Route</th>
                <th className="p-2 text-right">Total</th>
                <th className="p-2 text-right">Clicked</th>
                <th className="p-2 text-right">Skip</th>
                <th className="p-2">Status</th>
                <th className="p-2">Reason</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((route) => {
                const r = results[route];
                const cls = r ? classify(r) : null;
                return (
                  <tr key={route} className="border-b hover:bg-muted/40">
                    <td className="p-2 font-mono">{route}</td>
                    <td className="p-2 text-right">{r?.total ?? "—"}</td>
                    <td className="p-2 text-right">{r?.clickable ?? "—"}</td>
                    <td className="p-2 text-right">{r?.skipped ?? "—"}</td>
                    <td className="p-2">
                      {cls === "pass" && <Badge className="bg-green-600">Pass</Badge>}
                      {cls === "warn" && <Badge className="bg-amber-500">Warn</Badge>}
                      {cls === "fail" && <Badge variant="destructive">Fail</Badge>}
                      {!cls && <Badge variant="outline">—</Badge>}
                    </td>
                    <td className="p-2 text-muted-foreground truncate max-w-[240px]" title={r?.reason || r?.errors?.[0]}>
                      {r?.reason || r?.errors?.[0] || ""}
                    </td>
                    <td className="p-2">
                      <Button size="sm" variant="ghost" disabled={running} onClick={() => runOne(route)}>
                        Test
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card className="p-2 hidden lg:block">
          <div className="text-xs text-muted-foreground mb-1 px-2">Live preview (iframe)</div>
          <iframe
            ref={iframeRef}
            title="button-tester-frame"
            className="w-full h-[70vh] border rounded"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </Card>
      </div>

      {/* Hidden iframe fallback if the visible one isn't mounted (mobile) */}
      {typeof window !== "undefined" && !iframeRef.current && (
        <iframe ref={iframeRef} title="hidden-tester-frame" className="hidden" />
      )}
    </div>
  );
}
