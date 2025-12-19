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
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature!,
        Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
      );
    } catch (err: any) {
      console.error("[STOCK-WEBHOOK] Webhook signature verification failed:", err.message);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: corsHeaders,
      });
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

      // Create download record
      const { error: downloadError } = await supabaseClient
        .from("stock_content_downloads")
        .insert({
          content_id: contentId,
          buyer_id: buyerId !== "guest" ? buyerId : null,
          buyer_email: session.customer_email || session.customer_details?.email,
          price_paid_eur: pricePaid,
          platform_fee_eur: platformFee,
          creator_earning_eur: creatorEarning,
          stripe_payment_id: session.payment_intent as string,
          download_url: content.file_url,
        });

      if (downloadError) {
        console.error("[STOCK-WEBHOOK] Error creating download record:", downloadError);
      } else {
        console.log("[STOCK-WEBHOOK] Download record created");
      }

      // Update content stats
      const { error: updateError } = await supabaseClient
        .from("stock_content_items")
        .update({
          total_downloads: (content.total_downloads || 0) + 1,
          total_revenue_eur: (parseFloat(content.total_revenue_eur) || 0) + pricePaid,
        })
        .eq("id", contentId);

      if (updateError) {
        console.error("[STOCK-WEBHOOK] Error updating content stats:", updateError);
      } else {
        console.log("[STOCK-WEBHOOK] Content stats updated");
      }

      // Update or create creator earnings
      const { data: existingEarnings } = await supabaseClient
        .from("stock_content_earnings")
        .select("*")
        .eq("creator_id", creatorId)
        .single();

      if (existingEarnings) {
        await supabaseClient
          .from("stock_content_earnings")
          .update({
            total_earnings_eur: (parseFloat(existingEarnings.total_earnings_eur) || 0) + creatorEarning,
            total_downloads: (existingEarnings.total_downloads || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("creator_id", creatorId);
      } else {
        await supabaseClient
          .from("stock_content_earnings")
          .insert({
            creator_id: creatorId,
            total_earnings_eur: creatorEarning,
            total_downloads: 1,
            pending_payout_eur: creatorEarning,
          });
      }

      console.log("[STOCK-WEBHOOK] Creator earnings updated");
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
