import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { authenticateUser, createSupabaseAdminClient } from "../_shared/supabaseClient.ts";
import { createStripeClient, getStripeCustomer, safeParseStripeDate } from "../_shared/stripe.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

/**
 * Reconciles fan-club membership rows with Stripe reality.
 * - Called after checkout redirect and on the InfluKing page load.
 * - Optional { fan_club_id } narrows work; without it, reconciles all clubs.
 * - Every attempt (success or failure) is logged to `fanclub_verify_audit`.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startedAt = Date.now();
  let audit = { user_id: null as string | null,
    email: null as string | null,
    fan_club_id: null as string | null,
    outcome: "unknown" as string,
    error_message: null as string | null,
    stripe_customer_id: null as string | null,
    subscriptions_found: 0,
    memberships_synced: 0,
    status_summary: null as Record<string, number> | null };
  const admin = createSupabaseAdminClient();

  const writeAudit = async () => { try {
      await admin.from("fanclub_verify_audit").insert({
        ...audit,
        duration_ms: Date.now() - startedAt });
    } catch (e) {
      console.error("[fanclub-verify] audit write failed", (e as Error)?.message);
    }
  };

  try {
    const body = await req.json().catch(() => ({}));
    const filterClubId: string | undefined = body?.fan_club_id;
    audit.fan_club_id = filterClubId ?? null;

    let userId: string | undefined;
    let email: string | undefined;
    try {
      const auth = await authenticateUser(req);
      userId = auth.userId;
      email = auth.email;
    } catch (e: any) {
      audit.outcome = "auth_error";
      audit.error_message = e?.message ?? "auth failed";
      await writeAudit();
      return new Response(JSON.stringify({ error: audit.error_message }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    audit.user_id = userId ?? null;
    audit.email = email ?? null;

    if (!email) {
      audit.outcome = "no_email";
      audit.error_message = "Email not available";
      await writeAudit();
      return new Response(JSON.stringify({ error: audit.error_message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const stripe = createStripeClient();

    const customerId = await getStripeCustomer(stripe, email);
    audit.stripe_customer_id = customerId ?? null;
    if (!customerId) {
      audit.outcome = "no_customer";
      await writeAudit();
      return new Response(JSON.stringify({ memberships: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const subs = await stripe.subscriptions.list({ customer: customerId,
      status: "all",
      limit: 100,
      expand: ["data.items.data.price"] });

    const relevant = subs.data.filter(
      (s) =>
        s.metadata?.type === "fan_club" &&
        s.metadata?.user_id === userId &&
        (!filterClubId || s.metadata?.fan_club_id === filterClubId),
    );
    audit.subscriptions_found = relevant.length;

    const results: Array<Record<string, unknown>> = [];
    const statusSummary: Record<string, number> = {};

    for (const sub of relevant) { const clubId = sub.metadata?.fan_club_id;
      if (!clubId) continue;

      const active = sub.status === "active" || sub.status === "trialing";
      const mappedStatus =
        sub.status === "active" || sub.status === "trialing"
          ? "active"
          : sub.status === "past_due"
            ? "past_due"
            : sub.status === "canceled" || sub.status === "unpaid"
              ? "canceled"
              : sub.status === "incomplete_expired"
                ? "expired"
                : "pending";

      const row = {
        fan_club_id: clubId,
        user_id: userId,
        status: mappedStatus,
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        current_period_end: safeParseStripeDate((sub as any).current_period_end),
        cancel_at_period_end: Boolean((sub as any).cancel_at_period_end) };

      const { error: upsertErr } = await admin
        .from("influencer_fan_club_members")
        .upsert(row, { onConflict: "fan_club_id,user_id" });

      if (upsertErr) {
        audit.error_message = `upsert failed: ${upsertErr.message}`;
      } else {
        audit.memberships_synced += 1;
      }

      statusSummary[mappedStatus] = (statusSummary[mappedStatus] ?? 0) + 1;
      results.push({ fan_club_id: clubId, active, status: mappedStatus });
    }

    audit.status_summary = statusSummary;
    audit.outcome = audit.error_message ? "partial_error" : "success";
    await writeAudit();

    return new Response(JSON.stringify({ memberships: results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("[fanclub-verify]", e?.message);
    audit.outcome = audit.outcome === "unknown" ? "stripe_error" : audit.outcome;
    audit.error_message = e?.message ?? "error";
    await writeAudit();
    return new Response(JSON.stringify({ error: e?.message ?? "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
