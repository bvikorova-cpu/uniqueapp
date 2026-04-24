// Frontend dependency vulnerability scan via OSV.dev (free, no API key).
// Reads package.json from GitHub (if configured) or accepts inline manifest.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const GH_OWNER = Deno.env.get("GITHUB_REPO_OWNER") ?? "";
const GH_REPO = Deno.env.get("GITHUB_REPO_NAME") ?? "";
const GH_TOKEN = Deno.env.get("GITHUB_TOKEN") ?? "";

type Severity = "critical" | "high" | "medium" | "low";
interface Vuln {
  package: string;
  installed: string;
  vuln_id: string;
  summary: string;
  severity: Severity;
  cvss?: number;
  fixed_in?: string;
  references?: string[];
}

function cleanVersion(v: string): string {
  return v.replace(/^[\^~>=<*\s]+/, "").trim();
}

function severityFromCvss(score?: number): Severity {
  if (score === undefined) return "medium";
  if (score >= 9.0) return "critical";
  if (score >= 7.0) return "high";
  if (score >= 4.0) return "medium";
  return "low";
}

async function fetchPackageJson(inline?: Record<string, unknown>) {
  if (inline) return inline;
  if (GH_OWNER && GH_REPO && GH_TOKEN) {
    const res = await fetch(
      `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/main/package.json`,
      { headers: { Authorization: `Bearer ${GH_TOKEN}`, "User-Agent": "lovable-security-scan" } },
    );
    if (res.ok) return await res.json();
  }
  throw new Error("No package.json source: configure GITHUB_REPO_OWNER/NAME/TOKEN secrets, or pass `manifest` in body.");
}

async function queryOsv(packages: Array<{ name: string; version: string }>) {
  const queries = packages.map((p) => ({
    package: { name: p.name, ecosystem: "npm" },
    version: p.version,
  }));
  const out: Array<{ pkg: { name: string; version: string }; vulns: any[] }> = [];
  // OSV recommends ≤1000 per batch — we're well under that
  const res = await fetch("https://api.osv.dev/v1/querybatch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ queries }),
  });
  if (!res.ok) throw new Error(`OSV API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const results = data.results || [];
  for (let i = 0; i < packages.length; i++) {
    const vulnIds = (results[i]?.vulns || []) as Array<{ id: string }>;
    if (vulnIds.length === 0) continue;
    // Fetch details for each vuln id (parallel, capped)
    const detailed = await Promise.all(vulnIds.slice(0, 25).map(async (v) => {
      try {
        const r = await fetch(`https://api.osv.dev/v1/vulns/${v.id}`);
        if (!r.ok) return { id: v.id };
        return await r.json();
      } catch { return { id: v.id }; }
    }));
    out.push({ pkg: packages[i], vulns: detailed });
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const start = Date.now();

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    let triggeredBy: string | null = null;
    let triggerSource: "manual" | "cron" = "manual";
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    if (body?.source === "cron") {
      triggerSource = "cron";
    } else {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const token = authHeader.replace("Bearer ", "");
      const { data: u } = await supabase.auth.getUser(token);
      if (!u.user) return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const { data: role } = await supabase
        .from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      if (!role) return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      triggeredBy = u.user.id;
    }

    const pkgJson = await fetchPackageJson(body?.manifest as Record<string, unknown> | undefined);
    const deps: Record<string, string> = {
      ...((pkgJson as any).dependencies ?? {}),
      ...((pkgJson as any).devDependencies ?? {}),
    };
    const packages = Object.entries(deps).map(([name, ver]) => ({ name, version: cleanVersion(ver as string) }));

    const vulnPkgs = await queryOsv(packages);

    const findings: Vuln[] = [];
    for (const { pkg, vulns } of vulnPkgs) {
      for (const v of vulns) {
        const cvss = v.severity?.find?.((s: any) => s.type?.startsWith("CVSS"))?.score;
        const cvssNum = typeof cvss === "string" ? parseFloat(cvss.match(/[\d.]+/)?.[0] || "0") : (cvss ?? undefined);
        const sev = severityFromCvss(cvssNum);
        const fixed = v.affected?.[0]?.ranges?.[0]?.events?.find?.((e: any) => e.fixed)?.fixed;
        findings.push({
          package: pkg.name,
          installed: pkg.version,
          vuln_id: v.id,
          summary: v.summary || v.details?.slice(0, 200) || "No summary",
          severity: sev,
          cvss: cvssNum,
          fixed_in: fixed,
          references: (v.references || []).slice(0, 3).map((r: any) => r.url),
        });
      }
    }

    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const f of findings) counts[f.severity]++;

    const snapshot = {
      scan_type: "frontend_deps" as const,
      triggered_by: triggeredBy,
      trigger_source: triggerSource,
      total_findings: findings.length,
      critical_count: counts.critical,
      high_count: counts.high,
      medium_count: counts.medium,
      low_count: counts.low,
      findings,
      meta: {
        packages_scanned: packages.length,
        vulnerable_packages: vulnPkgs.length,
        source: GH_OWNER ? "github" : "inline",
      },
      duration_ms: Date.now() - start,
    };

    const { data: inserted, error: insErr } = await supabase
      .from("security_scan_snapshots").insert(snapshot).select("id").single();
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ ok: true, snapshot_id: inserted.id, ...snapshot }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[security-scan-frontend-deps] ERROR", msg);
    return new Response(JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
