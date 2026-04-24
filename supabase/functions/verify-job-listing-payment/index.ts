// Verifies a Stripe checkout session for a job listing and activates the listing.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Missing sessionId");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ verified: false, status: session.payment_status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const meta = session.metadata || {};
    const productKey = meta.productKey;
    const jobListingId = meta.jobListingId;
    const userId = meta.userId;

    if (!jobListingId) throw new Error("Missing jobListingId in metadata");

    // Determine duration
    let durationDays = 7;
    let isFeatured = false;
    if (productKey === "job_listing_14") durationDays = 14;
    else if (productKey === "job_listing_30") durationDays = 30;
    else if (productKey === "job_listing_featured") {
      isFeatured = true;
      durationDays = 0; // featured upgrade only
    }

    // Record payment (idempotent)
    await supabase.from("job_listing_payments").upsert(
      {
        user_id: userId,
        job_listing_id: jobListingId,
        stripe_session_id: sessionId,
        amount: session.amount_total ?? 0,
        currency: (session.currency || "eur").toUpperCase(),
        product_kind: productKey,
        status: "completed",
        completed_at: new Date().toISOString(),
      },
      { onConflict: "stripe_session_id" }
    );

    // Activate listing
    if (isFeatured) {
      await supabase
        .from("job_listings")
        .update({ is_featured: true })
        .eq("id", jobListingId);
    } else {
      const publishedAt = new Date();
      const expiresAt = new Date(publishedAt.getTime() + durationDays * 86400000);
      await supabase
        .from("job_listings")
        .update({
          paid_status: "active",
          is_active: true,
          published_at: publishedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          duration_days: durationDays,
        })
        .eq("id", jobListingId);
    }

    return new Response(
      JSON.stringify({ verified: true, jobListingId, productKey }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("verify-job-listing-payment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
