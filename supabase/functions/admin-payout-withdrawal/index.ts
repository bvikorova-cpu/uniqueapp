// Admin → Stripe Connect transfer for any creator withdrawal request.
// Body: { kind: 'instructor'|'musician'|'masterchef'|'influencer'|'auction'|'referral'|'campaign',
//         withdrawalId: string, action: 'approve'|'reject', adminNotes?: string }
// On 'approve' → creates a Stripe transfer to the creator's Connect account, marks row as completed.
// On 'reject'  → just updates DB.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (s: string, d?: unknown) =>
  console.log(`[ADMIN-PAYOUT-WITHDRAWAL] ${s}${d ? " - " + JSON.stringify(d) : ""}`);

type Kind = "instructor" | "musician" | "masterchef" | "influencer" | "auction" | "referral" | "campaign";

// Per-kind table + creator-id column mapping.
const KIND_MAP: Record<Kind, { table: string; creatorCol: string; transferCol: string }> = {
  instructor:  { table: "instructor_withdrawal_requests",  creatorCol: "instructor_id",  transferCol: "stripe_transfer_id" },
  musician:    { table: "musician_withdrawal_requests",    creatorCol: "musician_id",    transferCol: "stripe_transfer_id" },
  masterchef:  { table: "masterchef_withdrawal_requests",  creatorCol: "chef_id",        transferCol: "stripe_transfer_id" },
  influencer:  { table: "influencer_withdrawal_requests",  creatorCol: "influencer_id",  transferCol: "stripe_transfer_id" },
  auction:     { table: "auction_withdrawal_requests",     creatorCol: "seller_id",      transferCol: "stripe_payout_id"   },
  referral:    { table: "referral_withdrawal_requests",    creatorCol: "referrer_id",    transferCol: "stripe_transfer_id" },
  campaign:    { table: "withdrawal_requests",             creatorCol: "user_id",        transferCol: "stripe_transfer_id" },
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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const supaUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth — admin only
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");
    const userClient = createClient(supaUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: u, error: uErr } = await userClient.auth.getUser();
    if (uErr || !u.user) throw new Error("Not authenticated");
    const adminId = u.user.id;

    const admin = createClient(supaUrl, serviceKey, { auth: { persistSession: false } });
    const { data: isAdmin, error: roleErr } = await admin.rpc("has_role", {
      _user_id: adminId,
      _role: "admin",
    });
    if (roleErr) throw new Error(`Role check failed: ${roleErr.message}`);
    if (!isAdmin) throw new Error("Admin role required");

    const body = await req.json().catch(() => ({}));
    const kind = String(body.kind || "") as Kind;
    const withdrawalId = String(body.withdrawalId || "");
    const action = String(body.action || "");
    const adminNotes = body.adminNotes ? String(body.adminNotes) : null;

    if (!KIND_MAP[kind]) throw new Error(`Invalid kind: ${kind}`);
    if (!withdrawalId) throw new Error("withdrawalId required");
    if (!["approve", "reject"].includes(action)) throw new Error("action must be approve|reject");

    const { table, creatorCol, transferCol } = KIND_MAP[kind];
    log("processing", { kind, withdrawalId, action });

    // Load withdrawal row
    const { data: wd, error: wdErr } = await admin.from(table).select("*").eq("id", withdrawalId).maybeSingle();
    if (wdErr) throw new Error(`Load failed: ${wdErr.message}`);
    if (!wd) throw new Error("Withdrawal not found");
    if (wd.status === "completed" || wd.status === "rejected") {
      throw new Error(`Withdrawal already ${wd.status}`);
    }

    // Reject path
    if (action === "reject") {
      const { error: upErr } = await admin
        .from(table)
        .update({
          status: "rejected",
          admin_notes: adminNotes,
          processed_at: new Date().toISOString(),
        })
        .eq("id", withdrawalId);
      if (upErr) throw new Error(`Update failed: ${upErr.message}`);

      await admin.from("admin_audit_log").insert({
        admin_id: adminId,
        action: "withdrawal_rejected",
        target_id: withdrawalId,
        target_type: table,
        details: { kind, amount: wd.amount, notes: adminNotes },
      });

      return new Response(JSON.stringify({ success: true, status: "rejected" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Approve path → Stripe transfer
    const creatorId = wd[creatorCol];
    if (!creatorId) throw new Error(`Missing ${creatorCol}`);

    const { data: profile, error: pErr } = await admin
      .from("profiles")
      .select("stripe_connect_account_id, stripe_connect_payouts_enabled")
      .eq("id", creatorId)
      .maybeSingle();
    if (pErr) throw new Error(`Profile load failed: ${pErr.message}`);
    if (!profile?.stripe_connect_account_id) {
      throw new Error("Creator has no Stripe Connect account");
    }
    if (!profile.stripe_connect_payouts_enabled) {
      throw new Error("Creator's Stripe Connect payouts not enabled");
    }

    const amountCents = Math.round(Number(wd.amount) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      throw new Error(`Invalid amount: ${wd.amount}`);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    log("creating transfer", { amountCents, dest: profile.stripe_connect_account_id });

    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: "eur",
      destination: profile.stripe_connect_account_id,
      description: `${kind} withdrawal ${withdrawalId}`,
      metadata: { kind, withdrawal_id: withdrawalId, creator_id: creatorId },
    });

    log("transfer created", { id: transfer.id });

    const updateData: Record<string, unknown> = {
      status: "completed",
      admin_notes: adminNotes,
      processed_at: new Date().toISOString(),
      [transferCol]: transfer.id,
    };
    // Only some tables have processed_by
    if ("processed_by" in wd) updateData.processed_by = adminId;

    const { error: upErr } = await admin.from(table).update(updateData).eq("id", withdrawalId);
    if (upErr) {
      // Transfer succeeded but DB failed — surface clearly
      log("DB update failed after transfer", { transferId: transfer.id, err: upErr.message });
      throw new Error(`Transfer ${transfer.id} succeeded but DB update failed: ${upErr.message}`);
    }

    await admin.from("admin_audit_log").insert({
      admin_id: adminId,
      action: "withdrawal_paid",
      target_id: withdrawalId,
      target_type: table,
      details: { kind, amount: wd.amount, transfer_id: transfer.id, creator_id: creatorId },
    });

    return new Response(
      JSON.stringify({ success: true, status: "completed", transfer_id: transfer.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
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
