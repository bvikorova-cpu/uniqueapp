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

    // 2. Atomic release via SECURITY DEFINER RPC (locks row, checks status, inserts earnings, updates balance, flips status — all in one transaction).
    const { data: rpcRes, error: rpcErr } = await supabase.rpc("release_brand_campaign_escrow", {
      _escrow_id: escrowId,
      _actor: user.id,
    });
    if (rpcErr) {
      console.error("release_brand_campaign_escrow RPC failed:", rpcErr);
      return jsonError("Release failed", 500);
    }
    if (rpcRes?.error) {
      const map: Record<string, [string, number]> = {
        not_found: ["Escrow not found", 404],
        forbidden: ["Not authorized", 403],
        invalid_status: [`Escrow is in status '${rpcRes.status}', cannot release`, 409],
      };
      const [msg, status] = map[rpcRes.error] ?? [rpcRes.error, 400];
      return jsonError(msg, status);
    }

    const netEur = Number(rpcRes?.net_eur ?? escrow.net_cents / 100);
    const grossEur = escrow.amount_cents / 100;

    // Optional release note from caller (RPC stores a default; only overwrite if user provided one).
    if (note) {
      await supabase.from("campaign_escrow").update({ release_note: note }).eq("id", escrowId);
    }



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
