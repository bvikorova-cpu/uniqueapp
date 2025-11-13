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
    
    if (!sessionId) {
      throw new Error("Missing session_id");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Verify the payment session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const userId = session.metadata?.user_id;
    const courseId = session.metadata?.course_id;

    if (!userId || !courseId) {
      throw new Error("Missing user_id or course_id in session metadata");
    }

    // Use service role to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create enrollment
    const { error: enrollError } = await supabaseClient
      .from("user_course_enrollments")
      .insert({
        user_id: userId,
        course_id: courseId,
      });

    if (enrollError) throw enrollError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
