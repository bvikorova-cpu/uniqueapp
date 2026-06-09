// Admin approves or rejects a pending campaign payout.
// On approval: executes the actual Stripe transfer to the connected account.
// On rejection: marks the row rejected with a reason; no Stripe call.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "STRIPE_SECRET_KEY missing" }, 500);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Authorization required" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: u, error: uErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (uErr || !u.user) return json({ error: "Authentication failed" }, 401);
    const adminUser = u.user;

    // Verify admin role
    const { data: isAdmin, error: roleErr } = await supabase.rpc("has_role", {
      _user_id: adminUser.id,
      _role: "admin",
    });
    if (roleErr || !isAdmin) {
      return json({ error: "Admin access required" }, 403);
    }

    let body: { payout_id?: string; action?: string; rejection_reason?: string } = {};
    try { body = await req.json(); } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const payout_id = String(body.payout_id || "");
    const action = String(body.action || "").toLowerCase();
    const rejection_reason = (body.rejection_reason || "").trim();

    if (!/^[0-9a-f-]{36}$/i.test(payout_id)) return json({ error: "Invalid payout_id" }, 400);
    if (!["approve", "reject"].includes(action)) {
      return json({ error: "action must be 'approve' or 'reject'" }, 400);
    }
    if (action === "reject" && rejection_reason.length < 5) {
      return json({ error: "rejection_reason required (min 5 chars)" }, 400);
    }

    // Load payout row
    const { data: payout, error: loadErr } = await supabase
      .from("campaign_payouts")
      .select("*")
      .eq("id", payout_id)
      .maybeSingle();
    if (loadErr || !payout) return json({ error: "Payout not found" }, 404);

    if (payout.status !== "pending_review") {
      return json({
        error: `Payout is not awaiting review (current status: ${payout.status})`,
      }, 409);
    }

    if (action === "reject") {
      // Atomic claim: only succeeds if row is still pending_review.
      const { data: rejClaim, error: rejClaimErr } = await supabase
        .from("campaign_payouts")
        .update({
          status: "rejected",
          rejection_reason,
          reviewed_by: adminUser.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", payout_id)
        .eq("status", "pending_review")
        .select("id")
        .maybeSingle();
      if (rejClaimErr || !rejClaim) {
        return json({ error: "Payout was already processed by another admin", code: "ALREADY_PROCESSED" }, 409);
      }

      await supabase.from("notifications").insert({
        user_id: payout.owner_user_id,
        type: "campaign_payout_rejected",
        title: "Payout request rejected",
        message: `Your payout request of €${(Number(payout.amount_cents) / 100).toFixed(2)} was rejected. Reason: ${rejection_reason}`,
        related_id: payout_id,
      });

      return json({ success: true, status: "rejected", payout_id });
    }

    // ===== APPROVE → atomically claim row to 'processing' BEFORE Stripe call =====
    const { data: appClaim, error: appClaimErr } = await supabase
      .from("campaign_payouts")
      .update({
        status: "processing",
        reviewed_by: adminUser.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", payout_id)
      .eq("status", "pending_review")
      .select("id")
      .maybeSingle();
    if (appClaimErr || !appClaim) {
      return json({ error: "Payout was already processed by another admin", code: "ALREADY_PROCESSED" }, 409);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    try {
      const transfer = await stripe.transfers.create({
        amount: Number(payout.amount_cents),
        currency: payout.currency || "eur",
        destination: payout.stripe_destination_account,
        description: `Campaign payout (admin-approved) — ${payout.campaign_type}/${payout.campaign_id}`,
        metadata: {
          campaign_type: payout.campaign_type,
          campaign_id: payout.campaign_id,
          payout_row_id: payout.id,
          owner_user_id: payout.owner_user_id,
          approved_by: adminUser.id,
        },
      });

      await supabase
        .from("campaign_payouts")
        .update({
          status: "completed",
          stripe_transfer_id: transfer.id,
          reviewed_by: adminUser.id,
          reviewed_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        })
        .eq("id", payout_id);

      await supabase.from("notifications").insert({
        user_id: payout.owner_user_id,
        type: "campaign_payout_completed",
        title: "Payout approved and sent",
        message: `Your payout request of €${(Number(payout.amount_cents) / 100).toFixed(2)} was approved. The funds have been transferred to your Stripe account.`,
        related_id: payout_id,
      });

      return json({
        success: true,
        status: "completed",
        transfer_id: transfer.id,
        payout_id,
      });
    } catch (stripeErr) {
      const msg = stripeErr instanceof Error ? stripeErr.message : String(stripeErr);
      console.error("[stripe.transfers.create]", msg);
      await supabase
        .from("campaign_payouts")
        .update({
          status: "failed",
          failure_reason: msg,
          reviewed_by: adminUser.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", payout_id);
      return json({ error: msg, code: "STRIPE_TRANSFER_FAILED" }, 502);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[admin-approve-campaign-payout]", msg);
    return json({ error: msg }, 500);
  }
});
