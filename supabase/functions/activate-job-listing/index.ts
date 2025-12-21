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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { jobId, sessionId } = await req.json();

    if (!jobId || !sessionId) {
      throw new Error("Missing jobId or sessionId");
    }

    // Verify payment with Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Get payment details from metadata
    const durationDays = parseInt(session.metadata?.duration_days || "0");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    // Update job listing to active
    const { error: jobError } = await supabaseClient
      .from("job_listings")
      .update({ is_active: true })
      .eq("id", jobId)
      .eq("employer_id", user.id);

    if (jobError) throw jobError;

    // Update or create payment record
    const { error: paymentError } = await supabaseClient
      .from("job_listing_payments")
      .upsert({
        job_id: jobId,
        user_id: user.id,
        stripe_session_id: sessionId,
        amount: (session.amount_total || 0) / 100,
        duration_days: durationDays,
        expires_at: expiresAt.toISOString(),
        status: "completed",
      });

    if (paymentError) throw paymentError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Job listing activated successfully",
        expires_at: expiresAt.toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Activate job listing error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
