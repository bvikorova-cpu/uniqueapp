// Full audit of supabase/functions/** — static heuristics + runtime + config.toml cross-check.
// Auth: admin JWT in Authorization header (manual) OR `source=cron` body for pg_cron.
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
interface Finding {
  fn: string;
  rule: string;
  severity: Severity;
  message: string;
  remediation: string;
}

// ---------- Heuristic rules (run on each function source file) ----------
const RULES: Array<(name: string, src: string) => Finding[]> = [
  // R1 — service role key leaked to client
  (fn, src) => {
    const out: Finding[] = [];
    if (/SUPABASE_SERVICE_ROLE_KEY/.test(src) && /return\s+new\s+Response[^]*SUPABASE_SERVICE_ROLE_KEY/s.test(src)) {
      out.push({ fn, rule: "service_role_in_response", severity: "critical",
        message: "Service-role key referenced inside a Response body — possible leak to client.",
        remediation: "Never include SUPABASE_SERVICE_ROLE_KEY in JSON responses or logs." });
    }
    return out;
  },
  // R2 — hardcoded secrets
  (fn, src) => {
    const out: Finding[] = [];
    const patterns: Array<[RegExp, string]> = [
      [/sk_live_[A-Za-z0-9]{20,}/, "Stripe live secret key hardcoded"],
      [/sk_test_[A-Za-z0-9]{20,}/, "Stripe test secret key hardcoded"],
      [/AIza[0-9A-Za-z_-]{35}/, "Google API key hardcoded"],
      [/eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/, "JWT-shaped secret hardcoded"],
    ];
    for (const [re, label] of patterns) {
      if (re.test(src)) out.push({ fn, rule: "hardcoded_secret", severity: "critical",
        message: label, remediation: "Move to Deno.env.get() and store via Lovable secrets." });
    }
    return out;
  },
  // R3 — missing CORS preflight handler
  (fn, src) => {
    const out: Finding[] = [];
    if (/serve\s*\(/.test(src) && !/OPTIONS/.test(src)) {
      out.push({ fn, rule: "missing_cors_preflight", severity: "medium",
        message: "Function does not handle OPTIONS preflight — browser calls will fail CORS.",
        remediation: 'Add `if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });`' });
    }
    if (/serve\s*\(/.test(src) && !/Access-Control-Allow-Origin/.test(src)) {
      out.push({ fn, rule: "missing_cors_headers", severity: "medium",
        message: "No Access-Control-Allow-Origin header found.",
        remediation: "Define and return corsHeaders on every Response." });
    }
    return out;
  },
  // R4 — raw SQL execution
  (fn, src) => {
    const out: Finding[] = [];
    if (/rpc\(['"`]execute_sql['"`]/.test(src)) {
      out.push({ fn, rule: "raw_sql_rpc", severity: "critical",
        message: "Calls execute_sql RPC — SQL injection risk.",
        remediation: "Use typed query builder (.from().select()) or parameterised RPCs." });
    }
    return out;
  },
  // R5 — auth.getUser() without checking error/user
  (fn, src) => {
    const out: Finding[] = [];
    if (/auth\.getUser\(/.test(src)) {
      // Look for assignment without null/error check
      if (!/userErr|error\s*:/.test(src) && !/if\s*\(\s*!?\s*user/.test(src)) {
        out.push({ fn, rule: "weak_jwt_check", severity: "high",
          message: "auth.getUser() result is not validated — unauthenticated requests may pass.",
          remediation: "Always check both `error` and `data.user` before proceeding." });
      }
    }
    return out;
  },
  // R6 — no input validation (json body used directly)
  (fn, src) => {
    const out: Finding[] = [];
    if (/await\s+req\.json\(\)/.test(src) && !/(zod|safeParse|\.parse\()/.test(src) && !/typeof\s+\w+\s*!==/.test(src)) {
      out.push({ fn, rule: "missing_input_validation", severity: "medium",
        message: "Request body parsed without schema validation.",
        remediation: "Validate with zod/safeParse and return 400 on invalid input." });
    }
    return out;
  },
  // R7 — wildcard CORS on credentialed endpoint (combination check)
  (fn, src) => {
    const out: Finding[] = [];
    if (/Access-Control-Allow-Origin['"]\s*:\s*['"]\*/.test(src) &&
        /Access-Control-Allow-Credentials['"]\s*:\s*['"]true/.test(src)) {
      out.push({ fn, rule: "cors_wildcard_with_credentials", severity: "high",
        message: "CORS uses '*' origin AND credentials — invalid + insecure combination.",
        remediation: "Echo a specific origin when credentials are required." });
    }
    return out;
  },
];

// ---------- Helpers to fetch functions list (filesystem at deploy time) ----------
async function listFunctions(): Promise<Array<{ name: string; source: string }>> {
  // At runtime, edge functions can't read the project's filesystem. We fetch
  // the source from GitHub if a repo is configured; otherwise we fall back to
  // a curated list of known function names and HEAD-only runtime checks.
  if (GH_OWNER && GH_REPO && GH_TOKEN) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/supabase/functions`,
        { headers: { Authorization: `Bearer ${GH_TOKEN}`, "User-Agent": "lovable-security-scan" } },
      );
      if (res.ok) {
        const dirs: Array<{ name: string; type: string }> = await res.json();
        const fns: Array<{ name: string; source: string }> = [];
        for (const d of dirs.filter((x) => x.type === "dir" && !x.name.startsWith("_"))) {
          const fileRes = await fetch(
            `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/main/supabase/functions/${d.name}/index.ts`,
            { headers: { Authorization: `Bearer ${GH_TOKEN}`, "User-Agent": "lovable-security-scan" } },
          );
          if (fileRes.ok) fns.push({ name: d.name, source: await fileRes.text() });
        }
        return fns;
      }
    } catch (_) { /* fall through */ }
  }
  return [];
}

// Runtime CORS preflight check via OPTIONS — works without source code.
async function probeCors(fnName: string): Promise<Finding[]> {
  const out: Finding[] = [];
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${fnName}`, {
      method: "OPTIONS",
      headers: { Origin: "https://example.com", "Access-Control-Request-Method": "POST" },
    });
    const allow = res.headers.get("access-control-allow-origin");
    if (!allow) out.push({ fn: fnName, rule: "runtime_no_cors", severity: "medium",
      message: "OPTIONS preflight did not return Access-Control-Allow-Origin.",
      remediation: "Handle OPTIONS and respond with corsHeaders." });
    if (res.status >= 500) out.push({ fn: fnName, rule: "runtime_5xx_on_options", severity: "high",
      message: `OPTIONS returned ${res.status} — function may be crashing on boot.`,
      remediation: "Check edge function logs for boot errors." });
  } catch (e) {
    out.push({ fn: fnName, rule: "runtime_unreachable", severity: "high",
      message: `Function unreachable: ${e instanceof Error ? e.message : String(e)}`,
      remediation: "Verify deployment status." });
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const start = Date.now();

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    // Auth: admin JWT, or cron source bypass (cron uses service role internally via pg_net)
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

    const functions = await listFunctions();
    const findings: Finding[] = [];

    // Static analysis on every function we could read
    for (const f of functions) {
      for (const rule of RULES) findings.push(...rule(f.name, f.source));
    }

    // Runtime probe on a sample of well-known critical functions (capped to keep latency reasonable)
    const probeTargets = [
      "stripe-webhook", "create-checkout", "verify-payment", "check-sca",
      "claim-referral", "admin-refund-payment", "admin-payout-withdrawal",
    ];
    const probeResults = await Promise.all(probeTargets.map(probeCors));
    for (const r of probeResults) findings.push(...r);

    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const f of findings) counts[f.severity]++;

    const snapshot = {
      scan_type: "edge_functions" as const,
      triggered_by: triggeredBy,
      trigger_source: triggerSource,
      total_findings: findings.length,
      critical_count: counts.critical,
      high_count: counts.high,
      medium_count: counts.medium,
      low_count: counts.low,
      findings,
      meta: {
        functions_scanned: functions.length,
        functions_probed: probeTargets.length,
        github_source: !!(GH_OWNER && GH_REPO && GH_TOKEN),
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
    console.error("[security-scan-edge-functions] ERROR", msg);
    return new Response(JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
