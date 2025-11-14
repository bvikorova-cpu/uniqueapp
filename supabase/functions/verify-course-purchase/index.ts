import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { sessionId } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const { courseId, userId, instructorAmount, platformFee } = session.metadata!;

      // Get course details
      const { data: course } = await supabaseClient
        .from("courses")
        .select("price")
        .eq("id", courseId)
        .single();

      // Record the purchase
      const { error: purchaseError } = await supabaseClient
        .from("course_purchases")
        .insert({
          course_id: courseId,
          user_id: userId,
          amount: course?.price || 0,
          instructor_amount: parseFloat(instructorAmount),
          platform_fee: parseFloat(platformFee),
          stripe_payment_id: session.payment_intent as string,
          status: "completed",
        });

      if (purchaseError) throw purchaseError;

      // Create enrollment record
      await supabaseClient
        .from("course_enrollments")
        .insert({
          course_id: courseId,
          user_id: userId,
        });

      return new Response(
        JSON.stringify({ success: true, message: "Purchase verified and recorded" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Payment not completed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
