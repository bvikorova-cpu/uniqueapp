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
    
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    const { contentId, contentType, title, price } = await req.json();
    
    if (!contentId || !contentType || !title || !price) {
      throw new Error("Missing required fields");
    }

    // Check if already purchased
    const { data: existing } = await supabaseClient
      .from('purchased_learning_content')
      .select('id')
      .eq('user_id', user.id)
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "You have already purchased this content" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Map content types to their proper routes
    const routeMap: Record<string, string> = {
      'writing-workshop': 'creative-writing',
      'language-program': 'language-learning',
      'fitness-program': 'fitness-wellness',
      'marketing-course': 'digital-marketing',
      'photography-masterclass': 'photography',
      'culinary-program': 'culinary-arts',
      'music-course': 'music-production',
      'design-training': 'graphic-design',
      'speaking-academy': 'public-speaking',
      'investment-education': 'financial-investment',
      'certification': 'certification-programs',
      'masterclass': 'masterclasses',
      'workshop': 'interactive-workshops',
      'course': 'premium-courses'
    };

    const baseRoute = routeMap[contentType] || contentType;

    // Get origin with fallback
    const origin = req.headers.get("origin") || "https://3ea492b4-277a-4b1d-a6dd-ca2a3efd9225.lovableproject.com";
    console.log("Creating payment session:", { contentType, baseRoute, origin, title, price });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: title,
              description: `${contentType} - ${title}`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/${baseRoute}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${baseRoute}`,
      metadata: {
        user_id: user.id,
        content_id: contentId,
        content_type: contentType,
        title: title,
      },
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating payment session:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});