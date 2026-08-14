import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data } = await admin.auth.getUser(token);
    const user = data.user;
    if (!user?.id) throw new Error("not_authenticated");

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("session_id_required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // ── Comedy show ticket (real money, EUR) ──
    if (session.metadata?.type === "comedy_ticket") {
      if (session.payment_status !== "paid") {
        return new Response(
          JSON.stringify({ status: session.payment_status, activated: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
      const md = session.metadata as Record<string, string>;
      const showId = md.showId;
      const ticketUserId = md.user_id || user.id;
      const amount = Number(md.amount ?? 0);
      const comedianAmount = Number(md.comedianAmount ?? 0);
      const platformCommission = Number(md.platformCommission ?? 0);
      if (!showId) throw new Error("session_metadata_incomplete");

      const { data: existingTicket } = await admin
        .from("comedy_tickets")
        .select("id")
        .eq("user_id", ticketUserId)
        .eq("show_id", showId)
        .maybeSingle();

      if (existingTicket) {
        return new Response(
          JSON.stringify({ status: "paid", activated: true, ticketId: existingTicket.id }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      const { data: ticket, error: insertErr } = await admin
        .from("comedy_tickets")
        .insert({ show_id: showId, user_id: ticketUserId, price_paid: amount })
        .select("id")
        .single();
      if (insertErr) throw insertErr;

      const { data: show } = await admin
        .from("comedy_shows")
        .select("total_revenue, comedian_id")
        .eq("id", showId)
        .maybeSingle();
      if (show) {
        await admin
          .from("comedy_shows")
          .update({ total_revenue: Number((show as any).total_revenue ?? 0) + amount })
          .eq("id", showId);

        const { data: comedian } = await admin
          .from("comedian_profiles")
          .select("total_earnings")
          .eq("id", (show as any).comedian_id)
          .maybeSingle();
        if (comedian) {
          await admin
            .from("comedian_profiles")
            .update({ total_earnings: Number((comedian as any).total_earnings ?? 0) + comedianAmount })
            .eq("id", (show as any).comedian_id);
        }

        const comedianId = String((show as any).comedian_id);
        await admin.from("comedian_earnings").insert({
          comedian_id: comedianId,
          amount_coins: Math.round(amount * 100),
          source_type: "ticket",
          source_id: showId,
          description: "Comedy show ticket",
          commission_rate: 20,
          platform_commission: platformCommission,
          net_amount: comedianAmount,
          pending_payout: comedianAmount,
        });

        await admin.from("comedy_platform_earnings").insert({
          comedian_id: comedianId,
          transaction_type: "ticket",
          total_amount: amount,
          comedian_amount: comedianAmount,
          platform_commission: platformCommission,
          commission_rate: 20,
          related_id: showId,
          status: "pending",
        });
      }

      return new Response(
        JSON.stringify({ status: "paid", activated: true, ticketId: ticket.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (session.payment_status !== "paid" || session.metadata?.user_id !== user.id) {
      return new Response(
        JSON.stringify({ success: false, message: "Payment not completed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const coins = parseInt(session.metadata?.coins || "100", 10);

    // Idempotency: don't credit the same session twice
    const { data: existing } = await admin
      .from("comedy_coin_purchases")
      .select("id")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (!existing) { await admin.from("comedy_coin_purchases").insert({
        user_id: user.id,
        stripe_session_id: sessionId,
        coins,
        amount_cents: session.amount_total ?? 0 });

      // Atomic credit (correct column name + adds to existing balance)
      const { error: rpcErr } = await admin.rpc("add_comedy_coins", { _user_id: user.id,
        _amount: coins,
        _purchased: true });
      if (rpcErr) throw rpcErr;
    }

    return new Response(
      JSON.stringify({ success: true, coins }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500 });
  }
});
