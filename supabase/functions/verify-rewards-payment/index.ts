// Verifies a Rewards checkout session and grants the purchase server-side.
// Body: { sessionId: string }
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: claims } = await supa.auth.getClaims(auth.replace("Bearer ", ""));
    const user = claims?.claims;
    if (!user?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { sessionId } = await req.json().catch(() => ({}));
    if (!sessionId) throw new Error("Missing sessionId");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ ok: false, reason: "not_paid", status: session.payment_status }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const md = session.metadata || {};
    if (md.user_id !== user.sub) throw new Error("Session does not belong to caller");

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Idempotency: skip if a history row already references this session.
    const { data: existing } = await admin
      .from("streak_freeze_history").select("id").eq("notes", `stripe:${sessionId}`).maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ ok: true, already_granted: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (md.kind === "streak_freeze") {
      const qty = Number(md.qty || 0);
      if (qty <= 0) throw new Error("Invalid qty");
      const eurCents = session.amount_total ?? 0;

      const { data: row } = await admin.from("user_streak_freezes")
        .select("id, available_count, total_purchased").eq("user_id", user.sub).maybeSingle();
      if (row) {
        await admin.from("user_streak_freezes").update({
          available_count: (row.available_count ?? 0) + qty,
          total_purchased: (row.total_purchased ?? 0) + qty,
          updated_at: new Date().toISOString(),
        }).eq("id", row.id);
      } else {
        await admin.from("user_streak_freezes").insert({
          user_id: user.sub, available_count: qty, total_purchased: qty,
        });
      }
      await admin.from("streak_freeze_history").insert({
        user_id: user.sub, action: "purchase_eur", quantity: qty,
        cost_eur: eurCents / 100, notes: `stripe:${sessionId}`,
      });
      return new Response(JSON.stringify({ ok: true, granted: qty }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (md.kind === "battle_pass_premium") {
      const seasonId = md.season_id;
      if (!seasonId) throw new Error("Missing season_id");
      // Idempotency: check if premium already set
      const { data: bp } = await admin.from("user_battle_pass")
        .select("id, has_premium").eq("user_id", user.sub).eq("season_id", seasonId).maybeSingle();
      if (bp?.has_premium) {
        // Mark history so re-verifies are no-ops
        await admin.from("streak_freeze_history").insert({
          user_id: user.sub, action: "battle_pass_premium", quantity: 0,
          cost_eur: (session.amount_total ?? 0) / 100, notes: `stripe:${sessionId}`,
        });
        return new Response(JSON.stringify({ ok: true, already_granted: true }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (bp) {
        await admin.from("user_battle_pass").update({
          has_premium: true, premium_purchased_at: new Date().toISOString(),
        }).eq("id", bp.id);
      } else {
        await admin.from("user_battle_pass").insert({
          user_id: user.sub, season_id: seasonId, has_premium: true,
          premium_purchased_at: new Date().toISOString(),
        });
      }
      await admin.from("streak_freeze_history").insert({
        user_id: user.sub, action: "battle_pass_premium", quantity: 0,
        cost_eur: (session.amount_total ?? 0) / 100, notes: `stripe:${sessionId}`,
      });
      return new Response(JSON.stringify({ ok: true, granted: "battle_pass_premium" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown kind: ${md.kind}`);
  } catch (e: any) {
    console.error("[verify-rewards-payment]", e);
    return new Response(JSON.stringify({ error: e?.message || "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
