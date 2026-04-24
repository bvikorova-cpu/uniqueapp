import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (s: string, d?: unknown) =>
  console.log(`[KYC-START] ${s}${d ? " - " + JSON.stringify(d) : ""}`);

/**
 * Starts a Stripe Identity Verification Session and returns hosted URL.
 * Reuses an existing pending session if one is in progress.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr) throw new Error(userErr.message);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check existing record
    const { data: existing } = await supabase
      .from("creator_kyc_verifications")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing?.status === "verified") {
      return new Response(
        JSON.stringify({ status: "verified", message: "Already verified" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Reuse pending session if recent and still usable
    if (
      existing?.stripe_verification_session_id &&
      existing?.status === "pending" &&
      existing?.stripe_verification_url
    ) {
      try {
        const sess = await stripe.identity.verificationSessions.retrieve(
          existing.stripe_verification_session_id,
        );
        if (sess.status === "requires_input") {
          return new Response(
            JSON.stringify({ url: existing.stripe_verification_url, session_id: sess.id }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      } catch (_) { /* fall through to create new */ }
    }

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";
    const session = await stripe.identity.verificationSessions.create({
      type: "document",
      provided_details: { email: user.email },
      metadata: { user_id: user.id, email: user.email },
      return_url: `${origin}/account/verification?session=${"{VERIFICATION_SESSION_ID}"}`,
      options: {
        document: {
          allowed_types: ["driving_license", "passport", "id_card"],
          require_matching_selfie: true,
          require_live_capture: true,
        },
      },
    });

    log("session created", { id: session.id });

    await supabase.from("creator_kyc_verifications").upsert(
      {
        user_id: user.id,
        email: user.email,
        status: "pending",
        stripe_verification_session_id: session.id,
        stripe_verification_url: session.url,
        submitted_at: new Date().toISOString(),
        rejection_reason: null,
      },
      { onConflict: "user_id" },
    );

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
