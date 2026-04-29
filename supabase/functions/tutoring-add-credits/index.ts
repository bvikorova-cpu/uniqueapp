import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Server-side authoritative price → credits mapping. NEVER trust the client.
const PRICE_TO_CREDITS: Record<string, number> = {
  price_1ScY0zGaXSfGtYFtoe91oxmX: 10,
  price_1ScY10GaXSfGtYFt3F1cPJaE: 30,
  price_1ScY12GaXSfGtYFt3zw96KfT: 100,
};

const log = (s: string, d?: unknown) =>
  console.log(`[tutoring-add-credits] ${s}${d ? " " + JSON.stringify(d) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    const body = await req.json().catch(() => ({}));
    const sessionId: string | undefined = body.session_id;

    if (!sessionId || typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
      throw new Error("Missing or invalid session_id");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) throw new Error("Not authenticated");
    const user = userData.user;

    // Idempotency: if this session was already credited, return success without adding again.
    const { data: existing } = await supabaseAdmin
      .from("tutoring_credit_transactions")
      .select("id, delta")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();
    if (existing) {
      log("already credited", { sessionId, delta: existing.delta });
      return new Response(
        JSON.stringify({ success: true, alreadyCredited: true, credits: existing.delta }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    // Verify the Stripe session: must be paid, must belong to this user, must use a known price.
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer"],
    });

    if (session.payment_status !== "paid") {
      throw new Error(`Session not paid (status: ${session.payment_status})`);
    }

    // Confirm the customer email matches the authenticated user
    const sessionEmail =
      (session.customer_details?.email ||
        (typeof session.customer === "object" && session.customer && "email" in session.customer
          ? (session.customer as Stripe.Customer).email
          : null)) ?? null;
    if (!sessionEmail || sessionEmail.toLowerCase() !== (user.email || "").toLowerCase()) {
      throw new Error("Session does not belong to this user");
    }

    // Resolve credits from the Stripe price id (not from anything the client sent)
    const priceId = session.line_items?.data?.[0]?.price?.id;
    if (!priceId || !(priceId in PRICE_TO_CREDITS)) {
      throw new Error(`Unknown or missing price_id: ${priceId ?? "null"}`);
    }
    const credits = PRICE_TO_CREDITS[priceId];

    // Apply: upsert tutoring_credits + write audit trail in a single logical step
    const { data: existingCredits } = await supabaseAdmin
      .from("tutoring_credits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingCredits) {
      const { error } = await supabaseAdmin
        .from("tutoring_credits")
        .update({
          credits_remaining: existingCredits.credits_remaining + credits,
          total_credits_purchased: existingCredits.total_credits_purchased + credits,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin.from("tutoring_credits").insert({
        user_id: user.id,
        credits_remaining: credits,
        total_credits_purchased: credits,
      });
      if (error) throw error;
    }

    // Audit log (also acts as idempotency key via unique stripe_session_id index)
    const { error: txErr } = await supabaseAdmin
      .from("tutoring_credit_transactions")
      .insert({
        user_id: user.id,
        delta: credits,
        reason: "stripe_purchase",
        stripe_session_id: sessionId,
      });
    if (txErr) {
      // If unique index trips, another concurrent call already credited — that's fine.
      log("tx insert error (likely race)", { msg: txErr.message });
    }

    log("credited", { user: user.id, credits, sessionId });
    return new Response(
      JSON.stringify({ success: true, credits }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
