import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, data?: unknown) => {
  console.log(`[STOCK-SALE-FINALIZE] ${step}${data ? ` - ${JSON.stringify(data)}` : ""}`);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const db = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.json().catch(() => ({}));
    const sessionId: string | undefined = body?.session_id;

    // Identify the caller (optional — a Stripe redirect may return before the
    // session is restored, in which case we fall back to the payment record).
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const anon = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } }
      );
      const { data } = await anon.auth.getUser();
      userId = data.user?.id ?? null;
    }

    // Collect verified, paid stock purchases that have no sale record yet.
    let query = db
      .from("payment_records")
      .select("id, user_id, metadata, amount_cents, stripe_session_id, stripe_payment_intent_id")
      .eq("product_type", "stock_content_purchase")
      .eq("status", "paid")
      .not("verified_at", "is", null);

    if (sessionId) query = query.eq("stripe_session_id", sessionId);
    else if (userId) query = query.eq("user_id", userId);
    else return new Response(JSON.stringify({ finalized: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: records, error: recErr } = await query;
    if (recErr) throw recErr;

    let finalized = 0;

    for (const rec of records ?? []) {
      const md = (rec.metadata ?? {}) as Record<string, string>;
      const contentId = md.content_id;
      const buyerId = rec.user_id ?? md.user_id ?? null;
      if (!contentId || !buyerId) continue;

      const { data: existing } = await db
        .from("stock_content_sales")
        .select("id")
        .eq("buyer_id", buyerId)
        .eq("content_id", contentId)
        .maybeSingle();
      if (existing) continue;

      const { data: item } = await db
        .from("stock_content_items")
        .select("id, title, creator_id, total_revenue_eur")
        .eq("id", contentId)
        .maybeSingle();
      if (!item) continue;

      const total = parseFloat(md.total_eur ?? "0") || (rec.amount_cents ?? 0) / 100;
      const creatorEarning = Math.round(total * 0.7 * 100) / 100;
      const platformFee = Math.round((total - creatorEarning) * 100) / 100;

      const { error: saleErr } = await db.from("stock_content_sales").insert({
        content_id: item.id,
        creator_id: item.creator_id,
        buyer_id: buyerId,
        license_type: md.license_type ?? "standard",
        resolution: md.resolution ?? "original",
        amount_paid: total,
        creator_earning: creatorEarning,
        platform_fee: platformFee,
        status: "completed",
        stripe_payment_intent_id: rec.stripe_payment_intent_id ?? null,
        stripe_session_id: rec.stripe_session_id ?? null,
      });
      if (saleErr) {
        log("sale insert error", saleErr.message);
        continue;
      }

      await db
        .from("stock_content_items")
        .update({ total_revenue_eur: Number(item.total_revenue_eur ?? 0) + total })
        .eq("id", item.id);

      if (item.creator_id) {
        const { data: wallet } = await db
          .from("wallet_balances")
          .select("id, balance")
          .eq("user_id", item.creator_id)
          .eq("currency", "EUR")
          .maybeSingle();
        if (wallet) {
          await db
            .from("wallet_balances")
            .update({ balance: Number(wallet.balance ?? 0) + creatorEarning, updated_at: new Date().toISOString() })
            .eq("id", wallet.id);
        } else {
          await db.from("wallet_balances").insert({ user_id: item.creator_id, currency: "EUR", balance: creatorEarning });
        }

        const { error: notifErr } = await db.from("notifications").insert({
          user_id: item.creator_id,
          type: "stock_content_sale",
          title: "Your content was sold! 🎉",
          message: `"${item.title ?? "Your asset"}" sold for €${total.toFixed(2)} — €${creatorEarning.toFixed(2)} (70%) was added to your wallet.`,
          action_url: "/stock-content-library",
          related_id: item.id,
          metadata: { content_id: item.id, amount_paid: total, creator_earning: creatorEarning },
        });
        if (notifErr) log("notification insert error", notifErr.message);
      }

      finalized++;
    }

    log("done", { finalized });
    return new Response(JSON.stringify({ finalized }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
