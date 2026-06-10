import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr) throw userErr;
    const user = userData.user;
    if (!user?.email) throw new Error("Not authenticated");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      await supabase.from("megatalent_vip_viewers").upsert(
        { user_id: user.id, status: "inactive" },
        { onConflict: "user_id" },
      );
      return new Response(JSON.stringify({ is_vip: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });
    const vipSub = subs.data.find((s) =>
      s.items.data.some((i) =>
        (i.price.product as any)?.toString?.().length > 0
          ? (i.price.nickname?.includes("VIP") ||
            (typeof i.price.product === "string" &&
              s.metadata?.kind === "megatalent_vip_viewer"))
          : false,
      ) ||
      s.metadata?.kind === "megatalent_vip_viewer"
    ) ?? subs.data[0]; // fallback: any active sub created via our checkout uses metadata

    const isVip = !!vipSub && vipSub.status === "active";
    const periodEnd = vipSub
      ? new Date(vipSub.current_period_end * 1000).toISOString()
      : null;

    await supabase.from("megatalent_vip_viewers").upsert(
      {
        user_id: user.id,
        status: isVip ? "active" : "inactive",
        stripe_customer_id: customerId,
        stripe_subscription_id: vipSub?.id ?? null,
        current_period_end: periodEnd,
      },
      { onConflict: "user_id" },
    );

    return new Response(
      JSON.stringify({ is_vip: isVip, current_period_end: periodEnd }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
