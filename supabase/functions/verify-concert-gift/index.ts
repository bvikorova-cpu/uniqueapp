// Verify Stripe session for a concert gift and mark sent_platform_gifts as completed.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Missing sessionId");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const { data: giftPayment } = await admin.from("sent_platform_gifts")
      .select("id, status, amount, context_type, context_id")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    await admin.from("sent_platform_gifts")
      .update({ status: paid ? "completed" : "failed" })
      .eq("stripe_session_id", sessionId);

    if (paid && giftPayment?.context_type === "comedy" && giftPayment.status !== "completed") {
      const gross = Number(giftPayment.amount || 0);
      const platformCommission = Number((gross * 0.2).toFixed(2));
      const comedianAmount = Number((gross - platformCommission).toFixed(2));
      const { data: show } = await admin
        .from("comedy_shows")
        .select("comedian_id")
        .eq("id", giftPayment.context_id)
        .maybeSingle();

      if (show?.comedian_id) {
        await admin.from("comedian_earnings").insert({
          comedian_id: show.comedian_id,
          amount_coins: Math.round(gross * 100),
          source_type: "gift",
          source_id: giftPayment.id,
          description: "Comedy live gift",
          commission_rate: 20,
          platform_commission: platformCommission,
          net_amount: comedianAmount,
          pending_payout: comedianAmount,
        });

        await admin.from("comedy_platform_earnings").insert({
          comedian_id: show.comedian_id,
          transaction_type: "gift",
          total_amount: gross,
          comedian_amount: comedianAmount,
          platform_commission: platformCommission,
          commission_rate: 20,
          related_id: giftPayment.id,
          status: "pending",
        });
      }
    }

    return new Response(JSON.stringify({ paid }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});
