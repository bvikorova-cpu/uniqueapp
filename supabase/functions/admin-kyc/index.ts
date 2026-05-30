import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: uErr } = await supabase.auth.getUser(token);
    if (uErr) throw new Error(uErr.message);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { data: roles } = await supabase
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
    if (!roles || roles.length === 0) throw new Error("Admin only");

    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "list";

    if (action === "override" && req.method === "POST") {
      const body = await req.json();
      const { user_id, status, rejection_reason } = body;
      if (!user_id || !status) throw new Error("user_id and status required");
      if (!["verified", "rejected", "unverified"].includes(status)) {
        throw new Error("Invalid status");
      }

      const update: Record<string, unknown> = { status, rejection_reason: rejection_reason ?? null };
      if (status === "verified") update.verified_at = new Date().toISOString();
      if (status === "rejected") update.rejected_at = new Date().toISOString();

      const { error } = await supabase
        .from("creator_kyc_verifications")
        .update(update)
        .eq("user_id", user_id);
      if (error) throw new Error(error.message);

      await supabase.from("admin_audit_log").insert({
        admin_id: user.id,
        action: "kyc_override",
        details: { target_user_id: user_id, status, reason: rejection_reason },
      }).then(() => {}, () => {});

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: list
    const { data: rows, error } = await supabase
      .from("creator_kyc_verifications")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);

    const list = rows ?? [];
    const counts = {
      verified: list.filter((r) => r.status === "verified").length,
      pending: list.filter((r) => r.status === "pending").length,
      requires_input: list.filter((r) => r.status === "requires_input").length,
      rejected: list.filter((r) => r.status === "rejected").length,
      unverified: list.filter((r) => r.status === "unverified").length,
    };

    return new Response(
      JSON.stringify({ counts, rows: list }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
