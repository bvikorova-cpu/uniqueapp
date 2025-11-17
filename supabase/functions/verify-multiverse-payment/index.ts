import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const { user_id, service_type } = session.metadata as {
        user_id: string;
        service_type: string;
      };

      const isSubscription = service_type === "reality_jumping" || service_type === "best_self_selection";
      const expiresAt = isSubscription ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;

      const { error } = await supabaseClient
        .from("multiverse_purchases")
        .insert({
          user_id,
          service_type,
          stripe_session_id: sessionId,
          stripe_subscription_id: session.subscription as string,
          status: "active",
          expires_at: expiresAt,
        });

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true, serviceType: service_type }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Payment not completed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
