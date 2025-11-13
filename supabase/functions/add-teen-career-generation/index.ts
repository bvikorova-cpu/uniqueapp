import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { session_id } = await req.json();

    if (!session_id) {
      throw new Error("session_id is required");
    }

    // Verify the Stripe session
    const Stripe = (await import("https://esm.sh/stripe@18.5.0")).default;
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const userId = session.metadata?.user_id;
    if (!userId) {
      throw new Error("User ID not found in session metadata");
    }

    // Get or create usage record
    let { data: usage, error } = await supabaseClient
      .from("teen_career_counselor_usage")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code === "PGRST116") {
      // Create new record
      const { data: newUsage, error: insertError } = await supabaseClient
        .from("teen_career_counselor_usage")
        .insert({ user_id: userId, paid_generations: 1 })
        .select()
        .single();

      if (insertError) throw insertError;
      usage = newUsage;
    } else if (error) {
      throw error;
    } else {
      // Update existing record
      const { error: updateError } = await supabaseClient
        .from("teen_career_counselor_usage")
        .update({ paid_generations: usage.paid_generations + 1 })
        .eq("user_id", userId);

      if (updateError) throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, message: "Generation added successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
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
