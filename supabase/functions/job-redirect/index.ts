// Server-side 301 redirect: UUID → canonical slug URL.
//
// Endpoint: GET /functions/v1/job-redirect?id=<uuid>
// Response: 301 Location: https://www.uniqueapp.fun/jobs/listing/<slug>
//
// Wiring options for a *real* server-side 301 (not JS):
//   1) Cloudflare / reverse proxy rule:
//      Rewrite GET /jobs/listing/<uuid>  →  this function with ?id=<uuid>.
//   2) Use this URL directly in legacy emails / external links.
//
// Without a hosting-layer rewrite Lovable serves index.html for SPA routes,
// so client-side `navigate(..., {replace:true})` (already in JobDetailPage)
// remains the in-app fallback. Googlebot honors the canonical link emitted
// there as equivalent to a 301 for indexation.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SITE = "https://www.uniqueapp.fun";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const url = new URL(req.url);
  // Accept ?id=<uuid> OR last path segment.
  let id = url.searchParams.get("id") || "";
  if (!id) {
    const parts = url.pathname.split("/").filter(Boolean);
    id = parts[parts.length - 1] || "";
  }
  if (!UUID_RE.test(id)) {
    return new Response("Invalid id", { status: 400, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase
    .from("job_listings")
    .select("slug, is_active, paid_status, expires_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return new Response("Not found", { status: 404, headers: corsHeaders });
  }

  const active =
    data.is_active &&
    (data.paid_status ?? "active") === "active" &&
    (!data.expires_at || new Date(data.expires_at) > new Date());

  // Even expired jobs should canonicalize so search engines collapse old URLs.
  const target = `${SITE}/jobs/listing/${data.slug || id}`;
  return new Response(null, {
    status: active ? 301 : 308,
    headers: {
      ...corsHeaders,
      Location: target,
      "Cache-Control": "public, max-age=86400",
    },
  });
});
