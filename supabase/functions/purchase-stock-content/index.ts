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
    const { contentId } = await req.json();
    
    if (!contentId) {
      throw new Error("Content ID is required");
    }

    console.log("[PURCHASE-STOCK] Starting purchase for content:", contentId);

    // Get user if authenticated
    let userId = null;
    let userEmail = null;
    const authHeader = req.headers.get("Authorization");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      authHeader ? { global: { headers: { Authorization: authHeader } } } : {}
    );

    if (authHeader) {
      const { data } = await supabaseClient.auth.getUser();
      userId = data.user?.id || null;
      userEmail = data.user?.email || null;
      console.log("[PURCHASE-STOCK] User authenticated:", userId);
    }

    // Get content details
    const { data: content, error: contentError } = await supabaseClient
      .from("stock_content_items")
      .select("*")
      .eq("id", contentId)
      .single();

    if (contentError || !content) {
      throw new Error("Content not found");
    }

    console.log("[PURCHASE-STOCK] Content found:", content.title, "Price:", content.price_eur);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    let customerId;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // Calculate fees (30% platform, 70% creator)
    const priceEur = parseFloat(content.price_eur);
    const platformFee = priceEur * 0.30;
    const creatorEarning = priceEur * 0.70;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: content.title,
              description: content.description || undefined,
              images: content.thumbnail_url ? [content.thumbnail_url] : undefined,
            },
            unit_amount: Math.round(priceEur * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/stock-content-library?purchase=success&content=${contentId}`,
      cancel_url: `${req.headers.get("origin")}/stock-content-library?purchase=cancelled`,
      metadata: {
        contentId,
        creatorId: content.creator_id,
        platformFee: platformFee.toFixed(2),
        creatorEarning: creatorEarning.toFixed(2),
        buyerId: userId || "guest",
      },
    });

    console.log("[PURCHASE-STOCK] Checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[PURCHASE-STOCK] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
