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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Authenticate user first
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Authentication failed");
    }

    const { session_id } = await req.json();

    // Validate session_id format
    if (!session_id || typeof session_id !== 'string' || !session_id.startsWith('cs_')) {
      throw new Error("Invalid session_id format");
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

    // Verify the session belongs to the authenticated user
    if (user_id !== user.id) {
      throw new Error("Session does not belong to authenticated user");
    }

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