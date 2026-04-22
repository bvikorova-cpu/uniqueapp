import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr) throw new Error(userErr.message);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    log("auth ok", { email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ has_pending: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const customerId = customers.data[0].id;

    const invoices = await stripe.invoices.list({
      customer: customerId,
      status: "open",
      limit: 5,
      expand: ["data.payment_intent"],
    });

    const requiresActionInvoice = invoices.data.find((inv) => {
      const pi = (inv as any).payment_intent;
      return pi && typeof pi === "object" && pi.status === "requires_action";
    });

    if (!requiresActionInvoice) {
      await supabase
        .from("sca_pending_actions")
        .update({ status: "confirmed", resolved_at: new Date().toISOString() })
        .eq("email", user.email)
        .eq("status", "requires_action");

      return new Response(JSON.stringify({ has_pending: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pi = (requiresActionInvoice as any).payment_intent;
    const nextActionUrl = pi?.next_action?.redirect_to_url?.url ?? null;

    const row = {
      user_id: user.id,
      email: user.email,
      stripe_customer_id: customerId,
      stripe_invoice_id: requiresActionInvoice.id,
      stripe_payment_intent_id: pi?.id ?? null,
      amount_cents: requiresActionInvoice.amount_due ?? 0,
      currency: (requiresActionInvoice.currency ?? "eur").toLowerCase(),
      hosted_invoice_url: requiresActionInvoice.hosted_invoice_url ?? null,
      next_action_url: nextActionUrl,
      status: "requires_action",
    };

    await supabase
      .from("sca_pending_actions")
      .upsert(row, { onConflict: "stripe_invoice_id" });

    return new Response(
      JSON.stringify({
        has_pending: true,
        pending: {
          invoice_id: requiresActionInvoice.id,
          amount_cents: requiresActionInvoice.amount_due,
          currency: requiresActionInvoice.currency,
          hosted_invoice_url: requiresActionInvoice.hosted_invoice_url,
          next_action_url: nextActionUrl,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
