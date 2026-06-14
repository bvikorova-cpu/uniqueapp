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

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const userId = userData.user?.id || null;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let body: any = {};
    try { body = await req.json(); } catch {}
    const { sessionId } = body;
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Missing session ID" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ success: false, error: "Payment not completed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const type = session.metadata?.type;
    const metaUserId = session.metadata?.user_id || userId;

    if (type === "phobia_credits" && metaUserId) {
      const credits = parseInt(session.metadata?.credits || "0");
      if (credits > 0) {
        const { data: existing } = await supabase
          .from("phobia_credits")
          .select("*")
          .eq("user_id", metaUserId)
          .maybeSingle();

        if (existing) {
          await supabase.from("phobia_credits").update({
            credits_remaining: existing.credits_remaining + credits,
            total_credits_purchased: existing.total_credits_purchased + credits,
            updated_at: new Date().toISOString(),
          }).eq("user_id", metaUserId);
        } else {
          await supabase.from("phobia_credits").insert({
            user_id: metaUserId,
            credits_remaining: 5 + credits,
            total_credits_purchased: credits,
          });
        }
      }

      return new Response(JSON.stringify({ success: true, serviceType: `${credits} credits` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "phobia_subscription") {
      return new Response(JSON.stringify({ success: true, serviceType: "Premium Subscription" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Legacy fallback
    return new Response(JSON.stringify({ success: true, serviceType: session.metadata?.service_type || "Unknown" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
