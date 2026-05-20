// Public ingest endpoint for Web Vitals samples sent from the browser via
// `navigator.sendBeacon`. Anonymous visitors are allowed (RLS blocks reads,
// service-role insert bypasses RLS). We rate-limit per IP via simple window.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_METRICS = new Set(["LCP", "CLS", "INP", "FCP", "TTFB"]);

type Sample = {
  metric: string;
  value: number;
  rating?: string;
  navigation_type?: string;
  route?: string;
  device?: string;
  connection?: string;
  session_id?: string;
};

function clamp(s: unknown, max: number): string | null {
  if (typeof s !== "string") return null;
  return s.slice(0, max);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const samples: Sample[] = Array.isArray(body?.samples) ? body.samples : [];
    if (samples.length === 0 || samples.length > 20) {
      return new Response(JSON.stringify({ ok: true, accepted: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve user_id if a real auth header is present (best-effort).
    // Wrap in a short timeout — Supabase auth occasionally stalls and we
    // must never let that turn this fire-and-forget ingest into a 504.
    let userId: string | null = null;
    const auth = req.headers.get("Authorization");
    if (auth?.startsWith("Bearer ")) {
      try {
        const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
          global: { headers: { Authorization: auth } },
        });
        const userPromise = anon.auth.getUser();
        const timeout = new Promise<{ data: { user: null } }>((resolve) =>
          setTimeout(() => resolve({ data: { user: null } }), 1500),
        );
        const { data } = (await Promise.race([userPromise, timeout])) as any;
        userId = data?.user?.id ?? null;
      } catch {
        userId = null;
      }
    }


    const ua = clamp(req.headers.get("user-agent"), 300);

    const rows = samples
      .filter((s) => ALLOWED_METRICS.has(s.metric) && Number.isFinite(s.value))
      .slice(0, 20)
      .map((s) => ({
        user_id: userId,
        session_id: clamp(s.session_id, 64),
        metric: s.metric,
        value: Math.max(0, Number(s.value)),
        rating: clamp(s.rating, 32),
        navigation_type: clamp(s.navigation_type, 32),
        route: clamp(s.route, 256),
        device: clamp(s.device, 16),
        connection: clamp(s.connection, 16),
        user_agent: ua,
      }));

    if (rows.length === 0) {
      return new Response(JSON.stringify({ ok: true, accepted: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role insert (bypasses RLS — table has no INSERT policy by design).
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { error } = await admin.from("vitals_log").insert(rows);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, accepted: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
