import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CanvasPrintRequest {
  userId: string;
  userEmail: string;
  userName: string;
  orderId: string;
  imageUrl: string;
  generatedArtUrl?: string;
  tier: string;
  paymentAmount: number;
  shippingAddress?: {
    name: string;
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[CANVAS-PRINT] Starting admin notification...");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const {
      userId,
      userEmail,
      userName,
      orderId,
      imageUrl,
      generatedArtUrl,
      tier,
      paymentAmount,
      shippingAddress,
    }: CanvasPrintRequest = await req.json();

    console.log("[CANVAS-PRINT] Order details:", { orderId, tier, paymentAmount });

    // Check if RESEND_API_KEY is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("[CANVAS-PRINT] RESEND_API_KEY not configured, logging order instead");
      
      // Save order to database for manual processing
      const { error: insertError } = await supabaseClient
        .from("canvas_print_orders")
        .insert({
          user_id: userId,
          user_email: userEmail,
          user_name: userName,
          order_id: orderId,
          original_image_url: imageUrl,
          generated_art_url: generatedArtUrl,
          tier,
          payment_amount: paymentAmount,
          shipping_address: shippingAddress,
          status: "pending_fulfillment",
          email_sent: false,
        });

      if (insertError) {
        console.error("[CANVAS-PRINT] Database insert error:", insertError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Order saved for manual processing (email not configured)",
          orderId 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate Renaissance-style art description
    const artDescription = tier === "art_print" 
      ? "Renaissance-style portrait on 50x70cm canvas with museum-quality framing"
      : `${tier} tier portrait`;

    // Send email to admin using fetch
    const adminEmailAddress = Deno.env.get("ADMIN_EMAIL") || "admin@example.com";
    
    const emailHtml = `
      <h1>🎨 New Canvas Print Order!</h1>
      <p>A new canvas print order requires fulfillment.</p>
      
      <h2>Order Details</h2>
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Order ID:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${orderId}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Customer:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${userName} (${userEmail})</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Product:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${artDescription}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">€${(paymentAmount / 100).toFixed(2)}</td>
        </tr>
      </table>

      ${shippingAddress ? `
      <h2>Shipping Address</h2>
      <p>
        ${shippingAddress.name}<br>
        ${shippingAddress.street}<br>
        ${shippingAddress.city}, ${shippingAddress.postalCode}<br>
        ${shippingAddress.country}
      </p>
      ` : "<p><em>No shipping address provided yet - customer will be contacted.</em></p>"}

      <h2>Images for Print</h2>
      <p><strong>Original Photo:</strong></p>
      <p><a href="${imageUrl}">${imageUrl}</a></p>
      
      ${generatedArtUrl ? `
      <p><strong>Generated Renaissance Art:</strong></p>
      <p><a href="${generatedArtUrl}">${generatedArtUrl}</a></p>
      ` : "<p><em>Art generation pending - will be processed separately.</em></p>"}

      <hr>
      <p style="color: #666;">
        <small>
          This order requires manual fulfillment. Please download the high-res art, 
          prepare the canvas print, and arrange shipping.
        </small>
      </p>
    `;

    // Use fetch to call Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Ancestor Twin <orders@resend.dev>",
        to: [adminEmailAddress],
        subject: `🎨 New Canvas Print Order #${orderId.slice(0, 8)} - ${userName}`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("[CANVAS-PRINT] Email sent:", emailResult);

    // Save order to database
    const { error: insertError } = await supabaseClient
      .from("canvas_print_orders")
      .insert({
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        order_id: orderId,
        original_image_url: imageUrl,
        generated_art_url: generatedArtUrl,
        tier,
        payment_amount: paymentAmount,
        shipping_address: shippingAddress,
        status: "pending_fulfillment",
        email_sent: true,
      });

    if (insertError) {
      console.error("[CANVAS-PRINT] Database insert error:", insertError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Admin notified successfully",
        orderId 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[CANVAS-PRINT] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
