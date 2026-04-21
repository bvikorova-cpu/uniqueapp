// Edge function: delete-user-account
// Securely deletes a user's account + all owned data (GDPR Right to Erasure).
// Uses service role to call auth.admin.deleteUser, which cascades FK-deletes
// across the entire schema where ON DELETE CASCADE is configured.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 1. Validate caller's JWT and get their user id
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return json({ error: "Invalid or expired token" }, 401);
    }

    const userId = userData.user.id;

    // 2. Optional confirmation check (defense in depth)
    let body: { confirm?: string } = {};
    try {
      body = await req.json();
    } catch {
      // empty body is fine
    }
    if (body.confirm !== "DELETE") {
      return json(
        { error: "Confirmation required. Pass { confirm: 'DELETE' }." },
        400,
      );
    }

    // 3. Delete the auth user with service role.
    // Tables with ON DELETE CASCADE on user_id will be cleaned automatically.
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: deleteErr } = await adminClient.auth.admin.deleteUser(
      userId,
    );

    if (deleteErr) {
      console.error("Failed to delete auth user", { userId, error: deleteErr });
      return json(
        {
          error:
            "Failed to delete account. Please contact support so we can complete the deletion manually.",
        },
        500,
      );
    }

    return json({ success: true, deleted_user_id: userId });
  } catch (err) {
    console.error("Unexpected error in delete-user-account", err);
    return json({ error: "Unexpected server error" }, 500);
  }
});
