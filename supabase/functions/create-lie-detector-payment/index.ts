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
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { credits } = await req.json();
    
    // Global Credit Packages - shared across CreativeForge and Lie Detector
    const validCredits = [30, 75, 150, 400];
    if (!credits || !validCredits.includes(credits)) {
      throw new Error("Invalid credit package");
    }

    // Determine price based on credits - aligned with CreativeForge
    const priceMap: Record<number, { amount: number; description: string }> = {
      30: { amount: 800, description: "Starter Package - 30 Credits" },
      75: { amount: 1800, description: "Creator Package - 75 Credits" },
      150: { amount: 3200, description: "Professional Package - 150 Credits (Most Popular)" },
      400: { amount: 7500, description: "Studio Package - 400 Credits (Best Value)" },
    };

    const priceInfo = priceMap[credits];

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: priceInfo.description,
              description: `${credits} credits for Lie Detector Chat analysis`,
            },
            unit_amount: priceInfo.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/lie-detector?payment=success`,
      cancel_url: `${req.headers.get("origin")}/lie-detector?payment=cancelled`,
      metadata: {
        user_id: user.id,
        credits: credits.toString(),
        type: "lie_detector_credits",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});