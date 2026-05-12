// AI Credits auto-recharge edge function
// Actions: get_settings, save_setup_link, save_settings, charge, disable
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const log = (s: string, d?: unknown) =>
  console.log(`[ai-auto-recharge] ${s}${d ? " " + JSON.stringify(d) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const sb = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("No authorization header");
    const { data: u, error: ue } = await sb.auth.getUser(auth.replace("Bearer ", ""));
    if (ue) throw new Error(ue.message);
    const user = u.user;
    if (!user?.email) throw new Error("Unauthenticated");

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "get_settings");
    log("action", { action, userId: user.id });

    // Helper: ensure stripe customer
    const ensureCustomer = async (existingId?: string | null) => {
      if (existingId) {
        try { return await stripe.customers.retrieve(existingId); } catch {}
      }
      const list = await stripe.customers.list({ email: user.email!, limit: 1 });
      if (list.data.length) return list.data[0];
      return await stripe.customers.create({ email: user.email!, metadata: { user_id: user.id } });
    };

    // Load current row
    const { data: row } = await sb
      .from("ai_credits_auto_recharge")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (action === "get_settings") {
      let pmDetails: { brand?: string; last4?: string } | null = null;
      if (row?.stripe_payment_method_id) {
        try {
          const pm = await stripe.paymentMethods.retrieve(row.stripe_payment_method_id);
          if (pm.card) pmDetails = { brand: pm.card.brand, last4: pm.card.last4 };
        } catch (e) { log("pm retrieve fail", { e: String(e) }); }
      }
      return new Response(JSON.stringify({ settings: row, paymentMethod: pmDetails }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "save_setup_link") {
      // Stripe Checkout in setup mode -> saves a card to customer
      const customer = await ensureCustomer(row?.stripe_customer_id);
      const origin = req.headers.get("origin") || "https://uniqueapp.fun";
      const session = await stripe.checkout.sessions.create({
        mode: "setup",
        customer: customer.id,
        payment_method_types: ["card"],
        success_url: `${origin}/ai-credits-store?autorecharge=setup_success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/ai-credits-store?autorecharge=setup_canceled`,
      });
      // upsert customer id
      await sb.from("ai_credits_auto_recharge").upsert({
        user_id: user.id,
        stripe_customer_id: customer.id,
        enabled: row?.enabled ?? false,
        threshold: row?.threshold ?? 10,
        package_credits: row?.package_credits ?? 25,
        package_price_eur: row?.package_price_eur ?? 10.00,
      }, { onConflict: "user_id" });
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "confirm_setup") {
      const sessionId = String(body.session_id || "");
      if (!sessionId) throw new Error("session_id required");
      const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["setup_intent"] });
      const si: any = session.setup_intent;
      const pmId = typeof si === "string" ? null : si?.payment_method;
      if (!pmId) throw new Error("No payment method on session");
      const customer = await ensureCustomer(row?.stripe_customer_id || (session.customer as string));
      await stripe.paymentMethods.attach(pmId, { customer: customer.id }).catch(() => {});
      await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: pmId } });
      await sb.from("ai_credits_auto_recharge").upsert({
        user_id: user.id,
        stripe_customer_id: customer.id,
        stripe_payment_method_id: pmId,
        enabled: true,
        threshold: row?.threshold ?? 10,
        package_credits: row?.package_credits ?? 25,
        package_price_eur: row?.package_price_eur ?? 10.00,
      }, { onConflict: "user_id" });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "save_settings") {
      const enabled = !!body.enabled;
      const threshold = Math.max(1, Math.min(500, Number(body.threshold ?? 10)));
      const pkgCredits = Number(body.package_credits ?? 25);
      const pkgPrice = Number(body.package_price_eur ?? 10);
      const allowed = new Set([10, 25, 60, 150, 100]);
      if (!allowed.has(pkgCredits)) throw new Error("Invalid package");
      await sb.from("ai_credits_auto_recharge").upsert({
        user_id: user.id,
        enabled,
        threshold,
        package_credits: pkgCredits,
        package_price_eur: pkgPrice,
      }, { onConflict: "user_id" });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "disable") {
      await sb.from("ai_credits_auto_recharge").update({
        enabled: false,
      }).eq("user_id", user.id);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "charge") {
      if (!row?.enabled) throw new Error("Auto-recharge not enabled");
      if (!row.stripe_customer_id || !row.stripe_payment_method_id)
        throw new Error("No saved payment method");

      // Check current balance
      const { data: ac } = await sb.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
      const current = ac?.credits_remaining ?? 0;
      if (current > row.threshold) {
        return new Response(JSON.stringify({ skipped: true, reason: "above_threshold", current }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Off-session charge
      try {
        const intent = await stripe.paymentIntents.create({
          amount: Math.round(Number(row.package_price_eur) * 100),
          currency: "eur",
          customer: row.stripe_customer_id,
          payment_method: row.stripe_payment_method_id,
          off_session: true,
          confirm: true,
          description: `AI Credits auto-recharge: ${row.package_credits} credits`,
          metadata: { user_id: user.id, credits: String(row.package_credits), kind: "ai_credits_auto_recharge" },
        });

        // Add credits
        const newBalance = current + row.package_credits;
        await sb.from("ai_credits").update({
          credits_remaining: newBalance,
          total_credits_purchased: (await sb.from("ai_credits").select("total_credits_purchased").eq("user_id", user.id).maybeSingle()).data?.total_credits_purchased + row.package_credits,
        }).eq("user_id", user.id);

        await sb.from("ai_credits_auto_recharge").update({
          last_recharge_at: new Date().toISOString(),
          last_recharge_status: "succeeded",
          last_error: null,
        }).eq("user_id", user.id);

        return new Response(JSON.stringify({ ok: true, charged: row.package_price_eur, credits_added: row.package_credits, intent_id: intent.id }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e: any) {
        const msg = e?.message || String(e);
        await sb.from("ai_credits_auto_recharge").update({
          last_recharge_at: new Date().toISOString(),
          last_recharge_status: "failed",
          last_error: msg.slice(0, 500),
        }).eq("user_id", user.id);
        // 3DS / authentication required
        if (e?.code === "authentication_required") {
          return new Response(JSON.stringify({ error: "authentication_required", message: "Card needs re-authentication. Please update payment method." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw e;
      }
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    log("ERROR", { msg: e?.message });
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
