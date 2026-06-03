import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
};

/**
 * E2E helper: create / delete a temporary job_listing for Playwright tests.
 *
 * Auth: requires header `x-e2e-secret` matching the E2E_SEED_SECRET env var.
 * Method:
 *   POST   -> creates a job, returns { id, slug }
 *   DELETE -> body { id } removes it.
 *
 * Uses service_role internally to bypass employer/verified RLS.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const expected = Deno.env.get("E2E_SEED_SECRET");
  const provided = req.headers.get("x-e2e-secret");
  if (!expected || provided !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const employerId =
        body.employer_id ?? "00000000-0000-0000-0000-000000000000";
      const ts = Date.now();
      const slug = `e2e-test-job-${ts}`;
      const payload = {
        employer_id: employerId,
        title: `E2E Test Job ${ts}`,
        description:
          "Temporary E2E test job created by e2e-seed-job. Safe to delete.",
        company_name: "E2E Test Co.",
        location: "Remote",
        country: "SK",
        category: "engineering",
        job_type: "full_time",
        salary_min: 1000,
        salary_max: 2000,
        salary_currency: "EUR",
        contact_email: "e2e@example.com",
        is_active: true,
        is_remote: true,
        paid_status: "paid",
        published_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 86400_000).toISOString(),
        slug,
      };

      const { data, error } = await admin
        .from("job_listings")
        .insert(payload)
        .select("id, slug")
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, ...data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE") {
      const body = await req.json().catch(() => ({}));
      if (!body.id) {
        return new Response(JSON.stringify({ error: "id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error } = await admin
        .from("job_listings")
        .delete()
        .eq("id", body.id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
