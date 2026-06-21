// Thin compatibility shim: forwards to check-router with action="sca".
// Kept as a real edge function so the proxy wrapper isn't required (avoids
// race conditions when the SCABanner mounts before the lazy patcher loads).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ has_pending: false, unauthenticated: true });
    }
    const { data: userData, error: userErr } = await sb.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userData.user) {
      return json({ has_pending: false, auth_unavailable: true });
    }
    const { data: rows, error } = await sb
      .from("sca_pending_actions")
      .select("stripe_invoice_id, amount_cents, currency, hosted_invoice_url, next_action_url")
      .eq("user_id", userData.user.id)
      .eq("status", "requires_action")
      .limit(1);
    if (error || !rows || rows.length === 0) return json({ has_pending: false });
    const p = rows[0];
    return json({
      has_pending: true,
      pending: {
        invoice_id: p.stripe_invoice_id,
        amount_cents: p.amount_cents,
        currency: p.currency,
        hosted_invoice_url: p.hosted_invoice_url,
        next_action_url: p.next_action_url,
      },
    });
  } catch (e) {
    console.error("[check-sca]", e instanceof Error ? e.message : e);
    return json({ has_pending: false, check_unavailable: true });
  }
});
