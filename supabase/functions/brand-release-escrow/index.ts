// Brand Collaboration — Release escrow
// Brand confirms the campaign was delivered. We move the held funds (80%) into
// influencer_earnings so the creator can withdraw, and mark the escrow as released.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonError("Missing authorization", 401);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return jsonError("Unauthorized", 401);
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const escrowId: string | undefined = body?.escrowId;
    const note: string = String(body?.note ?? "").slice(0, 500);
    if (!escrowId) return jsonError("escrowId is required", 400);

    // 1. Load escrow row.
    const { data: escrow, error: escrowErr } = await supabase
      .from("campaign_escrow")
      .select("*")
      .eq("id", escrowId)
      .maybeSingle();

    if (escrowErr || !escrow) return jsonError("Escrow not found", 404);

    // 2. Authorization: brand owner OR admin can release.
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    const isAdmin = !!roleRow;
    const isBrandOwner = escrow.brand_user_id === user.id;
    if (!isAdmin && !isBrandOwner) return jsonError("Not authorized", 403);

    if (escrow.status !== "held") {
      return jsonError(`Escrow is in status '${escrow.status}', cannot release`, 409);
    }

    // 3. Insert influencer_earnings row (creator can withdraw this).
    const netEur = escrow.net_cents / 100;
    const feeEur = escrow.platform_fee_cents / 100;
    const grossEur = escrow.amount_cents / 100;

    const { error: earningsErr } = await supabase.from("influencer_earnings").insert({
      influencer_id: escrow.influencer_id,
      user_id: escrow.influencer_user_id,
      amount: grossEur,
      platform_fee: feeEur,
      net_amount: netEur,
      source: "brand_campaign",
    });
    if (earningsErr) {
      console.error("Failed to insert earnings:", earningsErr);
      return jsonError("Failed to credit influencer earnings", 500);
    }

    // 4. Update influencer_balances atomically.
    const { data: balance } = await supabase
      .from("influencer_balances")
      .select("total_earned")
      .eq("influencer_id", escrow.influencer_id)
      .maybeSingle();

    if (balance) {
      await supabase
        .from("influencer_balances")
        .update({
          total_earned: Number(balance.total_earned ?? 0) + netEur,
          updated_at: new Date().toISOString(),
        })
        .eq("influencer_id", escrow.influencer_id);
    } else {
      await supabase.from("influencer_balances").insert({
        influencer_id: escrow.influencer_id,
        total_earned: netEur,
        withdrawn: 0,
        pending_withdrawal: 0,
      });
    }

    // 5. Mark escrow released + application paid.
    const nowIso = new Date().toISOString();
    await supabase
      .from("campaign_escrow")
      .update({ status: "released", released_at: nowIso, release_note: note || null })
      .eq("id", escrowId);

    await supabase
      .from("campaign_applications")
      .update({ payment_status: "released", updated_at: nowIso })
      .eq("id", escrow.application_id);

    // 6. Notify both parties.
    await supabase.from("notifications").insert([
      {
        user_id: escrow.influencer_user_id,
        type: "campaign_payout_released",
        title: "Campaign payout released",
        message: `€${netEur.toFixed(2)} from your brand campaign is now available to withdraw.`,
      },
      {
        user_id: escrow.brand_user_id,
        type: "campaign_payout_released",
        title: "Escrow released",
        message: `You released €${grossEur.toFixed(2)} for the brand campaign. Thank you!`,
      },
    ]);

    return new Response(
      JSON.stringify({ success: true, releasedEur: netEur }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return jsonError(String((err as any)?.message ?? err), 500);
  }
});

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
