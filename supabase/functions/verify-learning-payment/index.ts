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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { session_id } = await req.json();

    if (!session_id) {
      throw new Error("Missing session_id");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ error: "Payment not completed" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { user_id, content_id, content_type, title } = session.metadata;

    // Check if already recorded
    const { data: existing } = await supabaseClient
      .from('purchased_learning_content')
      .select('id')
      .eq('user_id', user_id)
      .eq('content_id', content_id)
      .eq('content_type', content_type)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ success: true, message: "Already recorded" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Record purchase
    const { error: purchaseError } = await supabaseClient
      .from('purchased_learning_content')
      .insert({
        user_id,
        content_id,
        content_type,
        title,
        price: (session.amount_total || 0) / 100,
        stripe_session_id: session_id,
        status: 'active',
      });

    if (purchaseError) throw purchaseError;

    // Initialize progress
    const { error: progressError } = await supabaseClient
      .from('learning_progress')
      .insert({
        user_id,
        content_id,
        content_type,
        progress_percentage: 0,
        current_module: 0,
      });

    if (progressError) {
      console.error("Progress initialization error:", progressError);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Purchase recorded successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});