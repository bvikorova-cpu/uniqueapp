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

  const authHeader = req.headers.get("Authorization");
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader! } } }
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { streamId } = await req.json();
    if (!streamId) throw new Error("Missing streamId");

    // Get stream details
    const { data: stream, error: streamError } = await supabaseClient
      .from("creator_live_streams")
      .select("*")
      .eq("id", streamId)
      .single();

    if (streamError || !stream) throw new Error("Stream not found");
    if (stream.is_free) throw new Error("This stream is free");

    const platformFee = stream.access_price * 0.1;
    const creatorPayout = stream.access_price - platformFee;

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
              name: `Live Stream Access: ${stream.title}`,
              description: stream.description || "Exclusive live stream access",
            },
            unit_amount: Math.round(stream.access_price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/creator/${stream.creator_id}?stream=success`,
      cancel_url: `${req.headers.get("origin")}/creator/${stream.creator_id}?stream=canceled`,
      metadata: {
        type: "stream_access",
        user_id: user.id,
        stream_id: streamId,
        creator_id: stream.creator_id,
        platform_fee: platformFee.toString(),
        creator_payout: creatorPayout.toString(),
      },
    });

    // Create pending access record
    await supabaseClient.from("creator_live_stream_access").insert({
      stream_id: streamId,
      user_id: user.id,
      amount_paid: stream.access_price,
      platform_fee: platformFee,
      creator_payout: creatorPayout,
      stripe_session_id: session.id,
    });

    console.log(`[STREAM-ACCESS] Created checkout for user ${user.id} for stream ${streamId}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[STREAM-ACCESS] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
