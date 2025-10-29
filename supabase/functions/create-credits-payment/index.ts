import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Price IDs for AI credit packages
const PRICE_IDS: Record<number, string> = {
  10: "price_1SNWmYGaXSfGtYFtgR2wXu30",  // Starter Pack - 5€
  25: "price_1SNXEEGaXSfGtYFtKVBtcOQt",  // Basic Pack - 10€
  60: "price_1SNWnCGaXSfGtYFtfBoQasS1",  // Pro Pack - 20€
  150: "price_1SNWvvGaXSfGtYFtOjleqjGS", // Ultimate Pack - 40€
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
    console.log("Starting AI credits payment creation");
    
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    console.log("User authenticated:", user.id);

    const { credits, price } = await req.json();

    if (!credits) {
      throw new Error("Credits amount is required");
    }

    if (!PRICE_IDS[credits]) {
      throw new Error(`Invalid credit amount: ${credits}. Available amounts: 10, 25, 60, 150`);
    }

    console.log("Creating checkout for credits:", credits);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Found existing customer:", customerId);
    } else {
      console.log("No existing customer found, will create new one in checkout");
    }

    // Create a payment link instead of checkout session
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: PRICE_IDS[credits],
          quantity: 1,
        },
      ],
      after_completion: {
        type: "redirect",
        redirect: {
          url: `${req.headers.get("origin")}/ai-credits?payment=success&user_id=${user.id}&credits=${credits}`,
        },
      },
      metadata: {
        user_id: user.id,
        credits: credits.toString(),
        type: "ai_credits",
      },
    });

    console.log("Payment link created:", paymentLink.id, "URL:", paymentLink.url);

    return new Response(JSON.stringify({ url: paymentLink.url, payment_link_id: paymentLink.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("AI credits payment error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
