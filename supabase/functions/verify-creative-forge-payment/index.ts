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

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { sessionId, credits } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Check if already processed
    const { data: existing } = await supabase
      .from("creative_forge_credits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const creditsToAdd = parseInt(credits);

    if (existing) {
      const { error: updateError } = await supabase
        .from("creative_forge_credits")
        .update({
          credits_remaining: existing.credits_remaining + creditsToAdd,
          total_credits_purchased: existing.total_credits_purchased + creditsToAdd,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from("creative_forge_credits")
        .insert({
          user_id: user.id,
          credits_remaining: creditsToAdd,
          total_credits_purchased: creditsToAdd,
        });

      if (insertError) throw insertError;
    }

    console.log(`Added ${creditsToAdd} credits to user ${user.id}`);

    return new Response(JSON.stringify({ success: true, creditsAdded: creditsToAdd }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
