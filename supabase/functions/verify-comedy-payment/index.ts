import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

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

    if (!existing) {
      await admin.from("comedy_coin_purchases").insert({
        user_id: user.id,
        stripe_session_id: sessionId,
        coins,
        amount_cents: session.amount_total ?? 0,
      });

      // Atomic credit (correct column name + adds to existing balance)
      const { error: rpcErr } = await admin.rpc("add_comedy_coins", {
        _user_id: user.id,
        _amount: coins,
        _purchased: true,
      });
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
      status: 500,
    });
  }
});
