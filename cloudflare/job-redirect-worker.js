// Cloudflare Worker: HTTP 301 redirect from UUID job URLs to canonical slug URLs.
//
// PURPOSE
// Lovable's hosting layer serves SPA index.html for every route, which means
// Googlebot sees JS-driven navigation rather than a real 301. To make canonical
// indexation bullet-proof, deploy this Worker in front of www.uniqueapp.fun.
//
// DEPLOY STEPS
// 1. Cloudflare Dashboard → Workers & Pages → Create → Worker → paste this file.
// 2. Triggers → Add Custom Domain → www.uniqueapp.fun (or use a Route:
//    `www.uniqueapp.fun/jobs/listing/*`).
// 3. Verify:  curl -I https://www.uniqueapp.fun/jobs/listing/<uuid>
//    Expect:  HTTP/2 301  +  location: https://www.uniqueapp.fun/jobs/listing/<slug>
//
// HOW IT WORKS
// - Matches /jobs/listing/<uuid> URLs only.
// - Calls the Supabase `job-redirect` edge function, which queries job_listings.slug
//   for that id and returns a 301/308 with the canonical Location header.
// - For everything else, the Worker passes the request through to the origin
//   (Lovable hosting) unchanged.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SUPABASE_FN = "https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/job-redirect";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const m = url.pathname.match(/^\/jobs\/listing\/([^/?#]+)\/?$/);

    if (m && UUID_RE.test(m[1])) {
      const r = await fetch(`${SUPABASE_FN}?id=${m[1]}`, {
        method: "GET",
        redirect: "manual",
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      });
      // Forward 301/308 with Location. Strip CORS headers (not needed for same-origin).
      if (r.status === 301 || r.status === 308) {
        const loc = r.headers.get("location");
        if (loc) {
          return new Response(null, {
            status: 301,
            headers: {
              Location: loc,
              "Cache-Control": "public, max-age=86400",
              "X-Redirect-Source": "cf-worker-job-redirect",
            },
          });
        }
      }
      // 404 / 400 from edge function — fall through to SPA so user gets the
      // app's NotFound page rather than a bare Cloudflare error.
    }

    return fetch(request);
  },
};
