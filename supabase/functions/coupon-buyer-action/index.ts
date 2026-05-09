// Coupon Marketplace — buyer actions: confirm receipt, report problem, leave review.
// Action: 'confirm' releases escrow early. 'dispute' freezes auto-release. 'review' inserts/updates rating.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("Login required");
    const token = auth.replace("Bearer ", "");

    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: u } = await supa.auth.getUser(token);
    const user = u?.user;
    if (!user) throw new Error("Invalid session");

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "");
    const orderId = String(body?.orderId || body?.order_id || "");
    if (!orderId) throw new Error("Missing orderId");

    const { data: order, error: oErr } = await supa
      .from("coupon_orders")
      .select("id, buyer_id, seller_id, status, escrow_status")
      .eq("id", orderId)
      .maybeSingle();
    if (oErr || !order) throw new Error("Order not found");
    if (order.buyer_id !== user.id) throw new Error("Not your order");
    if (order.status !== "completed") throw new Error("Order not completed yet");

    if (action === "confirm") {
      await supa.from("coupon_orders").update({
        escrow_status: "released",
        buyer_confirmed_at: new Date().toISOString(),
        released_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", orderId);
      return json({ ok: true, escrow_status: "released" });
    }

    if (action === "dispute") {
      const reason = String(body?.reason || "").slice(0, 1000);
      if (!reason) throw new Error("Reason required");
      await supa.from("coupon_orders").update({
        escrow_status: "disputed",
        buyer_disputed_at: new Date().toISOString(),
        dispute_reason: reason,
        updated_at: new Date().toISOString(),
      }).eq("id", orderId);
      return json({ ok: true, escrow_status: "disputed" });
    }

    if (action === "review") {
      const rating = Number(body?.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Invalid rating");
      const comment = String(body?.comment || "").slice(0, 500) || null;
      const { error: rErr } = await supa.from("coupon_buyer_reviews").upsert({
        order_id: orderId,
        buyer_id: user.id,
        seller_id: order.seller_id,
        rating,
        comment,
        updated_at: new Date().toISOString(),
      }, { onConflict: "order_id" });
      if (rErr) throw rErr;
      return json({ ok: true, rating });
    }

    throw new Error("Unknown action");
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 400);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
