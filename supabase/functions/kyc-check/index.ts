import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (s: string, d?: unknown) =>
  console.log(`[KYC-CHECK] ${s}${d ? " - " + JSON.stringify(d) : ""}`);

/**
 * Polls Stripe Identity verification session and updates DB.
 * Frontend calls this on /account/verification page load (or after return_url redirect).
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
    if (!user) throw new Error("Not authenticated");

    const { data: row } = await supabase
      .from("creator_kyc_verifications")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!row) {
      return new Response(
        JSON.stringify({ status: "unverified" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!row.stripe_verification_session_id || row.status === "verified") {
      return new Response(
        JSON.stringify({
          status: row.status,
          verified_name: row.verified_name,
          verified_at: row.verified_at,
          rejection_reason: row.rejection_reason,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const session = await stripe.identity.verificationSessions.retrieve(
      row.stripe_verification_session_id,
      { expand: ["verified_outputs", "last_error"] },
    );
    log("retrieved", { id: session.id, status: session.status });

    let newStatus = row.status;
    const update: Record<string, unknown> = {};

    if (session.status === "verified") {
      newStatus = "verified";
      update.status = "verified";
      update.verified_at = new Date().toISOString();
      const out: any = (session as any).verified_outputs;
      if (out) {
        update.verified_name = [out.first_name, out.last_name].filter(Boolean).join(" ") || null;
        if (out.dob) {
          update.verified_dob = `${out.dob.year}-${String(out.dob.month).padStart(2, "0")}-${String(out.dob.day).padStart(2, "0")}`;
        }
        if (out.address?.country) update.verified_country = out.address.country;
        if (out.id_number_type) update.document_type = out.id_number_type;
      }
      update.rejection_reason = null;
    } else if (session.status === "requires_input") {
      newStatus = "requires_input";
      update.status = "requires_input";
      const err: any = (session as any).last_error;
      if (err?.reason) update.rejection_reason = err.reason;
    } else if (session.status === "canceled") {
      newStatus = "rejected";
      update.status = "rejected";
      update.rejected_at = new Date().toISOString();
      update.rejection_reason = "Verification canceled";
    } else {
      newStatus = "pending";
      update.status = "pending";
    }

    if (Object.keys(update).length > 0) {
      await supabase
        .from("creator_kyc_verifications")
        .update(update)
        .eq("user_id", user.id);
    }

    return new Response(
      JSON.stringify({
        status: newStatus,
        verified_name: update.verified_name ?? row.verified_name,
        rejection_reason: update.rejection_reason ?? row.rejection_reason,
      }),
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
