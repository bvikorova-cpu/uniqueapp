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

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  try {
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { sessionId } = await req.json();
    if (!sessionId || typeof sessionId !== "string") {
      return new Response(JSON.stringify({ error: "sessionId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid" || session.status === "complete") {
      const serviceType = session.metadata?.service_type || "";
      const purchaseType = session.mode === "subscription" ? "subscription" : "one_time";
      
      let expiresAt = null;
      if (session.mode === "subscription") {
        expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      const { data: existing } = await supabaseClient
        .from("confession_purchases")
        .select("*")
        .eq("user_id", user.id)
        .eq("service_type", serviceType)
        .single();

      if (!existing) {
        await supabaseClient.from("confession_purchases").insert({
          user_id: user.id,
          service_type: serviceType,
          purchase_type: purchaseType,
          stripe_session_id: sessionId,
          stripe_subscription_id: session.subscription as string || null,
          status: "active",
          expires_at: expiresAt,
        });
      }

      // Add absolution tokens if purchased
      if (serviceType === "absolution_tokens") {
        const { data: tokenData } = await supabaseClient
          .from("absolution_tokens")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (tokenData) {
          await supabaseClient
            .from("absolution_tokens")
            .update({
              tokens_remaining: tokenData.tokens_remaining + 10,
              tokens_purchased: tokenData.tokens_purchased + 10,
            })
            .eq("user_id", user.id);
        } else {
          await supabaseClient.from("absolution_tokens").insert({
            user_id: user.id,
            tokens_remaining: 10,
            tokens_purchased: 10,
          });
        }
      }

      return new Response(
        JSON.stringify({ success: true, serviceType, purchaseType }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Payment not completed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});