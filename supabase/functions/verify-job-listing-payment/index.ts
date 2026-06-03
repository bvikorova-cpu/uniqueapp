// Verifies a Stripe checkout session for a job listing and activates the listing.
// Hardened: requires JWT, enforces ownership match against Stripe metadata.
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
    // ---- Auth ----------------------------------------------------------
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claimsData, error: claimsErr } = await authClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = claimsData.claims.sub as string;

    // ---- Input ---------------------------------------------------------
    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId : null;
    if (!sessionId || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
      return new Response(JSON.stringify({ error: "Invalid sessionId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const meta = (session.metadata || {}) as Record<string, string>;
    const productKey = meta.productKey;
    const jobListingId = meta.jobListingId;
    const ownerId = meta.userId;

    if (!jobListingId) {
      return new Response(JSON.stringify({ error: "Missing jobListingId in metadata" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (ownerId && ownerId !== callerId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ verified: false, status: session.payment_status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Double-check listing ownership against DB row.
    const { data: listing, error: listingErr } = await admin
      .from("job_listings")
      .select("employer_id")
      .eq("id", jobListingId)
      .maybeSingle();
    if (listingErr || !listing) {
      return new Response(JSON.stringify({ error: "Listing not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (listing.employer_id !== callerId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine duration
    let durationDays = 7;
    let isFeatured = false;
    if (productKey === "job_listing_14") durationDays = 14;
    else if (productKey === "job_listing_30") durationDays = 30;
    else if (productKey === "job_listing_featured") {
      isFeatured = true;
      durationDays = 0;
    }

    // Record payment (idempotent on stripe_session_id)
    await admin.from("job_listing_payments").upsert(
      {
        user_id: callerId,
        job_id: jobListingId,
        stripe_session_id: sessionId,
        amount: session.amount_total ?? 0,
        duration_days: durationDays,
        status: "completed",
      },
      { onConflict: "stripe_session_id" }
    );

    if (isFeatured) {
      // Featured boost: 30 days from now or extend existing featured window
      const { data: cur } = await admin
        .from("job_listings")
        .select("featured_until")
        .eq("id", jobListingId)
        .maybeSingle();
      const base = cur?.featured_until && new Date(cur.featured_until) > new Date()
        ? new Date(cur.featured_until)
        : new Date();
      const featuredUntil = new Date(base.getTime() + 30 * 86400000);
      await admin
        .from("job_listings")
        .update({ is_featured: true, featured_until: featuredUntil.toISOString() })
        .eq("id", jobListingId);
    } else {
      // Renewal aware: extend from GREATEST(now, expires_at)
      const { data: cur } = await admin
        .from("job_listings")
        .select("expires_at, published_at")
        .eq("id", jobListingId)
        .maybeSingle();
      const now = new Date();
      const baseDate = cur?.expires_at && new Date(cur.expires_at) > now
        ? new Date(cur.expires_at)
        : now;
      const expiresAt = new Date(baseDate.getTime() + durationDays * 86400000);
      await admin
        .from("job_listings")
        .update({
          paid_status: "active",
          is_active: true,
          published_at: cur?.published_at ?? now.toISOString(),
          expires_at: expiresAt.toISOString(),
          duration_days: durationDays,
        })
        .eq("id", jobListingId);

      // Notify renewal success
      await admin.from("notifications").insert({
        user_id: callerId,
        type: "job_listing_renewed",
        title: "Job listing renewed",
        message: `Your listing is active until ${expiresAt.toISOString().slice(0,10)}.`,
        related_id: jobListingId,
        action_url: "/employer/dashboard",
      });
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
