import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (s: string, d?: unknown) =>
  console.log(`[CHECK-SCA] ${s}${d ? " - " + JSON.stringify(d) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No session — banner stays hidden. Soft 200 prevents client runtime error.
      return new Response(JSON.stringify({ has_pending: false, unauthenticated: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user?.email) {
      // Auth backend may be momentarily unreachable. Return a soft 200 so the
      // SCA banner stays hidden instead of surfacing as a client runtime error.
      return new Response(JSON.stringify({ has_pending: false, auth_unavailable: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = userData.user;
    log("auth ok", { email: user.email });

    // DB-only path: stripe-webhook keeps `sca_pending_actions` in sync via
    // invoice.payment_action_required / invoice.payment_succeeded, so the DB
    // is the source of truth for the banner. We avoid loading Stripe SDK here
    // entirely to keep cold-starts cheap and prevent edge-runtime errors.
    const { data: pendingRows, error: pendingErr } = await supabase
      .from("sca_pending_actions")
      .select("stripe_invoice_id, amount_cents, currency, hosted_invoice_url, next_action_url")
      .eq("user_id", user.id)
      .eq("status", "requires_action")
      .limit(1);

    if (pendingErr) {
      log("pending lookup unavailable", pendingErr);
      return new Response(JSON.stringify({ has_pending: false, check_unavailable: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!pendingRows || pendingRows.length === 0) {
      return new Response(JSON.stringify({ has_pending: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pending = pendingRows[0];

    return new Response(
      JSON.stringify({
        has_pending: true,
        pending: {
          invoice_id: pending.stripe_invoice_id,
          amount_cents: pending.amount_cents,
          currency: pending.currency,
          hosted_invoice_url: pending.hosted_invoice_url,
          next_action_url: pending.next_action_url,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ has_pending: false, check_unavailable: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
