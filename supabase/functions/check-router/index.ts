// Batch 16 — check-router consolidates subscription/credit status checks:
//   action: "lottery"        ← check-lottery-subscription
//   action: "phobia"         ← check-phobia-subscription
//   action: "tipster"        ← check-tipster-subscription
//   action: "megatalent_sub" ← check-megatalent-subscription
//   action: "megatalent_vip" ← check-megatalent-vip
// Routed via src/integrations/supabase/proxyMap.ts.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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

const LOTTERY_PRODUCTS = {
  basic: "prod_TQinlyjGo50cTk",
  pro: "prod_TQinw9pUYC81T8",
};
const TIPSTER_PRODUCT_ID = "prod_TQkgfkhRhpZSXw";
const MT_PRICE_TO_TIER: Record<string, "premium" | "top_premium"> = {
  price_1TOvuRGaXSfGtYFt6sfpt2Dy: "premium",
  price_1TOvuTGaXSfGtYFtIheCgIzQ: "top_premium",
};
const MT_TIER_PRICE: Record<string, number> = { premium: 10, top_premium: 15 };

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );
}

function stripeClient() {
  return new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2025-08-27.basil",
  });
}

async function getUser(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const sb = admin();
  const { data, error } = await sb.auth.getUser(auth.replace("Bearer ", ""));
  if (error || !data.user?.email) return null;
  return data.user;
}

function periodEndIso(sub: any): string | null {
  const v = sub?.current_period_end;
  if (typeof v !== "number" || !isFinite(v)) return null;
  return new Date(v * 1000).toISOString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const action = String(body?.action ?? "");

  try {
    const user = await getUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const stripe = stripeClient();
    const sb = admin();

    if (action === "lottery") {
      const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      if (customers.data.length === 0) {
        return json({
          subscribed: false, isBasic: false, isPro: false,
          subscription_end: null, product_id: null,
        });
      }
      const subs = await stripe.subscriptions.list({
        customer: customers.data[0].id, status: "active", limit: 10,
      });
      let isBasic = false, isPro = false, subscriptionEnd: string | null = null, productId: string | null = null;
      for (const s of subs.data) {
        const pid = s.items.data[0].price.product as string;
        subscriptionEnd = periodEndIso(s);
        if (pid === LOTTERY_PRODUCTS.basic) { isBasic = true; productId = pid; }
        else if (pid === LOTTERY_PRODUCTS.pro) { isPro = true; productId = pid; }
      }
      return json({
        subscribed: isBasic || isPro,
        isBasic, isPro,
        subscription_end: subscriptionEnd,
        product_id: productId,
      });
    }

    if (action === "phobia") {
      const { data: credits } = await sb
        .from("phobia_credits").select("*").eq("user_id", user.id).maybeSingle();
      const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      let subscribed = false, subscription_end: string | null = null;
      if (customers.data.length > 0) {
        const subs = await stripe.subscriptions.list({
          customer: customers.data[0].id, status: "active", limit: 1,
        });
        if (subs.data.length > 0) {
          subscribed = true;
          subscription_end = periodEndIso(subs.data[0]);
        }
      }
      return json({
        subscribed,
        subscription_end,
        credits_remaining: credits?.credits_remaining || 0,
        total_credits_purchased: credits?.total_credits_purchased || 0,
      });
    }

    if (action === "tipster") {
      const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      let has = false, end: string | null = null;
      if (customers.data.length > 0) {
        const subs = await stripe.subscriptions.list({
          customer: customers.data[0].id, status: "active", limit: 10,
        });
        const t = subs.data.find((s) =>
          s.items.data.some((it) => (it.price.product as string) === TIPSTER_PRODUCT_ID),
        );
        if (t) { has = true; end = periodEndIso(t); }
      }
      if (has && end) {
        const { data: existing } = await sb
          .from("sports_tipsters").select("id, status").eq("user_id", user.id).single();
        if (existing?.status === "pending") {
          await sb.from("sports_tipsters")
            .update({ status: "active", subscription_end: end })
            .eq("user_id", user.id);
        }
      }
      return json({ has_tipster_subscription: has, tipster_subscription_end: end });
    }

    if (action === "megatalent_sub") {
      const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      if (customers.data.length === 0) {
        await sb.from("megatalent_subscriptions")
          .update({ status: "inactive" })
          .eq("user_id", user.id).eq("status", "active");
        return json({ subscribed: false, tier: null });
      }
      const customerId = customers.data[0].id;
      const subs = await stripe.subscriptions.list({
        customer: customerId, status: "active", limit: 5,
      });
      const mtSub = subs.data.find((s) =>
        s.items.data.some((it) => MT_PRICE_TO_TIER[it.price.id]),
      );
      if (!mtSub) {
        await sb.from("megatalent_subscriptions")
          .update({ status: "inactive" })
          .eq("user_id", user.id).eq("status", "active");
        return json({ subscribed: false, tier: null });
      }
      const priceId = mtSub.items.data.find((it) => MT_PRICE_TO_TIER[it.price.id])!.price.id;
      const tier = MT_PRICE_TO_TIER[priceId];
      const end = periodEndIso(mtSub)!;
      const payload = {
        user_id: user.id,
        tier,
        price: MT_TIER_PRICE[tier],
        bonus_votes: 0,
        win_chance_boost: tier === "top_premium" ? 100 : 0,
        status: "active",
        stripe_customer_id: customerId,
        stripe_subscription_id: mtSub.id,
        current_period_end: end,
      };
      const { data: existing } = await sb
        .from("megatalent_subscriptions").select("id").eq("user_id", user.id).maybeSingle();
      if (existing) {
        await sb.from("megatalent_subscriptions").update(payload).eq("id", existing.id);
      } else {
        await sb.from("megatalent_subscriptions").insert(payload);
      }
      return json({ subscribed: true, tier, current_period_end: end });
    }

    if (action === "megatalent_vip") {
      const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      if (customers.data.length === 0) {
        await sb.from("megatalent_vip_viewers").upsert(
          { user_id: user.id, status: "inactive" },
          { onConflict: "user_id" },
        );
        return json({ is_vip: false });
      }
      const customerId = customers.data[0].id;
      const subs = await stripe.subscriptions.list({
        customer: customerId, status: "active", limit: 10,
      });
      const vipSub = subs.data.find((s) =>
        s.metadata?.kind === "megatalent_vip_viewer" ||
        s.items.data.some((i) => i.price.nickname?.includes("VIP")),
      ) ?? subs.data[0];
      const isVip = !!vipSub && vipSub.status === "active";
      const end = vipSub ? periodEndIso(vipSub) : null;
      await sb.from("megatalent_vip_viewers").upsert(
        {
          user_id: user.id,
          status: isVip ? "active" : "inactive",
          stripe_customer_id: customerId,
          stripe_subscription_id: vipSub?.id ?? null,
          current_period_end: end,
        },
        { onConflict: "user_id" },
      );
      return json({ is_vip: isVip, current_period_end: end });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[check-router:${action}]`, msg);
    return json({ error: msg }, 500);
  }
});
