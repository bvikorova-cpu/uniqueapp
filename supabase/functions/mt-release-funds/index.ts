// Megatalent — 80/20 payout: buyer/student marks order/booking as completed,
// 80% of paid amount is transferred to seller/mentor's Stripe Connect account,
// 20% stays on platform. Row status flips to 'completed' and stripe_transfer_id is set.
//
// Body: { kind: "mentorship"|"marketplace", id: string }
//
// Only the buyer (mentorship.student_id / marketplace.buyer_id) can release.
// Row must be status='paid' (set by stripe-webhook).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SELLER_PCT = 80;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const supaUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");
    const userClient = createClient(supaUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: udata, error: uerr } = await userClient.auth.getUser();
    if (uerr || !udata.user) throw new Error("Not authenticated");
    const userId = udata.user.id;

    const body = await req.json().catch(() => ({}));
    const kind = String(body?.kind || "") as "mentorship" | "marketplace";
    const id = String(body?.id || "");
    if (!id || !["mentorship", "marketplace"].includes(kind)) {
      throw new Error("Invalid body: { kind, id } required");
    }

    const admin = createClient(supaUrl, serviceKey, { auth: { persistSession: false } });
    const table = kind === "mentorship" ? "mt_mentorship_bookings" : "mt_marketplace_orders";
    const buyerCol = kind === "mentorship" ? "student_id" : "buyer_id";
    const sellerCol = kind === "mentorship" ? "mentor_id" : "seller_id";

    const { data: row, error: rowErr } = await admin.from(table).select("*").eq("id", id).maybeSingle();
    if (rowErr || !row) throw new Error("Row not found");
    if ((row as any)[buyerCol] !== userId) throw new Error("Only the buyer can release funds");
    if ((row as any).status !== "paid") throw new Error(`Cannot release: status is ${(row as any).status}`);
    if ((row as any).stripe_transfer_id) throw new Error("Funds already released");

    // Resolve seller's profile id. For mentorship, mentor_id → mt_mentors.user_id; for marketplace, seller_id is already a profile id.
    let sellerUserId: string;
    if (kind === "mentorship") {
      const { data: mentor } = await admin.from("mt_mentors").select("user_id").eq("id", (row as any).mentor_id).maybeSingle();
      if (!mentor?.user_id) throw new Error("Mentor profile not found");
      sellerUserId = mentor.user_id;
    } else {
      sellerUserId = (row as any)[sellerCol];
    }
    if (!sellerUserId) throw new Error("Seller missing");

    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_connect_account_id, stripe_connect_payouts_enabled")
      .eq("id", sellerUserId)
      .maybeSingle();
    if (!profile?.stripe_connect_account_id) throw new Error("Seller has no Stripe Connect account");
    if (!profile.stripe_connect_payouts_enabled) throw new Error("Seller's Connect payouts not enabled");

    const grossCents = Number((row as any).price_cents);
    if (!Number.isFinite(grossCents) || grossCents <= 0) throw new Error("Invalid amount");
    const sellerCents = Math.floor((grossCents * SELLER_PCT) / 100);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const transfer = await stripe.transfers.create({
      amount: sellerCents,
      currency: "eur",
      destination: profile.stripe_connect_account_id,
      description: `MT ${kind} ${id} (80%)`,
      metadata: { mt_kind: kind, mt_row_id: id, seller_user_id: sellerUserId },
    });

    const now = new Date().toISOString();
    const update: Record<string, unknown> = {
      status: "completed",
      stripe_transfer_id: transfer.id,
      completed_at: now,
    };
    if (kind === "marketplace") update.delivered_at = now;
    const { error: upErr } = await admin.from(table).update(update).eq("id", id);
    if (upErr) {
      console.error("[mt-release-funds] DB update failed AFTER transfer", transfer.id, upErr.message);
      throw new Error(`Transfer ${transfer.id} succeeded but DB update failed: ${upErr.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, transfer_id: transfer.id, seller_cents: sellerCents, platform_cents: grossCents - sellerCents }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[mt-release-funds]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
