// E2E helper: idempotently create + confirm a test user using the service role.
// Used by Playwright specs to provision a second account for multi-user flows.
// Locked down to a fixed email domain/prefix so it cannot be abused.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ALLOWED_EMAIL_RE = /^e2e-[a-z0-9._-]+@uniqueapp\.fun$/i;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { email, password } = await req.json();
    if (!email || !password || !ALLOWED_EMAIL_RE.test(email)) {
      return new Response(
        JSON.stringify({ error: "invalid_email", message: "Email must match e2e-*@uniqueapp.fun" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    // Try create first — if user exists, fall back to update.
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { e2e: true, full_name: "E2E Friend B" },
    });

    if (!created.error && created.data.user) {
      return json({ user_id: created.data.user.id, created: true });
    }

    // User probably already exists – look it up and ensure password + confirmation.
    const list = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (list.error) throw list.error;
    const existing = list.data.users.find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase());
    if (!existing) {
      return new Response(
        JSON.stringify({ error: "create_failed", message: created.error?.message ?? "unknown" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    return json({ user_id: existing.id, created: false });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "exception", message: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

function json(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
