// Router edge function for Handwriting Pro billing.
// Handles Stripe checkout, status check, and customer portal for:
//   - Couples Subscription (€14.99/mo)  → action: "couples-checkout" | "couples-status" | "portal"
//   - HR Pro Subscription (€99/mo)      → action: "hr-checkout"      | "hr-status"      | "portal"
//   - Couples invite acceptance         → action: "accept-couples-invite"
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const PRICES = {
  couples: "price_1TNs5DGaXSfGtYFtIEzPmxzo", // €14.99/mo
  hr_pro: "price_1TNs5EGaXSfGtYFt4pks23YW",  // €99/mo
};

const log = (s: string, d?: unknown) =>
  console.log(`[handwriting-billing] ${s}${d ? ` ${JSON.stringify(d)}` : ""}`);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Stripe not configured" }, 500);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return json({ error: "Unauthorized" }, 401);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.json().catch(() => ({}));
    const action = body.action as string;
    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    // ---- helper: find or create Stripe customer ----
    const getCustomerId = async (): Promise<string> => {
      const list = await stripe.customers.list({ email: user.email!, limit: 1 });
      if (list.data.length > 0) return list.data[0].id;
      const c = await stripe.customers.create({ email: user.email!, metadata: { user_id: user.id } });
      return c.id;
    };

    // ====================================================
    // COUPLES — CHECKOUT
    // ====================================================
    if (action === "couples-checkout") {
      const partnerEmail = (body.partnerEmail as string)?.trim().toLowerCase();
      if (!partnerEmail || !/.+@.+\..+/.test(partnerEmail)) {
        return json({ error: "Valid partner email required" }, 400);
      }
      if (partnerEmail === user.email!.toLowerCase()) {
        return json({ error: "Partner email must be different from yours" }, 400);
      }

      const customerId = await getCustomerId();

      // Create pending row
      const { data: subRow, error: insErr } = await supabase
        .from("couples_subscriptions")
        .insert({
          partner_a_user_id: user.id,
          partner_b_email: partnerEmail,
          status: "pending",
          stripe_customer_id: customerId,
        })
        .select()
        .single();

      if (insErr) {
        log("insert error", insErr);
        return json({ error: "Could not create subscription record" }, 500);
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{ price: PRICES.couples, quantity: 1 }],
        mode: "subscription",
        success_url: `${origin}/handwriting?couples=success&sub_id=${subRow.id}`,
        cancel_url: `${origin}/handwriting?couples=cancelled`,
        metadata: {
          user_id: user.id,
          couples_subscription_id: subRow.id,
          plan: "couples",
        },
        subscription_data: {
          metadata: {
            user_id: user.id,
            couples_subscription_id: subRow.id,
            plan: "couples",
          },
        },
      });

      return json({ url: session.url, subscriptionId: subRow.id, inviteToken: subRow.invite_token });
    }

    // ====================================================
    // COUPLES — STATUS
    // ====================================================
    if (action === "couples-status") {
      const { data: rows } = await supabase
        .from("couples_subscriptions")
        .select("*")
        .or(`partner_a_user_id.eq.${user.id},partner_b_user_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(1);
      const sub = rows?.[0];
      if (!sub) return json({ active: false });

      // Refresh from Stripe if we have an id
      if (sub.stripe_subscription_id) {
        try {
          const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
          const isActive = ["active", "trialing"].includes(stripeSub.status);
          const periodEnd = new Date(stripeSub.current_period_end * 1000).toISOString();
          await supabase
            .from("couples_subscriptions")
            .update({
              status: isActive ? "active" : stripeSub.status,
              current_period_end: periodEnd,
              cancelled_at: stripeSub.cancel_at_period_end ? new Date().toISOString() : null,
            })
            .eq("id", sub.id);
          return json({
            active: isActive,
            subscription: { ...sub, status: stripeSub.status, current_period_end: periodEnd },
          });
        } catch (e) {
          log("stripe retrieve failed", { err: (e as Error).message });
        }
      }

      // Or look up by customer email if subscription_id missing
      const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      if (customers.data.length === 0) return json({ active: false, subscription: sub });

      const subs = await stripe.subscriptions.list({
        customer: customers.data[0].id,
        status: "active",
        limit: 5,
      });
      const couplesSub = subs.data.find((s) => s.items.data.some((i) => i.price.id === PRICES.couples));
      if (couplesSub) {
        const periodEnd = new Date(couplesSub.current_period_end * 1000).toISOString();
        await supabase
          .from("couples_subscriptions")
          .update({
            stripe_subscription_id: couplesSub.id,
            stripe_customer_id: customers.data[0].id,
            status: "active",
            started_at: sub.started_at ?? new Date().toISOString(),
            current_period_end: periodEnd,
          })
          .eq("id", sub.id);
        return json({ active: true, subscription: { ...sub, status: "active", current_period_end: periodEnd } });
      }

      return json({ active: false, subscription: sub });
    }

    // ====================================================
    // COUPLES — ACCEPT INVITE
    // ====================================================
    if (action === "accept-couples-invite") {
      const token = body.inviteToken as string;
      if (!token) return json({ error: "inviteToken required" }, 400);
      const { data: sub } = await supabase
        .from("couples_subscriptions")
        .select("*")
        .eq("invite_token", token)
        .maybeSingle();
      if (!sub) return json({ error: "Invalid invite token" }, 404);
      if (sub.partner_b_email.toLowerCase() !== user.email!.toLowerCase()) {
        return json({ error: "This invite is for a different email" }, 403);
      }
      const { error } = await supabase
        .from("couples_subscriptions")
        .update({ partner_b_user_id: user.id })
        .eq("id", sub.id);
      if (error) return json({ error: "Could not link account" }, 500);
      return json({ success: true, subscriptionId: sub.id });
    }

    // ====================================================
    // HR PRO — CHECKOUT
    // ====================================================
    if (action === "hr-checkout") {
      const orgName = (body.orgName as string)?.trim();
      if (!orgName) return json({ error: "Organization name required" }, 400);

      const customerId = await getCustomerId();

      // upsert pending hr sub
      const { data: existing } = await supabase
        .from("hr_pro_subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      let subId = existing?.id;
      if (!subId) {
        const { data: created, error: cErr } = await supabase
          .from("hr_pro_subscriptions")
          .insert({
            user_id: user.id,
            org_name: orgName,
            status: "pending",
            stripe_customer_id: customerId,
          })
          .select("id")
          .single();
        if (cErr) return json({ error: "Could not create HR subscription" }, 500);
        subId = created.id;
      } else {
        await supabase
          .from("hr_pro_subscriptions")
          .update({ org_name: orgName, stripe_customer_id: customerId })
          .eq("id", subId);
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{ price: PRICES.hr_pro, quantity: 1 }],
        mode: "subscription",
        success_url: `${origin}/handwriting?hr=success`,
        cancel_url: `${origin}/handwriting?hr=cancelled`,
        metadata: { user_id: user.id, hr_subscription_id: subId, plan: "hr_pro" },
        subscription_data: { metadata: { user_id: user.id, hr_subscription_id: subId, plan: "hr_pro" } },
      });
      return json({ url: session.url });
    }

    // ====================================================
    // HR PRO — STATUS
    // ====================================================
    if (action === "hr-status") {
      const { data: hr } = await supabase
        .from("hr_pro_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!hr) return json({ active: false });

      const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      if (customers.data.length === 0) return json({ active: false, subscription: hr });
      const subs = await stripe.subscriptions.list({
        customer: customers.data[0].id,
        status: "active",
        limit: 5,
      });
      const hrSub = subs.data.find((s) => s.items.data.some((i) => i.price.id === PRICES.hr_pro));
      if (!hrSub) {
        await supabase.from("hr_pro_subscriptions").update({ status: "inactive" }).eq("id", hr.id);
        return json({ active: false, subscription: { ...hr, status: "inactive" } });
      }
      const periodEnd = new Date(hrSub.current_period_end * 1000).toISOString();
      await supabase
        .from("hr_pro_subscriptions")
        .update({
          status: "active",
          stripe_subscription_id: hrSub.id,
          stripe_customer_id: customers.data[0].id,
          started_at: hr.started_at ?? new Date().toISOString(),
          current_period_end: periodEnd,
        })
        .eq("id", hr.id);
      return json({
        active: true,
        subscription: { ...hr, status: "active", current_period_end: periodEnd, stripe_subscription_id: hrSub.id },
      });
    }

    // ====================================================
    // CUSTOMER PORTAL (works for any sub belonging to user)
    // ====================================================
    if (action === "portal") {
      const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      if (customers.data.length === 0) return json({ error: "No Stripe customer found" }, 404);
      const portal = await stripe.billingPortal.sessions.create({
        customer: customers.data[0].id,
        return_url: `${origin}/handwriting`,
      });
      return json({ url: portal.url });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", { msg });
    return json({ error: msg }, 500);
  }
});
