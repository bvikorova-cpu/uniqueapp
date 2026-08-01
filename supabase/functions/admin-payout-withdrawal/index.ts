import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const KIND_MAP = {
  instructor: {
    table: "instructor_withdrawal_requests",
    statusColumn: "status",
    userIdColumn: "instructor_id",
    transferIdColumn: "stripe_transfer_id",
    currency: "EUR",
    amountColumn: "amount",
  },
  musician: {
    table: "musician_withdrawal_requests",
    statusColumn: "status",
    userIdColumn: "user_id",
    transferIdColumn: "stripe_transfer_id",
    currency: "EUR",
    amountColumn: "amount",
  },
  masterchef: {
    table: "masterchef_withdrawal_requests",
    statusColumn: "status",
    userIdColumn: "user_id",
    transferIdColumn: "stripe_transfer_id",
    currency: "EUR",
    amountColumn: "amount",
  },
  influencer: {
    table: "influencer_withdrawal_requests",
    statusColumn: "status",
    userIdColumn: "user_id",
    transferIdColumn: "stripe_transfer_id",
    currency: "EUR",
    amountColumn: "amount",
  },
  auction: {
    table: "auction_withdrawal_requests",
    statusColumn: "status",
    userIdColumn: "user_id",
    transferIdColumn: "stripe_transfer_id",
    currency: "EUR",
    amountColumn: "amount",
  },
  referral: {
    table: "referral_withdrawal_requests",
    statusColumn: "status",
    userIdColumn: "user_id",
    transferIdColumn: "stripe_transfer_id",
    currency: "EUR",
    amountColumn: "amount",
  },
  campaign: {
    table: "withdrawal_requests",
    statusColumn: "status",
    userIdColumn: "user_id",
    transferIdColumn: "stripe_transfer_id",
    currency: "EUR",
    amountColumn: "amount",
  },
  stock: {
    table: "stock_withdrawal_requests",
    statusColumn: "status",
    userIdColumn: "creator_id",
    transferIdColumn: "stripe_transfer_id",
    currency: "EUR",
    amountColumn: "amount",
  },
} as const;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) throw new Error("Admin authentication failed");

    const adminId = userData.user.id;
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: adminId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Admin role required");

    const body = await req.json();
    const { kind, withdrawalId, action, adminNotes } = body as {
      kind: keyof typeof KIND_MAP;
      withdrawalId: string;
      action: "approve" | "reject";
      adminNotes?: string;
    };

    if (!KIND_MAP[kind]) throw new Error(`Unknown payout kind: ${kind}`);
    if (!withdrawalId) throw new Error("Missing withdrawalId");
    if (!action || !["approve", "reject"].includes(action)) throw new Error("Invalid action");

    const meta = KIND_MAP[kind];

    const { data: request, error: requestError } = await supabaseAdmin
      .from(meta.table)
      .select(`id, ${meta.userIdColumn}, ${meta.amountColumn}, ${meta.statusColumn}, ${meta.transferIdColumn}`)
      .eq("id", withdrawalId)
      .maybeSingle();
    if (requestError || !request) throw new Error("Withdrawal request not found");

    if (request[meta.statusColumn] !== "pending") {
      throw new Error(`Request is already ${request[meta.statusColumn]}`);
    }

    const userId = request[meta.userIdColumn] as string;
    const amount = Number(request[meta.amountColumn]);

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_connect_account_id")
      .eq("id", userId)
      .maybeSingle();

    const connectId = profile?.stripe_connect_account_id;

    if (action === "reject") {
      const { error: updateError } = await supabaseAdmin
        .from(meta.table)
        .update({
          [meta.statusColumn]: "rejected",
          admin_notes: adminNotes ?? null,
          processed_by: adminId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", withdrawalId);
      if (updateError) throw updateError;

      return new Response(JSON.stringify({ success: true, status: "rejected" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (!connectId) throw new Error("Creator has no connected Stripe account");

    // For wallet-backed payouts (stock content) debit the EUR wallet BEFORE money moves,
    // so the same balance can never be withdrawn twice.
    const walletBacked = kind === "stock";
    let walletDebited = false;
    if (walletBacked) {
      const { data: wallet } = await supabaseAdmin
        .from("wallet_balances")
        .select("id, balance")
        .eq("user_id", userId)
        .eq("currency", "EUR")
        .maybeSingle();
      const available = Number(wallet?.balance ?? 0);
      if (!wallet || available < amount) {
        throw new Error(`Insufficient wallet balance (available €${available.toFixed(2)}, requested €${amount.toFixed(2)})`);
      }
      const { error: debitError } = await supabaseAdmin
        .from("wallet_balances")
        .update({ balance: available - amount, updated_at: new Date().toISOString() })
        .eq("id", wallet.id)
        .eq("balance", wallet.balance);
      if (debitError) throw new Error(`Could not reserve wallet balance: ${debitError.message}`);
      walletDebited = true;
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let transfer;
    try {
      transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: meta.currency.toLowerCase(),
        destination: connectId,
        description: `Payout ${withdrawalId}`,
        metadata: {
          withdrawal_id: withdrawalId,
          kind,
          admin_id: adminId,
          source: "admin_payout",
        },
      });
    } catch (transferError) {
      // Refund the reserved wallet amount if Stripe rejected the transfer
      if (walletDebited) {
        const { data: w } = await supabaseAdmin
          .from("wallet_balances")
          .select("id, balance")
          .eq("user_id", userId)
          .eq("currency", "EUR")
          .maybeSingle();
        if (w) {
          await supabaseAdmin
            .from("wallet_balances")
            .update({ balance: Number(w.balance ?? 0) + amount, updated_at: new Date().toISOString() })
            .eq("id", w.id);
        }
      }
      throw transferError;
    }

    const updatePayload: Record<string, unknown> = {
      [meta.statusColumn]: "completed",
      [meta.transferIdColumn]: transfer.id,
      processed_by: adminId,
      processed_at: new Date().toISOString(),
      admin_notes: adminNotes ?? null,
      updated_at: new Date().toISOString(),
    };
    if (walletBacked) updatePayload.wallet_deducted = true;

    const { error: updateError } = await supabaseAdmin
      .from(meta.table)
      .update(updatePayload)
      .eq("id", withdrawalId);
    if (updateError) throw updateError;

    // Tell the creator the money is on its way
    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      type: "payout_completed",
      title: "Payout sent 💸",
      message: `€${amount.toFixed(2)} was transferred to your Stripe account.`,
      action_url: "/stock-content-library?view=earnings",
      metadata: { withdrawal_id: withdrawalId, kind, transfer_id: transfer.id },
    });


    return new Response(JSON.stringify({ success: true, transfer_id: transfer.id, status: "completed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
