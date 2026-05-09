import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { createEscrowHold } from "../_shared/escrow.ts";

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
    if (!authHeader) return json({ verified: false, error: "Not authenticated" }, 401);

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseAuth.auth.getUser(token);
    if (!user) return json({ verified: false, error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const sessionId: string | undefined = body.sessionId || body.session_id;
    const orderId: string | undefined = body.orderId || body.order_id;
    if (!sessionId || !orderId) return json({ verified: false, error: "Missing sessionId/orderId" }, 400);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid" || session.status === "complete";

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: order, error: orderErr } = await admin
      .from("bazaar_orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();
    if (orderErr || !order) return json({ verified: false, error: "Order not found" }, 404);
    if (order.buyer_id !== user.id) return json({ verified: false, error: "Not your order" }, 403);

    if (!paid) {
      return json({ verified: false, status: session.status, payment_status: session.payment_status });
    }

    // Idempotent: only update once
    if (order.status === "pending") {
      await admin
        .from("bazaar_orders")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          stripe_session_id: sessionId,
          escrow_status: "held",
        })
        .eq("id", orderId);

      // Mark item sold
      await admin
        .from("bazaar_items")
        .update({ is_sold: true })
        .eq("id", order.item_id);

      // Create escrow hold (idempotent guard via try/catch)
      try {
        await createEscrowHold(
          admin,
          orderId,
          Number(order.amount),
          Number(order.commission_amount),
          Number(order.seller_payout)
        );
      } catch (e) {
        console.warn("[verify-bazaar-order-payment] escrow hold issue", e);
      }
    }

    return json({ verified: true, order_id: orderId });
  } catch (e) {
    console.error("[verify-bazaar-order-payment] error", e);
    return json({ verified: false, error: e instanceof Error ? e.message : "Verify failed" }, 500);
  }
});
