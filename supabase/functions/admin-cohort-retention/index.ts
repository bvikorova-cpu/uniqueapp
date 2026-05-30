import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (s: string, d?: unknown) =>
  console.log(`[COHORT-RETENTION] ${s}${d ? " " + JSON.stringify(d) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Early auth pre-check (returns 401 instead of crashing inside try → 500)
  const _earlyAuth = req.headers.get("Authorization");
  if (!_earlyAuth || !_earlyAuth.toLowerCase().startsWith("bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) throw new Error("Auth failed");
    const user = userData.user;

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Cohort window: last 12 months (inclusive of current)
    const COHORT_MONTHS = 12;
    const now = new Date();
    const windowStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (COHORT_MONTHS - 1), 1));

    log("Pulling subscriptions since", { since: windowStart.toISOString() });

    // Page through all subs created in window. Stripe filter: created.gte
    const subs: Stripe.Subscription[] = [];
    let starting_after: string | undefined;
    let pages = 0;
    while (pages < 30) {
      const page = await stripe.subscriptions.list({
        status: "all",
        limit: 100,
        starting_after,
        created: { gte: Math.floor(windowStart.getTime() / 1000) },
      });
      subs.push(...page.data);
      if (!page.has_more) break;
      starting_after = page.data[page.data.length - 1].id;
      pages++;
    }
    log("Loaded subs", { count: subs.length });

    // Build cohorts: month index 0..N-1 (0 = oldest)
    const cohortKey = (d: Date) =>
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const monthDiff = (a: Date, b: Date) =>
      (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());

    type Cohort = {
      month: string;
      size: number;
      retained: number[]; // index = months since signup
    };
    const cohorts = new Map<string, Cohort>();
    for (let i = 0; i < COHORT_MONTHS; i++) {
      const d = new Date(Date.UTC(windowStart.getUTCFullYear(), windowStart.getUTCMonth() + i, 1));
      cohorts.set(cohortKey(d), { month: cohortKey(d), size: 0, retained: Array(COHORT_MONTHS).fill(0) });
    }

    const monthsElapsedSinceWindowStart = monthDiff(windowStart, now);

    for (const s of subs) {
      const created = new Date(s.created * 1000);
      const key = cohortKey(created);
      const c = cohorts.get(key);
      if (!c) continue;
      c.size += 1;

      // Determine effective end: cancel timestamp or now
      const endedAt = s.canceled_at ? new Date(s.canceled_at * 1000) : now;
      const livedMonths = Math.min(monthDiff(created, endedAt), monthsElapsedSinceWindowStart);

      // Mark retention for each month 0..livedMonths (inclusive) where the cohort age has elapsed
      const cohortAge = monthDiff(
        new Date(Date.UTC(created.getUTCFullYear(), created.getUTCMonth(), 1)),
        new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
      );
      const maxIdx = Math.min(livedMonths, cohortAge, COHORT_MONTHS - 1);
      for (let i = 0; i <= maxIdx; i++) {
        c.retained[i] += 1;
      }
    }

    const result = Array.from(cohorts.values()).map((c) => {
      // Compute the cohort's age — only first (age+1) cells are valid
      const [y, m] = c.month.split("-").map(Number);
      const cohortDate = new Date(Date.UTC(y, m - 1, 1));
      const age = monthDiff(cohortDate, new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
      const cells = c.retained.slice(0, age + 1).map((r) => ({
        count: r,
        pct: c.size > 0 ? Math.round((r / c.size) * 1000) / 10 : 0,
      }));
      return { month: c.month, size: c.size, cells };
    });

    // Audit log (best-effort)
    try {
      await supabase.from("admin_audit_log").insert({
        admin_id: user.id,
        action: "cohort_retention_viewed",
        details: { subs_scanned: subs.length, cohorts: COHORT_MONTHS },
      });
    } catch (_e) { /* ignore */ }

    return new Response(
      JSON.stringify({
        cohorts: result,
        cohort_months: COHORT_MONTHS,
        generated_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
