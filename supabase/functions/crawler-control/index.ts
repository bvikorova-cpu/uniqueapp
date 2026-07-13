import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// deno-lint-ignore no-explicit-any
type Json = any;

const WORKFLOW_FILE = "crawler.yml";

async function gh(path: string, init: RequestInit = {}) {
  const token = Deno.env.get("GITHUB_TOKEN");
  const owner = Deno.env.get("GITHUB_OWNER");
  const repo = Deno.env.get("GITHUB_REPO");
  if (!token || !owner || !repo) {
    throw new Error("Missing GITHUB_TOKEN / GITHUB_OWNER / GITHUB_REPO secrets");
  }
  const url = `https://api.github.com/repos/${owner}/${repo}${path}`;
  const res = await fetch(url, {
    ...init,
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
}

async function requireAdmin(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: auth } } },
  );
  const { data: userRes } = await supabase.auth.getUser();
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
  return { user, admin };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const headers = { ...corsHeaders, "Content-Type": "application/json" };

  try {
    // probe support for edge-tester
    let body: Json = {};
    try { body = await req.json(); } catch { /* noop */ }
    if (body?.__probe) {
      return new Response(JSON.stringify({ ok: true, probe: true }), { headers });
    }

    await requireAdmin(req);
    const action = body?.action || "list";

    if (action === "dispatch") {
      const routeLimit = String(body?.route_limit ?? "0");
      await gh(`/actions/workflows/${WORKFLOW_FILE}/dispatches`, {
        method: "POST",
        body: JSON.stringify({ ref: body?.ref || "main", inputs: { route_limit: routeLimit } }),
      });
      return new Response(JSON.stringify({ ok: true, dispatched: true }), { headers });
    }

    if (action === "list") {
      const runs = await gh(`/actions/workflows/${WORKFLOW_FILE}/runs?per_page=15`);
      return new Response(JSON.stringify({ ok: true, runs: runs?.workflow_runs ?? [] }), { headers });
    }

    if (action === "artifacts") {
      const runId = body?.run_id;
      if (!runId) throw new Error("run_id required");
      const arts = await gh(`/actions/runs/${runId}/artifacts`);
      return new Response(JSON.stringify({ ok: true, artifacts: arts?.artifacts ?? [] }), { headers });
    }

    if (action === "download") {
      // Returns a short-lived download URL for artifact zip
      const artifactId = body?.artifact_id;
      if (!artifactId) throw new Error("artifact_id required");
      const token = Deno.env.get("GITHUB_TOKEN")!;
      const owner = Deno.env.get("GITHUB_OWNER")!;
      const repo = Deno.env.get("GITHUB_REPO")!;
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/actions/artifacts/${artifactId}/zip`,
        { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }, redirect: "manual" },
      );
      const location = res.headers.get("location");
      if (!location) throw new Error(`No download URL (status ${res.status})`);
      return new Response(JSON.stringify({ ok: true, url: location }), { headers });
    }

    return new Response(JSON.stringify({ ok: false, error: "unknown action" }), { status: 400, headers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = /Unauthorized|Forbidden/.test(msg) ? 401 : 500;
    return new Response(JSON.stringify({ ok: false, error: msg }), { status, headers });
  }
});
