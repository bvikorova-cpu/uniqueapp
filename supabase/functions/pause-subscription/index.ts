import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (s: string, d?: any) =>
  console.log(`[PAUSE-SUBSCRIPTION] ${s}${d ? " - " + JSON.stringify(d) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(userError.message);
    const user = userData.user;
    if (!user?.email || !user?.id) throw new Error("User not authenticated");

    const { months = 1 } = await req.json().catch(() => ({}));
    log("Pause request", { user: user.email, months });

    // Load config
    const { data: cfg } = await supabase
      .from("subscription_pause_config")
      .select("max_pauses_per_year, max_months_per_pause")
      .eq("id", 1)
      .single();
    const maxPauses = cfg?.max_pauses_per_year ?? 3;
    const maxMonths = cfg?.max_months_per_pause ?? 3;

    if (months > maxMonths) {
      return new Response(
        JSON.stringify({
          error: `Maximum pause duration is ${maxMonths} month(s).`,
          code: "MONTHS_EXCEEDED",
          limit: maxMonths,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Enforce yearly limit
    const { data: countData } = await supabase.rpc("get_user_pause_count", { _user_id: user.id });
    const usedCount = (countData as number) ?? 0;
    if (usedCount >= maxPauses) {
      return new Response(
        JSON.stringify({
          error: `You've reached the limit of ${maxPauses} pauses per year. Please wait or contact support.`,
          code: "PAUSE_LIMIT_REACHED",
          used: usedCount,
          limit: maxPauses,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) throw new Error("No Stripe customer found");
    const customerId = customers.data[0].id;

    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    if (subs.data.length === 0) throw new Error("No active subscription");

    const sub = subs.data[0];
    const resumesAt = Math.floor(Date.now() / 1000) + months * 30 * 24 * 60 * 60;

    const updated = await stripe.subscriptions.update(sub.id, {
      pause_collection: {
        behavior: "void",
        resumes_at: resumesAt,
      },
    });

    // Log it
    await supabase.from("subscription_pause_log").insert({
      user_id: user.id,
      user_email: user.email,
      stripe_subscription_id: updated.id,
      months,
      resumes_at: new Date(resumesAt * 1000).toISOString(),
    });

    log("Subscription paused", { id: updated.id, resumesAt, used: usedCount + 1, max: maxPauses });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Subscription paused for ${months} month(s)`,
        resumes_at: new Date(resumesAt * 1000).toISOString(),
        pauses_used: usedCount + 1,
        pauses_limit: maxPauses,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
