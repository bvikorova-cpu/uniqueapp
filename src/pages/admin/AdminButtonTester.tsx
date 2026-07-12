import { useEffect, useMemo, useRef, useState } from "react";
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
  testedAt?: string;
  durationMs?: number;
  loadedUrl?: string;
  evidence?: {
    bodyHash: string;
    textSample: string;
    overlayTriggers: number;
    openedOverlays: number;
    readyMs: number;
    source: string;
  };
};

const SKIP_PATTERNS = [
  /delete|zmaz|remove|odstr[aá]n/i,
  /logout|odhl[aá]s|sign\s*out/i,
  /pay|zaplat|buy|k[uú]pi|checkout|withdraw|v[yý]ber|refund/i,
  /report|nahl[aá]s|block|zabloko/i,
  /confirm|potvr/i,
  /publish|deploy|nasad/i,
  /test\s*all|run\s*all|smoke|probe|audit|scan|tester|spusti|otest/i,
];

const IFRAME_TIMEOUT = 7000;
const READY_TIMEOUT = 5000;
const MAX_CLICKS_PER_ROUTE = 25;
const DEFAULT_BATCH_SIZE = 20;
const MAX_BATCH_SIZE = 40;
const IFRAME_RECYCLE_EVERY = 5;
const CHECKPOINT_KEY = "unique-button-tester-checkpoint-v3";
const SELF_TESTER_ROUTES = new Set(["/admin/button-tester"]);

type Checkpoint = {
  updatedAt: string;
  results: Record<string, BtnResult>;
  routesTotal: number;
};

