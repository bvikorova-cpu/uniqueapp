// Admin-only multi-purpose endpoint:
// - default: Web Vitals reporting (per-metric p50/p75/p95 + good%, daily p75 series)
// - op="crawler": consolidated crawler-control (dispatch GitHub Actions, list runs, artifacts, download URL)
// Consolidated to stay within Supabase edge-function quota. Auth enforced via has_role().
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// deno-lint-ignore no-explicit-any
type Json = any;

const WORKFLOW_FILE = "crawler.yml";
const AUTHED_WORKFLOW_FILE = "authed-e2e.yml";

function resolveWorkflow(suite?: string) {
  return suite === "authed" ? AUTHED_WORKFLOW_FILE : WORKFLOW_FILE;
}

function ghEnv() {
  const token = Deno.env.get("GITHUB_PERSONAL_ACCESS_TOKEN") || Deno.env.get("GITHUB_TOKEN");
  const owner = Deno.env.get("GITHUB_OWNER");
  const repo = Deno.env.get("GITHUB_REPO");
  if (!token || !owner || !repo) {
    throw new Error("Missing GITHUB_PERSONAL_ACCESS_TOKEN / GITHUB_OWNER / GITHUB_REPO secrets");
  }
  return { token, owner, repo };
}

async function gh(path: string, init: RequestInit = {}, timeoutMs = 15000) {
  const { token, owner, repo } = ghEnv();
  const url = `https://api.github.com/repos/${owner}/${repo}${path}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
    });
    const text = await res.text();
    let data: Json = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) throw new Error(`GitHub ${res.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
    return data;
  } catch (e) {
    if ((e as Error)?.name === "AbortError") {
      throw new Error(`GitHub API timeout after ${timeoutMs}ms`);
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms)),
  ]);
}

async function requireAdmin(auth: string) {
  const anon = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: auth } } },
  );
  const { data: userRes } = await anon.auth.getUser();
  const user = userRes?.user;
  if (!user) throw new Error("Unauthorized");
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: roles } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);
  if (!roles?.some((r: { role: string }) => r.role === "admin")) {
    throw new Error("Forbidden: admin only");
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: jsonHeaders,
      });
    }

    const body: Json = await req.json().catch(() => ({}));

    // ---------- Consolidated crawler-control ----------
    if (body?.op === "crawler") {
      await requireAdmin(auth);
      const action = body?.action || "list";

      if (action === "dispatch") {
        const routeLimit = String(body?.route_limit ?? "0");
        const wf = resolveWorkflow(body?.suite);
        await gh(`/actions/workflows/${wf}/dispatches`, {
          method: "POST",
          body: JSON.stringify({ ref: body?.ref || "main", inputs: wf === WORKFLOW_FILE ? { route_limit: routeLimit } : {} }),
        });
        return new Response(JSON.stringify({ ok: true, dispatched: true, workflow: wf }), { headers: jsonHeaders });
      }
      if (action === "list") {
        const wf = resolveWorkflow(body?.suite);
        const runs = await gh(`/actions/workflows/${wf}/runs?per_page=15`);
        return new Response(JSON.stringify({ ok: true, runs: runs?.workflow_runs ?? [] }), { headers: jsonHeaders });
      }
      if (action === "artifacts") {
        const runId = body?.run_id;
        if (!runId) throw new Error("run_id required");
        const arts = await gh(`/actions/runs/${runId}/artifacts`);
        return new Response(JSON.stringify({ ok: true, artifacts: arts?.artifacts ?? [] }), { headers: jsonHeaders });
      }
      if (action === "download") {
        const artifactId = body?.artifact_id;
        if (!artifactId) throw new Error("artifact_id required");
        const { token, owner, repo } = ghEnv();
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/actions/artifacts/${artifactId}/zip`,
          { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }, redirect: "manual" },
        );
        const location = res.headers.get("location");
        if (!location) throw new Error(`No download URL (status ${res.status})`);
        return new Response(JSON.stringify({ ok: true, url: location }), { headers: jsonHeaders });
      }
      return new Response(JSON.stringify({ ok: false, error: "unknown crawler action" }), { status: 400, headers: jsonHeaders });
    }

    // ---------- Default: Web Vitals ----------
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );

    const { days = 7, metric = "LCP", route = null } = body || {};
    const safeDays = Math.min(Math.max(parseInt(String(days), 10) || 7, 1), 90);
    const safeMetric = ["LCP", "CLS", "INP", "FCP", "TTFB"].includes(metric) ? metric : "LCP";

    const [{ data: summary, error: e1 }, { data: daily, error: e2 }] = await Promise.all([
      supabase.rpc("get_vitals_summary", { p_days: safeDays, p_route: route }),
      supabase.rpc("get_vitals_daily",   { p_days: safeDays, p_metric: safeMetric }),
    ]);
    if (e1) throw e1;
    if (e2) throw e2;

    return new Response(JSON.stringify({ summary, daily, days: safeDays, metric: safeMetric }), {
      headers: jsonHeaders,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const lower = msg.toLowerCase();
    const status = lower.includes("unauthorized") ? 401
      : lower.includes("forbidden") || lower.includes("permission") ? 403
      : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status, headers: jsonHeaders,
    });
  }
});
