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

      const { user_id, feature } = session.metadata as {
        user_id: string;
        feature: string;
      };

      // Map feature names to service types (Holographic Avatars)
      const serviceTypeMap: Record<string, string> = {
        'Premium AI Avatar': 'premium_ai_avatar',
        'Basic Customization': 'basic_customization',
        'Advanced Customization': 'advanced_customization',
        'Avatar Battle Entry': 'battle_entry',
        'Avatar Breeding': 'breeding'
      };

      const serviceType = serviceTypeMap[feature] || feature.toLowerCase().replace(/\s+/g, '_');

      const { error } = await supabaseClient
        .from("holographic_purchases")
        .insert({
          user_id,
          service_type: serviceType,
          stripe_session_id: sessionId,
          status: "active",
          expires_at: null,
        });

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true, serviceType }),
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