// Extended selector — counts every interactive element, not just <button>
const INTERACTIVE_SELECTOR = [
  'button',
  'a[role="button"]',
  'a[href]',
  '[role="button"]',
  '[role="menuitem"]',
  '[role="tab"]',
  '[role="option"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="link"]',
  'input[type="button"]',
  'input[type="submit"]',
  'input[type="checkbox"]',
  'input[type="radio"]',
  'label[for]',
  'summary',
  '[data-radix-collection-item]',
  '[aria-haspopup]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

// Elements that open overlays with nested buttons — we open, count, close
const OVERLAY_TRIGGER_SELECTOR = [
  '[aria-haspopup="menu"]',
  '[aria-haspopup="dialog"]',
  '[aria-haspopup="listbox"]',
  '[aria-haspopup="true"]',
  '[data-state="closed"][aria-expanded]',
  '[role="tab"]',
  '[data-radix-accordion-trigger]',
  'summary',
].join(', ');


function classify(r: BtnResult) {
  if (!r.ok) return "fail";
  if (r.crashed > 0 || r.errors.length > 0) return "fail";
  if (r.total === 0) return "warn";
  return "pass";
}

function withTesterQuery(route: string) {
  try {
    const url = new URL(route, window.location.origin);
    url.searchParams.set("__button_tester", "1");
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    const joiner = route.includes("?") ? "&" : "?";
    return `${route}${joiner}__button_tester=1`;
  }
}

export default function AdminButtonTester() {
  const [routes] = useState<string[]>(ROUTES as string[]);
  const [filter, setFilter] = useState("");
  const [results, setResults] = useState<Record<string, BtnResult>>({});
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState<string>("");
  const [clickButtons, setClickButtons] = useState(true);
  const [batchSize, setBatchSize] = useState(DEFAULT_BATCH_SIZE);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [checkpointLabel, setCheckpointLabel] = useState<string | null>(null);
  const abortRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const checkpoint = loadCheckpoint();
    if (checkpoint) setCheckpointLabel(formatCheckpointLabel(checkpoint));
  }, []);

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

  const visibleTableRoutes = useMemo(() => {
    if (filter) return filtered.slice(0, 500);
    const tested = filtered.filter((route) => results[route]);
    const recentTested = tested.slice(-320);
    const nextPending = filtered.filter((route) => !results[route]).slice(0, 120);
    return Array.from(new Set([...recentTested, current, ...nextPending].filter(Boolean)));
  }, [current, filter, filtered, results]);

  function loadCheckpoint(): Checkpoint | null {
    try {
      const raw = localStorage.getItem(CHECKPOINT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Checkpoint;
      if (!parsed?.results || typeof parsed.results !== "object") return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function formatCheckpointLabel(checkpoint: Checkpoint) {
    const tested = Object.keys(checkpoint.results).length;
    return `${tested}/${checkpoint.routesTotal} uložené — ${new Date(checkpoint.updatedAt).toLocaleString()}`;
  }

  function saveCheckpoint(nextResults: Record<string, BtnResult>, routesTotal: number) {
    try {
      const checkpoint: Checkpoint = {
        updatedAt: new Date().toISOString(),
        results: nextResults,
        routesTotal,
      };
      localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(checkpoint));
      setCheckpointLabel(formatCheckpointLabel(checkpoint));
    } catch {
      // The tester must keep running even if localStorage quota is full.
    }
  }

  async function recycleIframe(hard = false) {
    try {
      const iframe = iframeRef.current;
      if (iframe) {
        iframe.onload = null;
        iframe.src = "about:blank";
      }
    } catch {
      // noop
    }

    if (hard) {
      setIframeKey((key) => key + 1);
      await new Promise((resolve) => setTimeout(resolve, 350));
    } else {
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
  }

  async function probeRoute(route: string): Promise<BtnResult> {
    if (SELF_TESTER_ROUTES.has(route)) {
      return { route, total: 0, clickable: 0, skipped: 0, crashed: 0, errors: [], navigated: 0, ok: true, reason: "self-tester route skipped" };
    }

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
      // Load the route inside the iframe (use about:blank between loads so onload always fires)
      const loaded = await new Promise<boolean>((resolve) => {
        let done = false;
        const finish = (ok: boolean) => {
          if (done) return;
          done = true;
          resolve(ok);
        };
        const t = setTimeout(() => finish(false), IFRAME_TIMEOUT);
        iframe.onload = () => {
          if (iframe.contentWindow?.location.href === "about:blank") return;
          clearTimeout(t);
          finish(true);
        };
        try {
          // Force a reload even if the src is the same as previous
          iframe.src = "about:blank";
          setTimeout(() => {
            try {
              iframe.src = withTesterQuery(route);
            } catch {
              finish(false);
            }
          }, 30);
        } catch {
          finish(false);
        }
      });

      if (!loaded) {
        return { route, total: 0, clickable: 0, skipped: 0, crashed: 0, errors: [], navigated: 0, ok: false, reason: "iframe load timeout" };
      }


      // Wait until the app actually renders (not stuck on "Loading Unique…" suspense fallback).
      // Poll for interactive elements or meaningful body text; hard-cap at 6s to keep the run moving.
      const READY_TIMEOUT = 6000;
      const readyStart = Date.now();
      let readyReason = "";
      while (Date.now() - readyStart < READY_TIMEOUT) {
        const d = iframe.contentDocument;
        if (!d || !d.body) { await new Promise((r) => setTimeout(r, 120)); continue; }
        const txt = (d.body.innerText || "").trim();
        const stillLoading = /^loading unique/i.test(txt) || txt.length < 3;
        const hasInteractive = d.querySelector(INTERACTIVE_SELECTOR);
        const hasCrash = d.querySelector("[data-unique-crash-overlay]");
        if (hasCrash) { readyReason = "crash"; break; }
        if (!stillLoading && (hasInteractive || txt.length > 30)) { readyReason = "ready"; break; }
        await new Promise((r) => setTimeout(r, 150));
      }
      if (readyReason !== "ready" && readyReason !== "crash") {
        return { route, total: 0, clickable: 0, skipped: 0, crashed: 0, errors: [], navigated: 0, ok: false, reason: "stuck on loading" };
      }

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

      // ---- DEEP SCAN ----
      // 1) baseline enumeration
      const seen = new WeakSet<Element>();
      const labels: string[] = [];
      const countNodes = () => {
        const list = Array.from(doc.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR));
        let added = 0;
        for (const el of list) {
          if (seen.has(el)) continue;
          const rect = el.getBoundingClientRect();
          // skip zero-size hidden elements
          if (rect.width === 0 && rect.height === 0) continue;
          seen.add(el);
          added++;
          const t = (el.innerText || el.getAttribute("aria-label") || el.getAttribute("title") || el.getAttribute("name") || "").trim().replace(/\s+/g, " ").slice(0, 60);
          if (t && labels.length < 60) labels.push(t);
        }
        return added;
      };

      countNodes();

      // 2) open every overlay trigger (dialog, menu, popover, tabs, accordion), count nested, close
      const triggers = Array.from(doc.querySelectorAll<HTMLElement>(OVERLAY_TRIGGER_SELECTOR));
      let overlaysOpened = 0;
      for (const trg of triggers.slice(0, 20)) {
        if (abortRef.current) break;
        try {
          const label = (trg.innerText || trg.getAttribute("aria-label") || "").trim();
          if (SKIP_PATTERNS.some((p) => p.test(label))) continue;
          const rect = trg.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          trg.click();
          overlaysOpened++;
          await new Promise((r) => setTimeout(r, 180));
          if (doc.querySelector("[data-unique-crash-overlay]")) {
            return { route, total: 0, clickable: 0, skipped: 0, crashed: 1, errors: [`crash opening "${label}"`], navigated: 0, ok: false, reason: "crash opening overlay", labels };
          }
          countNodes(); // count new nested items now visible
          // close via Escape
          try {
            const ev = new (win as any).KeyboardEvent("keydown", { key: "Escape", bubbles: true });
            doc.dispatchEvent(ev);
            doc.activeElement && (doc.activeElement as HTMLElement).blur?.();
          } catch {}
          await new Promise((r) => setTimeout(r, 80));
        } catch {}
      }

      // Recount all visible interactive elements after overlays were opened

      const finalCount = Array.from(doc.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR)).filter((el) => {
        const r = el.getBoundingClientRect();
        return !(r.width === 0 && r.height === 0);
      }).length;

      // (error listeners already attached above)

      // 3) safe click sample (visible, non-destructive, non-navigating)
      let clickable = 0;
      let skipped = 0;
      let crashed = 0;
      let navigated = 0;
      const startUrl = win.location.pathname;

      if (clickButtons) {
        const clickables = Array.from(doc.querySelectorAll<HTMLElement>('button, [role="button"], a[role="button"]'));
        for (const el of clickables.slice(0, MAX_CLICKS_PER_ROUTE)) {
          if (abortRef.current) break;
          const label = (el.innerText || el.getAttribute("aria-label") || "").trim();
          if (!label) { skipped++; continue; }
          if (SKIP_PATTERNS.some((p) => p.test(label))) { skipped++; continue; }
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) { skipped++; continue; }
          try {
            el.click();
            clickable++;
            await new Promise((r) => setTimeout(r, 90));
            if (doc.querySelector("[data-unique-crash-overlay]")) {
              crashed++;
              iframeErrs.push(`crash after "${label}"`);
              break;
            }
            if (win.location.pathname !== startUrl) {
              navigated++;
              iframe.src = withTesterQuery(route);
              await new Promise<void>((r) => {
                const t = setTimeout(() => r(), 3000);
                iframe.onload = () => { clearTimeout(t); r(); };
              });
              await new Promise((r) => setTimeout(r, 400));
              break;
            }
            try {
              const ev = new (win as any).KeyboardEvent("keydown", { key: "Escape", bubbles: true });
              doc.dispatchEvent(ev);
            } catch {}
          } catch (err: any) {
            iframeErrs.push(`click "${label}": ${err?.message || err}`);
          }
        }
      }

      const ok = crashed === 0 && iframeErrs.length === 0;
      return {
        route,
        total: finalCount,
        clickable,
        skipped,
        crashed,
        errors: iframeErrs,
        navigated,
        ok,
        reason: ok ? (finalCount === 0 ? "no interactive elements" : `${overlaysOpened} overlays opened`) : (iframeErrs[0] || "crashed"),
        labels: labels.slice(0, 25),
      };
    } catch (e: any) {
      return { route, total: 0, clickable: 0, skipped: 0, crashed: 0, errors: [String(e?.message || e)], navigated: 0, ok: false, reason: e?.message };
    } finally {
      window.removeEventListener("error", errHandler);
    }
  }

  async function runAll(list: string[], resumeFromCheckpoint = false) {
    setRunning(true);
    abortRef.current = false;
    setProgress(0);
    const restored = resumeFromCheckpoint ? loadCheckpoint()?.results ?? {} : {};
    const nextResults: Record<string, BtnResult> = { ...restored };
    setResults(nextResults);

    const safeBatchSize = Math.max(10, Math.min(150, Number(batchSize) || DEFAULT_BATCH_SIZE));
    const startIndex = resumeFromCheckpoint
      ? Math.max(0, list.findIndex((route) => !nextResults[route]))
      : 0;

    await recycleIframe(true);

    for (let i = startIndex; i < list.length; i++) {
      if (abortRef.current) break;
      const r = list[i];
      setCurrent(r);
      const res = await probeRoute(r);
      nextResults[r] = res;

      if (i % 5 === 0 || !res.ok) {
        setResults({ ...nextResults });
      }

      if (i % 10 === 0) {
        saveCheckpoint(nextResults, list.length);
      }

      setProgress(Math.round(((i + 1) / list.length) * 100));

      const testedInThisRun = i - startIndex + 1;
      if (testedInThisRun % IFRAME_RECYCLE_EVERY === 0) {
        setCurrent(`Čistím iframe pamäť… ${i + 1}/${list.length}`);
        await recycleIframe(true);
      }

      if (testedInThisRun % safeBatchSize === 0) {
        setResults({ ...nextResults });
        saveCheckpoint(nextResults, list.length);
        setCurrent(`Krátka pauza kvôli pamäti… ${i + 1}/${list.length}`);
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    }
    setResults({ ...nextResults });
    saveCheckpoint(nextResults, list.length);
    await recycleIframe(true);
    setRunning(false);
    setCurrent("");
  }

  async function runOne(route: string) {
    setRunning(true);
    setCurrent(route);
    await recycleIframe(true);
    const res = await probeRoute(route);
    setResults((prev) => ({ ...prev, [route]: res }));
    await recycleIframe(!showLivePreview);
    setRunning(false);
    setCurrent("");
  }

  function restoreCheckpoint() {
    const checkpoint = loadCheckpoint();
    if (!checkpoint) return;
    setResults(checkpoint.results);
    setCheckpointLabel(formatCheckpointLabel(checkpoint));
    const tested = Object.keys(checkpoint.results).length;
    setProgress(Math.round((tested / Math.max(1, filtered.length)) * 100));
  }

  function clearCheckpoint() {
    try {
      localStorage.removeItem(CHECKPOINT_KEY);
    } catch {
      // noop
    }
    setCheckpointLabel(null);
    setResults({});
    setProgress(0);
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
          <Button onClick={() => runAll(filtered, true)} disabled={running} size="sm" variant="outline">
            <Play className="h-4 w-4 mr-1" /> Resume
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
          <Button onClick={clearCheckpoint} disabled={running} size="sm" variant="outline">
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
          <label className="flex items-center gap-2 text-sm">
            Batch
            <Input
              type="number"
              min={10}
              max={150}
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value) || DEFAULT_BATCH_SIZE)}
              disabled={running}
              className="h-8 w-20"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showLivePreview}
              onChange={(e) => setShowLivePreview(e.target.checked)}
              disabled={running}
            />
            Live preview
          </label>
          {checkpointLabel && (
            <Button onClick={restoreCheckpoint} disabled={running} size="sm" variant="ghost">
              Obnoviť checkpoint
            </Button>
          )}
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
        {checkpointLabel && (
          <p className="text-xs text-muted-foreground">
            Checkpoint: {checkpointLabel}. Report vieš stiahnuť aj z čiastočných výsledkov.
          </p>
        )}
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
            <li>🧠 Tester beží v batchoch, každých pár routes recykluje iframe a priebežne ukladá checkpoint, aby mobilný preview tab nespadol.</li>
          </ul>
        </details>
      </Card>

      <div className={showLivePreview ? "grid grid-cols-1 lg:grid-cols-[1fr_600px] gap-4" : "grid grid-cols-1 gap-4"}>
        <Card className="p-2 max-h-[75vh] overflow-auto">
          {!filter && filtered.length > visibleTableRoutes.length && (
            <div className="px-2 py-1 text-xs text-muted-foreground border-b">
              Kvôli výkonu zobrazujem posledné/ďalšie riadky ({visibleTableRoutes.length}/{filtered.length}); report obsahuje všetky výsledky.
            </div>
          )}
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
              {visibleTableRoutes.map((route) => {
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

        {showLivePreview ? (
          <Card className="p-2">
            <div className="text-xs text-muted-foreground mb-1 px-2">Live preview (iframe)</div>
            <iframe
              key={iframeKey}
              ref={iframeRef}
              title="button-tester-frame"
              className="w-full h-[70vh] border rounded bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </Card>
        ) : (
          <iframe
            key={iframeKey}
            ref={iframeRef}
            title="button-tester-frame-hidden"
            className="fixed -left-[9999px] top-0 h-[760px] w-[390px] opacity-0 pointer-events-none"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        )}
      </div>
    </div>
  );
}

