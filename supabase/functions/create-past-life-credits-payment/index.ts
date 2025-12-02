import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Real Stripe price IDs
const PRICE_IDS: Record<number, string> = {
  10: "price_1SZqDYGaXSfGtYFtP6tnbmZN",
  25: "price_1SZqDZGaXSfGtYFtgBUlUOUP",
  50: "price_1SZqDZGaXSfGtYFtwd3jZYKi",
  100: "price_1SZqDaGaXSfGtYFtoreXGegM",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { credits } = await req.json();

    if (!PRICE_IDS[credits]) {
      throw new Error('Invalid credit amount');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: PRICE_IDS[credits],
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/past-life?payment=success&credits=${credits}`,
      cancel_url: `${req.headers.get('origin')}/past-life?payment=cancelled`,
      metadata: {
        credits: credits.toString(),
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error creating payment session:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});