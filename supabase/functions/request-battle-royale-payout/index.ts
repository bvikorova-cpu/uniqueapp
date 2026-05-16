// Battle Royale champion claims their prize payout to Stripe Connect.
// All BR payouts go through admin review (pending_review status).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Authorization required" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: u, error: uErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (uErr || !u.user) return json({ error: "Authentication failed" }, 401);
    const user = u.user;

    let body: { tournament_id?: string } = {};
    try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

    const tournament_id = String(body.tournament_id || "");
    if (!/^[0-9a-f-]{36}$/i.test(tournament_id)) return json({ error: "Invalid tournament_id" }, 400);

    // 1. Verify user is the confirmed champion
    const { data: isWinner, error: winErr } = await supabase.rpc("is_battle_royale_winner", {
      _user_id: user.id, _tournament_id: tournament_id,
    });
    if (winErr) { console.error(winErr); return json({ error: "Winner check failed" }, 500); }
    if (!isWinner) return json({ error: "You are not the champion of this tournament" }, 403);

    // 2. Verify Connect account is ready
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_connect_account_id, stripe_connect_payouts_enabled")
      .eq("id", user.id).maybeSingle();
    if (!profile?.stripe_connect_account_id) {
      return json({ error: "No Stripe Connect account. Please complete onboarding first.", code: "NO_CONNECT_ACCOUNT" }, 400);
    }
    if (!profile?.stripe_connect_payouts_enabled) {
      return json({ error: "Payouts not yet enabled. Finish Connect onboarding.", code: "PAYOUTS_DISABLED" }, 400);
    }

    // 3. Check available prize
    const { data: avail, error: balErr } = await supabase.rpc("get_battle_royale_available_payout", {
      _tournament_id: tournament_id,
    });
    if (balErr) { console.error(balErr); return json({ error: "Balance lookup failed" }, 500); }
    const amount_cents = Number(avail ?? 0);
    if (amount_cents <= 0) return json({ error: "No prize available (already paid or not set).", code: "NO_PRIZE" }, 400);

    // 4. Insert payout row with pending_review (admin must approve)
    const { data: row, error: insErr } = await supabase
      .from("campaign_payouts")
      .insert({
        campaign_id: tournament_id,
        campaign_type: "battle_royale",
        owner_user_id: user.id,
        amount_cents,
        currency: "eur",
        stripe_destination_account: profile.stripe_connect_account_id,
        status: "pending_review",
        requires_review: true,
        review_reason: "battle_royale_payout",
      })
      .select("id").single();
    if (insErr || !row) { console.error(insErr); return json({ error: "Could not record payout" }, 500); }

    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "battle_royale_payout_requested",
      title: "Žiadosť o výplatu Battle Royale prijatá",
      message: `Tvoja výhra €${(amount_cents / 100).toFixed(2)} čaká na schválenie administrátorom.`,
      related_id: row.id,
    });

    return json({ success: true, payout_id: row.id, amount_cents, status: "pending_review" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[request-battle-royale-payout]", msg);
    return json({ error: msg }, 500);
  }
});
