// Admin action: approve / reject a doctor's license verification.
// Body: { doctor_id: uuid, action: 'approve' | 'reject', reason?: string }
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("Authentication required");
    const anon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: userData, error: uerr } = await anon.auth.getUser(auth.replace("Bearer ", ""));
    if (uerr || !userData.user) throw new Error("Not authenticated");
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Admin only");

    const { doctor_id, action, reason } = await req.json();
    if (!doctor_id || !["approve", "reject"].includes(action)) {
      throw new Error("doctor_id and valid action required");
    }
    const patch: Record<string, unknown> = {
      verification_status: action === "approve" ? "approved" : "rejected",
      verified_at: action === "approve" ? new Date().toISOString() : null,
      verified_by: userData.user.id,
      rejection_reason: action === "reject" ? (reason || "Not specified") : null,
    };
    if (action === "reject") patch.is_accepting_bookings = false;

    const { error } = await admin
      .from("healthcare_profiles")
      .update(patch)
      .eq("user_id", doctor_id);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
