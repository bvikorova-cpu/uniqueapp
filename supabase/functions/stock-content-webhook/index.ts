import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Admin user ID - set this in Supabase secrets
const ADMIN_USER_ID = Deno.env.get("ADMIN_USER_ID") || "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    
    let event: Stripe.Event;
    
    // Try to verify signature if webhook secret is set
    const webhookSecret = Deno.env.get("STRIPE_STOCK_WEBHOOK_SECRET");
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: any) {
        console.error("[STOCK-WEBHOOK] Webhook signature verification failed:", err.message);
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          headers: corsHeaders,
        });
      }
    } else {
      // For testing without webhook secret
      event = JSON.parse(body);
    }

    console.log("[STOCK-WEBHOOK] Event received:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Check if this is a stock content purchase
      const contentId = session.metadata?.contentId;
      if (!contentId) {
        console.log("[STOCK-WEBHOOK] Not a stock content purchase, skipping");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("[STOCK-WEBHOOK] Processing stock content purchase:", contentId);

      const buyerId = session.metadata?.buyerId;
      const creatorId = session.metadata?.creatorId;
      const platformFee = parseFloat(session.metadata?.platformFee || "0");
      const creatorEarning = parseFloat(session.metadata?.creatorEarning || "0");
      const pricePaid = platformFee + creatorEarning;

      // Get content details
      const { data: content, error: contentError } = await supabaseClient
        .from("stock_content_items")
        .select("*")
        .eq("id", contentId)
        .single();

      if (contentError || !content) {
        console.error("[STOCK-WEBHOOK] Content not found:", contentError);
        return new Response(JSON.stringify({ error: "Content not found" }), {
          status: 404,
          headers: corsHeaders,
        });
      }

      // Record the sale
      const { error: saleError } = await supabaseClient
        .from("stock_content_sales")
        .insert({
          content_id: contentId,
          buyer_id: buyerId !== "guest" ? buyerId : null,
          buyer_email: session.customer_email || session.customer_details?.email,
          creator_id: creatorId,
          amount_paid: pricePaid,
          platform_fee: platformFee,
          creator_earning: creatorEarning,
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          status: "completed",
        });

      if (saleError) {
        console.error("[STOCK-WEBHOOK] Error recording sale:", saleError);
      } else {
        console.log("[STOCK-WEBHOOK] Sale recorded");
      }

      // Create download record
      const { error: downloadError } = await supabaseClient
        .from("stock_content_downloads")
        .insert({
          content_id: contentId,
          buyer_id: buyerId !== "guest" ? buyerId : null,
          buyer_email: session.customer_email || session.customer_details?.email,
          download_url: content.file_url,
          stripe_session_id: session.id,
        });

      if (downloadError) {
        console.error("[STOCK-WEBHOOK] Error creating download record:", downloadError);
      } else {
        console.log("[STOCK-WEBHOOK] Download record created");
      }

      // Update content download count
      await supabaseClient
        .from("stock_content_items")
        .update({
          download_count: (content.download_count || 0) + 1,
        })
        .eq("id", contentId);

      // Update or create creator earnings
      const { data: existingEarnings } = await supabaseClient
        .from("stock_creator_earnings")
        .select("*")
        .eq("creator_id", creatorId)
        .single();

      if (existingEarnings) {
        await supabaseClient
          .from("stock_creator_earnings")
          .update({
            total_earnings: parseFloat(existingEarnings.total_earnings) + creatorEarning,
            pending_balance: parseFloat(existingEarnings.pending_balance) + creatorEarning,
          })
          .eq("creator_id", creatorId);
      } else {
        await supabaseClient
          .from("stock_creator_earnings")
          .insert({
            creator_id: creatorId,
            total_earnings: creatorEarning,
            pending_balance: creatorEarning,
          });
      }

      console.log("[STOCK-WEBHOOK] Creator earnings updated");

      // Create notification for creator
      await supabaseClient
        .from("stock_notifications")
        .insert({
          user_id: creatorId,
          type: "sale",
          title: "Nový predaj!",
          message: `Váš obsah "${content.title}" bol predaný za €${pricePaid.toFixed(2)}. Zarobili ste €${creatorEarning.toFixed(2)}.`,
          related_id: contentId,
        });

      console.log("[STOCK-WEBHOOK] Creator notification sent");
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[STOCK-WEBHOOK] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
