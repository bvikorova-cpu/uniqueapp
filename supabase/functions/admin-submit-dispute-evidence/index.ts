// Admin-only: submits evidence to Stripe for a dispute (chargeback).
// Body: { disputeId: uuid, evidence: {...stripe evidence fields...}, submit?: boolean }

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe key missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supaUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const userClient = createClient(supaUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) throw new Error("Not authenticated");

    const admin = createClient(supaUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
      auth: { persistSession: false },
    });
    const { data: roleOk } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!roleOk) throw new Error("Not authorized");

    const body = await req.json();
    const { disputeId, evidence, submit = false } = body;
    if (!disputeId || !evidence) throw new Error("disputeId and evidence required");

    const { data: row, error: rowErr } = await admin
      .from("stripe_disputes")
      .select("stripe_dispute_id, status")
      .eq("id", disputeId)
      .maybeSingle();
    if (rowErr || !row) throw new Error("Dispute not found");
    if (["won", "lost", "warning_closed"].includes(row.status)) {
      throw new Error("Dispute already resolved");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const updated = await stripe.disputes.update(row.stripe_dispute_id, {
      evidence,
      submit,
    });

    await admin
      .from("stripe_disputes")
      .update({
        evidence: updated.evidence as any,
        evidence_submitted_at: submit ? new Date().toISOString() : null,
        status: updated.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", disputeId);

    await admin.from("admin_audit_log").insert({
      admin_id: userData.user.id,
      action: submit ? "dispute_evidence_submitted" : "dispute_evidence_staged",
      target_type: "stripe_disputes",
      target_id: disputeId,
      details: { dispute_id: row.stripe_dispute_id },
    });

    return new Response(JSON.stringify({ success: true, status: updated.status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
